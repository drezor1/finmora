import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const [
    totalUsers,
    pendingKyc,
    investments,
    pendingWithdrawals,
    activeSipUsers,
    activeAds,
    referralSum,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.user.count({ where: { kycStatus: "PENDING", role: "USER" } }),
    prisma.investment.aggregate({ _sum: { amount: true } }),
    prisma.withdrawal.findMany({ where: { status: "PENDING" } }),
    prisma.sipPlan.count({ where: { status: "ACTIVE" } }),
    prisma.ad.count({ where: { status: "ACTIVE" } }),
    prisma.referralEarning.aggregate({ _sum: { commission: true } }),
  ]);

  const pendingAmount = pendingWithdrawals.reduce((s, w) => s + w.amount, 0);

  return NextResponse.json({
    totalUsers,
    pendingKyc,
    totalInvested: investments._sum.amount ?? 0,
    pendingWithdrawals: pendingWithdrawals.length,
    pendingWithdrawalAmount: pendingAmount,
    activeSipUsers,
    activeAds,
    totalReferralPayouts: referralSum._sum.commission ?? 0,
  });
}
