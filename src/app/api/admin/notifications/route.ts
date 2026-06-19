import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, jsonError } from "@/lib/api-auth";
import { notificationSchema } from "@/lib/validators/auth";
import { formatDateTime } from "@/lib/serializers";
import {
  dispatchAdminNotification,
  formatAudienceLabel,
  toAdminChannel,
  toDbChannel,
} from "@/lib/notification-service";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const items = await prisma.adminNotification.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    items.map((n) => ({
      id: n.id,
      title: n.title,
      channel: toAdminChannel(n.channel),
      audience: n.audience,
      audienceLabel: formatAudienceLabel(n.audience),
      recipientCount: n.recipientCount,
      sentAt: n.sentAt
        ? formatDateTime(n.sentAt)
        : n.scheduledAt
          ? formatDateTime(n.scheduledAt)
          : "",
      status: n.status.toLowerCase(),
    }))
  );
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const parsed = notificationSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid notification");

  const isScheduled = Boolean(parsed.data.scheduledAt);
  const dbChannel = toDbChannel(parsed.data.channel);

  const notification = await prisma.adminNotification.create({
    data: {
      title: parsed.data.title,
      message: parsed.data.message,
      channel: dbChannel,
      audience: parsed.data.audience,
      status: isScheduled ? "SCHEDULED" : "SENT",
      scheduledAt: isScheduled ? new Date(parsed.data.scheduledAt!) : null,
      sentAt: isScheduled ? null : new Date(),
      recipientCount: 0,
    },
  });

  let recipientCount = 0;
  if (!isScheduled) {
    recipientCount = await dispatchAdminNotification(notification);
  }

  return NextResponse.json({
    id: notification.id,
    title: notification.title,
    channel: parsed.data.channel,
    audience: notification.audience,
    audienceLabel: formatAudienceLabel(notification.audience),
    recipientCount,
    sentAt: notification.sentAt
      ? formatDateTime(notification.sentAt)
      : notification.scheduledAt
        ? formatDateTime(notification.scheduledAt)
        : "",
    status: notification.status.toLowerCase(),
  });
}
