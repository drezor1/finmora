import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/api-auth";
import { formatDate } from "@/lib/serializers";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: {
      referralCode: true,
      referralBalance: true,
      _count: { select: { referrals: true } },
    },
  });

  const earnings = await prisma.referralEarning.findMany({
    where: { referrerId: auth.userId },
    include: { referredUser: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const networkUsers = await prisma.user.findMany({
    where: { referredById: auth.userId },
    select: {
      id: true,
      name: true,
      createdAt: true,
      investments: { select: { amount: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingWithdrawals = await prisma.withdrawal.aggregate({
    where: {
      userId: auth.userId,
      type: "REFERRAL_INCOME",
      status: "PENDING",
    },
    _sum: { amount: true },
  });

  const reserved = pendingWithdrawals._sum.amount ?? 0;
  const availableBalance = Math.max(0, (user?.referralBalance ?? 0) - reserved);

  const totalEarnings = earnings.reduce((s, e) => s + e.commission, 0);
  const pendingEarnings = earnings
    .filter((e) => e.status === "PENDING")
    .reduce((s, e) => s + e.commission, 0);

  return NextResponse.json({
    referralCode: user?.referralCode,
    totalReferrals: user?._count.referrals ?? 0,
    totalEarnings,
    pendingEarnings,
    availableBalance,
    network: networkUsers.map((u) => ({
      id: u.id,
      name: u.name,
      joinDate: formatDate(u.createdAt),
      totalDeposit: u.investments.reduce((s, i) => s + i.amount, 0),
    })),
    earnings: earnings.map((e) => ({
      id: e.id,
      name: e.referredUser.name,
      date: formatDate(e.createdAt),
      deposit: e.depositAmount,
      commission: e.commission,
      status: e.status === "PAID" ? "paid" : "pending",
    })),
  });
}
