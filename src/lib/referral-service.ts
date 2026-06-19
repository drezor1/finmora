import { prisma } from "@/lib/db";
import {
  InvoiceStatus,
  PenaltyStatus,
  ReferralEarningStatus,
  UserNotificationType,
  type Prisma,
} from "@prisma/client";

type TxClient = Prisma.TransactionClient;

async function nextInvoiceNo(tx: TxClient): Promise<string> {
  const year = new Date().getFullYear();
  const count = await tx.invoice.count({
    where: { invoiceNo: { startsWith: `INV-${year}-` } },
  });
  return `INV-${year}-${String(count + 1).padStart(3, "0")}`;
}

export async function approveReferralPayouts(referrerId: string) {
  const pending = await prisma.referralEarning.findMany({
    where: { referrerId, status: ReferralEarningStatus.PENDING },
  });

  if (pending.length === 0) {
    return { approvedAmount: 0, count: 0 };
  }

  const total = pending.reduce((s, e) => s + e.commission, 0);
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.referralEarning.updateMany({
      where: { referrerId, status: ReferralEarningStatus.PENDING },
      data: { status: ReferralEarningStatus.PAID, paidAt: now },
    });

    await tx.user.update({
      where: { id: referrerId },
      data: { referralBalance: { increment: total } },
    });

    const invoiceNo = await nextInvoiceNo(tx);
    await tx.invoice.create({
      data: {
        userId: referrerId,
        invoiceNo,
        type: "Referral Commission Payout",
        amount: total,
        status: InvoiceStatus.PAID,
      },
    });

    await tx.userNotification.create({
      data: {
        userId: referrerId,
        title: "Referral Payout Approved",
        message: `₹${total.toLocaleString("en-IN")} referral commission has been credited to your balance.`,
        type: UserNotificationType.REFERRAL,
      },
    });
  });

  return { approvedAmount: total, count: pending.length };
}

export async function deductReferralBalance(
  userId: string,
  amount: number,
  strict = true
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralBalance: true },
  });
  if (!user) throw new Error("User not found");

  if (strict && user.referralBalance < amount) {
    throw new Error("Insufficient referral balance");
  }

  const next = Math.max(0, user.referralBalance - amount);
  await prisma.user.update({
    where: { id: userId },
    data: { referralBalance: next },
  });

  return next;
}

export async function getAvailableReferralBalance(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralBalance: true },
  });
  if (!user) return 0;

  const pendingWithdrawals = await prisma.withdrawal.aggregate({
    where: {
      userId,
      type: "REFERRAL_INCOME",
      status: "PENDING",
    },
    _sum: { amount: true },
  });

  const reserved = pendingWithdrawals._sum.amount ?? 0;
  return Math.max(0, user.referralBalance - reserved);
}

export async function reversePenalty(penaltyId: string) {
  const penalty = await prisma.referralPenalty.findUnique({
    where: { id: penaltyId },
  });
  if (!penalty) throw new Error("Penalty not found");
  if (penalty.status === PenaltyStatus.REVERSED) {
    return { alreadyReversed: true };
  }

  await prisma.$transaction([
    prisma.referralPenalty.update({
      where: { id: penaltyId },
      data: { status: PenaltyStatus.REVERSED },
    }),
    prisma.user.update({
      where: { id: penalty.userId },
      data: { referralBalance: { increment: penalty.amount } },
    }),
    prisma.userNotification.create({
      data: {
        userId: penalty.userId,
        title: "Penalty Reversed",
        message: `A referral penalty of ₹${penalty.amount.toLocaleString("en-IN")} has been reversed.`,
        type: UserNotificationType.REFERRAL,
      },
    }),
  ]);

  return { alreadyReversed: false, restoredAmount: penalty.amount };
}
