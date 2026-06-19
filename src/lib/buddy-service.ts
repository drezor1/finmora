import { getUserMePayload } from "@/lib/user-me-service";
import { getKycSummary } from "@/lib/kyc-service";
import { matchBuddyIntent } from "@/lib/buddy-intents";
import {
  buildBuddyReply,
  type BuddyContext,
} from "@/lib/buddy-messages";

const KYC_INTENTS = new Set(["kyc_status", "my_withdrawal"]);

export async function answerBuddyQuestion(
  userId: string,
  message: string,
  locale: string
) {
  const payload = await getUserMePayload(userId);
  if (!payload) {
    throw new Error("User not found");
  }

  const intent = matchBuddyIntent(message);

  let kycExtra: Pick<
    BuddyContext,
    "kycRejectReason" | "kycUnderReview"
  > = {};

  if (KYC_INTENTS.has(intent)) {
    const kyc = await getKycSummary(userId);
    kycExtra = {
      kycRejectReason: kyc.rejectReason,
      kycUnderReview: kyc.underReview,
    };
  }

  const ctx: BuddyContext = {
    name: payload.user.name,
    referralCode: payload.user.referralCode,
    kycStatus: payload.user.kycStatus,
    activePlan: payload.user.activePlan,
    planRoi: payload.user.planRoi,
    totalInvestment: payload.stats.totalInvestment,
    monthlyIncome: payload.stats.monthlyIncome,
    monthlyIncomeBalance: payload.stats.monthlyIncomeBalance,
    daysUntilMonthlyWithdrawal: payload.stats.daysUntilMonthlyWithdrawal,
    referralEarnings: payload.stats.referralEarnings,
    referralBalance: payload.stats.referralBalance,
    referralCount: payload.user.referralCount,
    sipBalance: payload.stats.sipBalance,
    ...kycExtra,
  };

  return buildBuddyReply(intent, ctx, locale);
}
