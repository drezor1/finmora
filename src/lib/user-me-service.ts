import { prisma } from "@/lib/db";
import { toKycStatus } from "@/lib/serializers";
import {
  getAvailableMonthlyBalance,
  getDaysUntilMonthlyWithdrawal,
} from "@/lib/withdrawal-service";

export async function getUserMePayload(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      referredBy: { select: { referralCode: true, name: true } },
      investments: {
        where: { status: "ACTIVE" },
        orderBy: { startDate: "desc" },
        take: 1,
      },
      _count: { select: { referrals: true } },
    },
  });

  if (!user) return null;

  const investments = await prisma.investment.findMany({
    where: { userId, status: "ACTIVE" },
  });
  const totalInvestment = investments.reduce((s, i) => s + i.amount, 0);
  const monthlyIncome = investments.reduce((s, i) => s + i.monthlyIncome, 0);

  const referralEarnings = await prisma.referralEarning.aggregate({
    where: { referrerId: userId },
    _sum: { commission: true },
  });

  const pendingReferralWithdrawals = await prisma.withdrawal.aggregate({
    where: {
      userId,
      type: "REFERRAL_INCOME",
      status: "PENDING",
    },
    _sum: { amount: true },
  });

  const reservedReferral = pendingReferralWithdrawals._sum.amount ?? 0;

  const [monthlyIncomeBalance, daysUntilMonthlyWithdrawal] = await Promise.all([
    getAvailableMonthlyBalance(userId),
    getDaysUntilMonthlyWithdrawal(userId),
  ]);

  const sip = await prisma.sipPlan.findFirst({
    where: { userId, status: "ACTIVE" },
  });

  const activePlan = user.investments[0];

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      referralCode: user.referralCode,
      referredBy: user.referredBy?.referralCode,
      kycStatus: toKycStatus(user.kycStatus),
      activePlan: activePlan?.planName ?? null,
      planRoi: activePlan?.roi ?? null,
      memberSince: user.createdAt.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      referralCount: user._count.referrals,
    },
    stats: {
      totalInvestment,
      monthlyIncome,
      referralEarnings: referralEarnings._sum.commission ?? 0,
      referralBalance: Math.max(0, user.referralBalance - reservedReferral),
      monthlyIncomeBalance,
      daysUntilMonthlyWithdrawal,
      sipBalance: sip?.totalContributed ?? 0,
    },
  };
}
