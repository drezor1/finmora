import { prisma } from "@/lib/db";
import {
  InvestmentStatus,
  KycStatus,
  NotificationChannel,
  UserNotificationType,
  WithdrawalStatus,
  type AdminNotification,
} from "@prisma/client";

export const AUDIENCE_KEYS = [
  "allUsers",
  "activeInvestors",
  "pendingKyc",
  "pendingWithdrawals",
] as const;

export type AudienceKey = (typeof AUDIENCE_KEYS)[number];

export type AdminNotifyChannel = "in_app" | "email" | "both";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  userName?: string
): Promise<{ sent: boolean; mock?: boolean }> {
  const from = process.env.EMAIL_FROM;
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || !from) {
    console.info("[email:mock]", { to, subject, text: text.slice(0, 80) });
    return { sent: false, mock: true };
  }

  const greeting = userName ? `<p>Hi ${escapeHtml(userName)},</p>` : "";
  const html = `${greeting}<p>${escapeHtml(text).replace(/\n/g, "<br/>")}</p><p style="color:#64748b;font-size:12px;">— Finmora</p>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend failed: ${err}`);
  }

  return { sent: true };
}

export async function notifyUser(
  userId: string,
  payload: {
    title: string;
    message: string;
    type: UserNotificationType;
    sendEmail?: boolean;
  }
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });
  if (!user) return;

  await prisma.userNotification.create({
    data: {
      userId,
      title: payload.title,
      message: payload.message,
      type: payload.type,
    },
  });

  if (payload.sendEmail && user.email) {
    try {
      await sendEmail(user.email, payload.title, payload.message, user.name);
    } catch (e) {
      console.error("[notifyUser email]", e);
    }
  }
}

export async function resolveAudience(audience: string) {
  const key = audience as AudienceKey;

  switch (key) {
    case "activeInvestors":
      return prisma.user.findMany({
        where: {
          investments: { some: { status: InvestmentStatus.ACTIVE } },
        },
        select: { id: true, email: true, name: true },
      });
    case "pendingKyc":
      return prisma.user.findMany({
        where: { kycStatus: KycStatus.PENDING },
        select: { id: true, email: true, name: true },
      });
    case "pendingWithdrawals":
      return prisma.user.findMany({
        where: {
          withdrawals: { some: { status: WithdrawalStatus.PENDING } },
        },
        select: { id: true, email: true, name: true },
      });
    case "allUsers":
    default:
      return prisma.user.findMany({
        where: { role: "USER" },
        select: { id: true, email: true, name: true },
      });
  }
}

export function toDbChannel(channel: AdminNotifyChannel): NotificationChannel {
  switch (channel) {
    case "in_app":
      return NotificationChannel.IN_APP;
    case "email":
      return NotificationChannel.EMAIL;
    case "both":
      return NotificationChannel.BOTH;
  }
}

export function channelSendsInApp(channel: NotificationChannel): boolean {
  return (
    channel === NotificationChannel.IN_APP || channel === NotificationChannel.BOTH
  );
}

export function channelSendsEmail(channel: NotificationChannel): boolean {
  return (
    channel === NotificationChannel.EMAIL || channel === NotificationChannel.BOTH
  );
}

export async function dispatchAdminNotification(
  notification: Pick<
    AdminNotification,
    "id" | "title" | "message" | "channel" | "audience"
  >
): Promise<number> {
  const users = await resolveAudience(notification.audience);
  let recipientCount = 0;

  for (const user of users) {
    let delivered = false;

    if (channelSendsInApp(notification.channel)) {
      await prisma.userNotification.create({
        data: {
          userId: user.id,
          title: notification.title,
          message: notification.message,
          type: UserNotificationType.GENERAL,
        },
      });
      delivered = true;
    }

    if (channelSendsEmail(notification.channel) && user.email) {
      try {
        const result = await sendEmail(
          user.email,
          notification.title,
          notification.message,
          user.name
        );
        if (result.sent || result.mock) delivered = true;
      } catch (e) {
        console.error("[dispatchAdminNotification email]", user.id, e);
      }
    }

    if (delivered) recipientCount++;
  }

  await prisma.adminNotification.update({
    where: { id: notification.id },
    data: {
      status: "SENT",
      sentAt: new Date(),
      recipientCount,
    },
  });

  return recipientCount;
}

export async function processScheduledNotifications(): Promise<number> {
  const due = await prisma.adminNotification.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { lte: new Date() },
    },
  });

  let total = 0;
  for (const n of due) {
    total += await dispatchAdminNotification(n);
  }
  return total;
}

export function formatAudienceLabel(key: string): string {
  const labels: Record<string, string> = {
    allUsers: "All Users",
    activeInvestors: "Active Investors",
    pendingKyc: "Pending KYC Users",
    pendingWithdrawals: "Pending Withdrawal Users",
  };
  return labels[key] ?? key;
}

export function toAdminChannel(
  channel: NotificationChannel
): AdminNotifyChannel | "sms" | "push" {
  switch (channel) {
    case NotificationChannel.IN_APP:
      return "in_app";
    case NotificationChannel.EMAIL:
      return "email";
    case NotificationChannel.BOTH:
      return "both";
    case NotificationChannel.SMS:
      return "sms";
    case NotificationChannel.PUSH:
      return "push";
    default:
      return "in_app";
  }
}
