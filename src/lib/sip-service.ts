import { prisma } from "@/lib/db";
import {
  InvoiceStatus,
  SipStatus,
  UserNotificationType,
  type Prisma,
} from "@prisma/client";

type TxClient = Prisma.TransactionClient;

const MIN_PERCENT = 30;
const MAX_PERCENT = 50;

async function nextInvoiceNo(tx: TxClient): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  const latest = await tx.invoice.findFirst({
    where: { invoiceNo: { startsWith: prefix } },
    orderBy: { invoiceNo: "desc" },
  });
  const next = latest
    ? parseInt(latest.invoiceNo.slice(prefix.length), 10) + 1
    : 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}

function sameCalendarMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function calcSipAmount(grossIncome: number, percentOfIncome: number): number {
  const pct = Math.min(MAX_PERCENT, Math.max(MIN_PERCENT, percentOfIncome));
  return Math.round(grossIncome * (pct / 100));
}

export async function getUserMonthlyIncome(userId: string): Promise<number> {
  const result = await prisma.investment.aggregate({
    where: { userId, status: "ACTIVE" },
    _sum: { monthlyIncome: true },
  });
  return result._sum.monthlyIncome ?? 0;
}

export async function enrollSip(
  userId: string,
  lockYears: 1 | 3 | 5,
  percentOfIncome: number
) {
  if (percentOfIncome < MIN_PERCENT || percentOfIncome > MAX_PERCENT) {
    throw new Error(`Allocation must be between ${MIN_PERCENT}% and ${MAX_PERCENT}%`);
  }

  const grossIncome = await getUserMonthlyIncome(userId);
  if (grossIncome <= 0) {
    throw new Error("Active investment required to start SIP");
  }

  const existing = await prisma.sipPlan.findFirst({
    where: { userId, status: SipStatus.ACTIVE },
  });
  if (existing) {
    throw new Error("You already have an active SIP plan");
  }

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + lockYears);
  const monthlyAmount = calcSipAmount(grossIncome, percentOfIncome);

  const sip = await prisma.sipPlan.create({
    data: {
      userId,
      lockYears,
      percentOfIncome,
      monthlyAmount,
      startDate,
      endDate,
      status: SipStatus.ACTIVE,
    },
  });

  await prisma.userNotification.create({
    data: {
      userId,
      title: "SIP Started",
      message: `Your ${lockYears}-year SIP is active. ${percentOfIncome}% (₹${monthlyAmount.toLocaleString("en-IN")}/month) will be deducted from monthly income.`,
      type: UserNotificationType.SIP,
    },
  });

  return sip;
}

export async function updateSipAllocation(userId: string, percentOfIncome: number) {
  if (percentOfIncome < MIN_PERCENT || percentOfIncome > MAX_PERCENT) {
    throw new Error(`Allocation must be between ${MIN_PERCENT}% and ${MAX_PERCENT}%`);
  }

  const sip = await prisma.sipPlan.findFirst({
    where: { userId, status: SipStatus.ACTIVE },
  });
  if (!sip) throw new Error("No active SIP plan");

  const grossIncome = await getUserMonthlyIncome(userId);
  const monthlyAmount = calcSipAmount(grossIncome, percentOfIncome);

  return prisma.sipPlan.update({
    where: { id: sip.id },
    data: { percentOfIncome, monthlyAmount },
  });
}

export async function processMonthlySip(
  userId: string,
  grossIncome: number,
  tx?: TxClient
) {
  const db = tx ?? prisma;

  const sip = await db.sipPlan.findFirst({
    where: { userId, status: SipStatus.ACTIVE },
  });

  if (!sip || grossIncome <= 0) {
    return { sipAmount: 0, skipped: true as const, reason: "no_active_sip" as const };
  }

  const now = new Date();
  if (sip.endDate <= now) {
    return { sipAmount: 0, skipped: true as const, reason: "matured" as const };
  }

  if (sip.lastContributionAt && sameCalendarMonth(sip.lastContributionAt, now)) {
    return { sipAmount: 0, skipped: true as const, reason: "already_contributed" as const };
  }

  const sipAmount = calcSipAmount(grossIncome, sip.percentOfIncome);
  if (sipAmount <= 0) {
    return { sipAmount: 0, skipped: true as const, reason: "zero_amount" as const };
  }

  const run = async (client: TxClient) => {
    await client.sipContribution.create({
      data: {
        sipPlanId: sip.id,
        amount: sipAmount,
        grossIncome,
        contributedAt: now,
      },
    });

    await client.sipPlan.update({
      where: { id: sip.id },
      data: {
        totalContributed: { increment: sipAmount },
        lastContributionAt: now,
      },
    });

    const invoiceNo = await nextInvoiceNo(client);
    await client.invoice.create({
      data: {
        userId,
        invoiceNo,
        type: "SIP Contribution",
        amount: sipAmount,
        status: InvoiceStatus.PAID,
      },
    });

    await client.userNotification.create({
      data: {
        userId,
        title: "SIP Contribution",
        message: `₹${sipAmount.toLocaleString("en-IN")} deducted from your monthly income for SIP.`,
        type: UserNotificationType.SIP,
      },
    });
  };

  if (tx) {
    await run(tx);
  } else {
    await prisma.$transaction(run);
  }

  return { sipAmount, skipped: false as const };
}

export async function completeMatureSips() {
  const now = new Date();
  const mature = await prisma.sipPlan.findMany({
    where: { status: SipStatus.ACTIVE, endDate: { lte: now } },
    select: { id: true, userId: true, lockYears: true, totalContributed: true },
  });

  if (mature.length === 0) return { completed: 0 };

  await prisma.$transaction([
    prisma.sipPlan.updateMany({
      where: { id: { in: mature.map((s) => s.id) } },
      data: { status: SipStatus.COMPLETED },
    }),
    ...mature.map((s) =>
      prisma.userNotification.create({
        data: {
          userId: s.userId,
          title: "SIP Lock Completed",
          message: `Your ${s.lockYears}-year SIP lock has ended. Total contributed: ₹${s.totalContributed.toLocaleString("en-IN")}.`,
          type: UserNotificationType.SIP,
        },
      })
    ),
  ]);

  return { completed: mature.length };
}

export function daysUntil(endDate: Date): number {
  const diff = endDate.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
