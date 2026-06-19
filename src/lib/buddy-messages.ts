import {
  INVESTMENT_PLANS,
  REFERRAL_COMMISSION,
  SIP_OPTIONS,
} from "@finmora/shared";
import {
  MONTHLY_WITHDRAWAL_COOLDOWN_DAYS,
  REFERRAL_SLA_HOURS,
} from "@/lib/withdrawal-service";
import type { BuddyIntent } from "@/lib/buddy-intents";

export type BuddyContext = {
  name: string;
  referralCode: string;
  kycStatus: string;
  activePlan: string | null;
  planRoi: number | null;
  totalInvestment: number;
  monthlyIncome: number;
  monthlyIncomeBalance: number;
  daysUntilMonthlyWithdrawal: number;
  referralEarnings: number;
  referralBalance: number;
  referralCount: number;
  sipBalance: number;
  kycRejectReason?: string | null;
  kycUnderReview?: boolean;
};

type Locale = "en" | "hi";

function resolveLocale(locale: string): Locale {
  return locale === "hi" ? "hi" : "en";
}

export function formatBuddyMoney(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function planTiersText(): string {
  return INVESTMENT_PLANS.map(
    (p) =>
      `${p.name} (${formatBuddyMoney(p.min)}–${formatBuddyMoney(p.max)}, ${p.roi}% ROI)`
  ).join("; ");
}

function sipLockText(): string {
  const years = SIP_OPTIONS.map((o) => `${o.years} year`).join(", ");
  return `${years} lock; allocate ${SIP_OPTIONS[0].minPercent}–${SIP_OPTIONS[0].maxPercent}% of monthly income`;
}

function kycLabel(status: string, locale: Locale): string {
  const map: Record<string, { en: string; hi: string }> = {
    verified: { en: "Verified", hi: "Verified" },
    pending: { en: "Pending review", hi: "Review pending" },
    rejected: { en: "Rejected", hi: "Rejected" },
    not_submitted: { en: "Not submitted", hi: "Submit nahi hua" },
  };
  const entry = map[status] ?? map.not_submitted;
  return locale === "hi" ? entry.hi : entry.en;
}

function buildReply(intent: BuddyIntent, ctx: BuddyContext, locale: Locale): string {
  const money = formatBuddyMoney;

  switch (intent) {
    case "greeting":
      return locale === "hi"
        ? `Namaste ${ctx.name}! Main Finmora Buddy hoon. Investments, referral, SIP ya withdrawal — kuch bhi poochho.`
        : `Hi ${ctx.name}! I'm Finmora Buddy. Ask me about investments, referrals, SIP, or withdrawals.`;

    case "invest_how":
      return locale === "hi"
        ? `Finmora par 3 plans hain: ${planTiersText()}. Dashboard → Investments se plan choose karke invest karein.`
        : `Finmora offers three plans: ${planTiersText()}. Go to Dashboard → Investments to choose a plan and invest.`;

    case "my_plan":
      if (ctx.activePlan) {
        return locale === "hi"
          ? `Aapka active plan ${ctx.activePlan} hai (${ctx.planRoi}% ROI). Total investment: ${money(ctx.totalInvestment)}. Monthly income: ${money(ctx.monthlyIncome)}.`
          : `Your active plan is ${ctx.activePlan} (${ctx.planRoi}% ROI). Total investment: ${money(ctx.totalInvestment)}. Monthly income: ${money(ctx.monthlyIncome)}.`;
      }
      return locale === "hi"
        ? "Abhi koi active plan nahi hai. Dashboard → Investments par jaakar Infinity Start, Grow ya Max choose karein."
        : "You don't have an active plan yet. Go to Dashboard → Investments to choose Infinity Start, Grow, or Max.";

    case "my_balance":
      return locale === "hi"
        ? `Portfolio snapshot: Total investment ${money(ctx.totalInvestment)}, monthly income balance ${money(ctx.monthlyIncomeBalance)}, SIP balance ${money(ctx.sipBalance)}.`
        : `Portfolio snapshot: Total investment ${money(ctx.totalInvestment)}, monthly income balance ${money(ctx.monthlyIncomeBalance)}, SIP balance ${money(ctx.sipBalance)}.`;

    case "referral_how":
      return locale === "hi"
        ? `Apna referral code share karein. Jab koi join karke deposit karta hai, aapko ${REFERRAL_COMMISSION}% commission milta hai. Referral withdrawal admin approval ke baad ~${REFERRAL_SLA_HOURS} ghante mein process hota hai. KYC verified hona chahiye.`
        : `Share your referral code. When someone joins and deposits, you earn ${REFERRAL_COMMISSION}% commission. Referral withdrawals process within ~${REFERRAL_SLA_HOURS} hours after admin approval. KYC must be verified.`;

    case "my_referral":
      return locale === "hi"
        ? `Aapka referral code ${ctx.referralCode} hai. Ab tak ${ctx.referralCount} referrals. Total earnings ${money(ctx.referralEarnings)}, available balance ${money(ctx.referralBalance)}. Dashboard → Referrals par details dekhein.`
        : `Your referral code is ${ctx.referralCode}. You have ${ctx.referralCount} referrals. Total earnings ${money(ctx.referralEarnings)}, available balance ${money(ctx.referralBalance)}. See Dashboard → Referrals for details.`;

    case "withdraw_rules":
      return locale === "hi"
        ? `Monthly income: har ${MONTHLY_WITHDRAWAL_COOLDOWN_DAYS} din mein ek baar (KYC verified). Referral income: admin approval ke baad ~${REFERRAL_SLA_HOURS} ghante. Pending withdrawal approve hone tak balance reserve rehta hai.`
        : `Monthly income: once every ${MONTHLY_WITHDRAWAL_COOLDOWN_DAYS} days (KYC verified). Referral income: ~${REFERRAL_SLA_HOURS} hours after admin approval. Pending withdrawals reserve balance until processed.`;

    case "my_withdrawal": {
      const kyc = kycLabel(ctx.kycStatus, locale);
      if (ctx.kycStatus !== "verified") {
        return locale === "hi"
          ? `Withdrawal ke liye KYC verified hona zaroori hai. Aapka status: ${kyc}. Dashboard → Settings → KYC complete karein.`
          : `KYC must be verified before withdrawals. Your status: ${kyc}. Complete KYC under Dashboard → Settings.`;
      }
      if (ctx.daysUntilMonthlyWithdrawal > 0) {
        return locale === "hi"
          ? `Monthly income balance: ${money(ctx.monthlyIncomeBalance)}. Agla monthly withdrawal ${ctx.daysUntilMonthlyWithdrawal} din baad (${MONTHLY_WITHDRAWAL_COOLDOWN_DAYS}-day rule). Referral balance: ${money(ctx.referralBalance)} (alag withdrawal).`
          : `Monthly income balance: ${money(ctx.monthlyIncomeBalance)}. Next monthly withdrawal in ${ctx.daysUntilMonthlyWithdrawal} days (${MONTHLY_WITHDRAWAL_COOLDOWN_DAYS}-day rule). Referral balance: ${money(ctx.referralBalance)} (separate withdrawal).`;
      }
      return locale === "hi"
        ? `Aap monthly income withdraw kar sakte hain! Available balance: ${money(ctx.monthlyIncomeBalance)}. Referral balance: ${money(ctx.referralBalance)}. Dashboard → Withdrawals par request bhejein.`
        : `You can request a monthly income withdrawal now. Available balance: ${money(ctx.monthlyIncomeBalance)}. Referral balance: ${money(ctx.referralBalance)}. Submit a request under Dashboard → Withdrawals.`;
    }

    case "sip_info":
      return locale === "hi"
        ? `SIP aapke monthly income ka ${SIP_OPTIONS[0].minPercent}–${SIP_OPTIONS[0].maxPercent}% long-term wealth ke liye allocate karta hai. Lock periods: ${sipLockText()}. Dashboard → SIP se enroll karein.`
        : `SIP allocates ${SIP_OPTIONS[0].minPercent}–${SIP_OPTIONS[0].maxPercent}% of your monthly income for long-term wealth. Lock periods: ${sipLockText()}. Enroll under Dashboard → SIP.`;

    case "my_sip":
      if (ctx.sipBalance > 0) {
        return locale === "hi"
          ? `Aapka SIP balance ${money(ctx.sipBalance)} hai. Dashboard → SIP par contributions aur lock period dekhein.`
          : `Your SIP balance is ${money(ctx.sipBalance)}. View contributions and lock period under Dashboard → SIP.`;
      }
      return locale === "hi"
        ? "Abhi active SIP nahi hai. Pehle active investment chahiye, phir Dashboard → SIP se 30–50% monthly income allocate karein."
        : "You don't have an active SIP yet. You need an active investment first, then enroll under Dashboard → SIP with 30–50% of monthly income.";

    case "kyc_status": {
      const kyc = kycLabel(ctx.kycStatus, locale);
      if (ctx.kycStatus === "verified") {
        return locale === "hi"
          ? "Aapka KYC verified hai. Ab aap withdrawals request kar sakte hain."
          : "Your KYC is verified. You can request withdrawals.";
      }
      if (ctx.kycStatus === "rejected") {
        const reason = ctx.kycRejectReason
          ? locale === "hi"
            ? ` Reason: ${ctx.kycRejectReason}.`
            : ` Reason: ${ctx.kycRejectReason}.`
          : "";
        return locale === "hi"
          ? `KYC rejected hai.${reason} Dashboard → Settings se documents dubara upload karein.`
          : `Your KYC was rejected.${reason} Re-upload documents under Dashboard → Settings.`;
      }
      if (ctx.kycUnderReview) {
        return locale === "hi"
          ? "Aapke KYC documents review mein hain. Approval ke baad withdrawals unlock honge."
          : "Your KYC documents are under review. Withdrawals unlock after approval.";
      }
      return locale === "hi"
        ? `KYC status: ${kyc}. Dashboard → Settings se PAN aur Aadhaar upload karein.`
        : `KYC status: ${kyc}. Upload PAN and Aadhaar under Dashboard → Settings.`;
    }

    case "fallback":
    default:
      return locale === "hi"
        ? "Main investments, referral, SIP, withdrawal aur KYC mein help kar sakta hoon. Neeche quick questions try karein ya specific sawaal poochho!"
        : "I can help with investments, referrals, SIP, withdrawals, and KYC. Try a quick question below or ask something specific!";
  }
}

const QUICK_REPLY_KEYS: Record<Locale, string[]> = {
  en: [
    "How do I invest?",
    "My plan",
    "My balance",
    "Referral code",
    "When can I withdraw?",
    "What is SIP?",
    "KYC status",
  ],
  hi: [
    "Invest kaise karein?",
    "Mera plan",
    "Mera balance",
    "Referral code",
    "Withdraw kab?",
    "SIP kya hai?",
    "KYC status",
  ],
};

export function getBuddyQuickReplies(locale: string): string[] {
  return QUICK_REPLY_KEYS[resolveLocale(locale)];
}

export function buildBuddyReply(
  intent: BuddyIntent,
  ctx: BuddyContext,
  locale: string
): { reply: string; quickReplies: string[]; intent: BuddyIntent } {
  const loc = resolveLocale(locale);
  return {
    reply: buildReply(intent, ctx, loc),
    quickReplies: getBuddyQuickReplies(locale),
    intent,
  };
}
