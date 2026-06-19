import { prisma } from "@/lib/db";
import { getAvailableReferralBalance } from "@/lib/referral-service";
import type { Prisma } from "@prisma/client";

type TxClient = Prisma.TransactionClient;

export const MONTHLY_WITHDRAWAL_COOLDOWN_DAYS = 30;
export const REFERRAL_SLA_HOURS = 48;

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const MS_PER_HOUR = 1000 * 60 * 60;

export async function getAvailableMonthlyBalance(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { monthlyIncomeBalance: true },
  });
  if (!user) return 0;

  const pending = await prisma.withdrawal.aggregate({
    where: {
      userId,
      type: "MONTHLY_INCOME",
      status: "PENDING",
    },
    _sum: { amount: true },
  });

  const reserved = pending._sum.amount ?? 0;
  return Math.max(0, user.monthlyIncomeBalance - reserved);
}

export async function getDaysUntilMonthlyWithdrawal(userId: string): Promise<number> {
  const lastApproved = await prisma.withdrawal.findFirst({
    where: {
      userId,
      type: "MONTHLY_INCOME",
      status: "APPROVED",
      processedAt: { not: null },
    },
    orderBy: { processedAt: "desc" },
  });

  if (!lastApproved?.processedAt) return 0;

  const elapsedDays = Math.floor(
    (Date.now() - lastApproved.processedAt.getTime()) / MS_PER_DAY
  );
  return Math.max(0, MONTHLY_WITHDRAWAL_COOLDOWN_DAYS - elapsedDays);
}

export async function hasPendingMonthlyWithdrawal(userId: string): Promise<boolean> {
  const count = await prisma.withdrawal.count({
    where: { userId, type: "MONTHLY_INCOME", status: "PENDING" },
  });
  return count > 0;
}

export async function hasPendingReferralWithdrawal(userId: string): Promise<boolean> {
  const count = await prisma.withdrawal.count({
    where: { userId, type: "REFERRAL_INCOME", status: "PENDING" },
  });
  return count > 0;
}

export async function canRequestMonthlyWithdrawal(userId: string): Promise<boolean> {
  if (await hasPendingMonthlyWithdrawal(userId)) return false;
  const days = await getDaysUntilMonthlyWithdrawal(userId);
  if (days > 0) return false;
  const available = await getAvailableMonthlyBalance(userId);
  return available > 0;
}

export async function canRequestReferralWithdrawal(userId: string): Promise<boolean> {
  if (await hasPendingReferralWithdrawal(userId)) return false;
  const available = await getAvailableReferralBalance(userId);
  return available > 0;
}

export async function validateMonthlyWithdrawal(userId: string, amount: number) {
  if (await hasPendingMonthlyWithdrawal(userId)) {
    throw new Error("You already have a pending monthly income withdrawal");
  }

  const days = await getDaysUntilMonthlyWithdrawal(userId);
  if (days > 0) {
    throw new Error(
      `Monthly income withdrawal available in ${days} day(s) (30-day rule after last approved payout)`
    );
  }

  const available = await getAvailableMonthlyBalance(userId);
  if (amount > available) {
    throw new Error(
      `Insufficient monthly income balance. Available: ₹${available.toLocaleString("en-IN")}`
    );
  }
}

export async function validateReferralWithdrawal(userId: string, amount: number) {
  if (await hasPendingReferralWithdrawal(userId)) {
    throw new Error("You already have a pending referral income withdrawal");
  }

  const available = await getAvailableReferralBalance(userId);
  if (amount > available) {
    throw new Error(
      `Insufficient referral balance. Available: ₹${available.toLocaleString("en-IN")}`
    );
  }
}

export async function creditMonthlyIncome(
  userId: string,
  amount: number,
  tx?: TxClient
) {
  if (amount <= 0) return;
  const db = tx ?? prisma;
  await db.user.update({
    where: { id: userId },
    data: { monthlyIncomeBalance: { increment: amount } },
  });
}

export async function deductMonthlyBalance(
  userId: string,
  amount: number,
  strict = true
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { monthlyIncomeBalance: true },
  });
  if (!user) throw new Error("User not found");

  if (strict && user.monthlyIncomeBalance < amount) {
    throw new Error("Insufficient monthly income balance");
  }

  const next = Math.max(0, user.monthlyIncomeBalance - amount);
  await prisma.user.update({
    where: { id: userId },
    data: { monthlyIncomeBalance: next },
  });

  return next;
}

export function referralWithdrawalOverdueHours(requestedAt: Date): number {
  return Math.floor((Date.now() - requestedAt.getTime()) / MS_PER_HOUR);
}

export function isReferralSlaOverdue(
  type: string,
  status: string,
  requestedAt: Date
): boolean {
  return (
    type === "REFERRAL_INCOME" &&
    status === "PENDING" &&
    referralWithdrawalOverdueHours(requestedAt) > REFERRAL_SLA_HOURS
  );
}

export async function getWithdrawalLimits(userId: string) {
  const [
    monthlyAvailable,
    referralAvailable,
    daysUntilMonthly,
    canWithdrawMonthly,
    canWithdrawReferral,
  ] = await Promise.all([
    getAvailableMonthlyBalance(userId),
    getAvailableReferralBalance(userId),
    getDaysUntilMonthlyWithdrawal(userId),
    canRequestMonthlyWithdrawal(userId),
    canRequestReferralWithdrawal(userId),
  ]);

  return {
    monthlyAvailable,
    referralAvailable,
    daysUntilMonthly,
    canWithdrawMonthly,
    canWithdrawReferral,
  };
}
