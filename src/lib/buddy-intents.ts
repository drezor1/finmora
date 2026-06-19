export type BuddyIntent =
  | "greeting"
  | "invest_how"
  | "my_plan"
  | "my_balance"
  | "referral_how"
  | "my_referral"
  | "withdraw_rules"
  | "my_withdrawal"
  | "sip_info"
  | "my_sip"
  | "kyc_status"
  | "fallback";

type IntentDef = {
  intent: BuddyIntent;
  keywords: string[];
  priority: number;
};

const INTENT_DEFS: IntentDef[] = [
  {
    intent: "my_plan",
    keywords: [
      "my plan",
      "active plan",
      "mera plan",
      "current plan",
      "which plan",
      "plan kya",
      "plan hai",
    ],
    priority: 10,
  },
  {
    intent: "my_balance",
    keywords: [
      "my balance",
      "portfolio",
      "kitna hai",
      "total investment",
      "mera balance",
      "balance kya",
      "kitna paisa",
    ],
    priority: 10,
  },
  {
    intent: "my_referral",
    keywords: [
      "my code",
      "referral code",
      "mera code",
      "referral count",
      "kitne referral",
      "referral balance",
    ],
    priority: 10,
  },
  {
    intent: "my_withdrawal",
    keywords: [
      "can i withdraw",
      "withdraw now",
      "cooldown",
      "days left",
      "kab withdraw",
      "withdraw kar",
      "nikal sakta",
    ],
    priority: 10,
  },
  {
    intent: "my_sip",
    keywords: ["my sip", "sip balance", "mera sip", "sip kitna"],
    priority: 10,
  },
  {
    intent: "kyc_status",
    keywords: [
      "kyc",
      "verification",
      "verified",
      "verify",
      "documents",
      "kyc status",
    ],
    priority: 9,
  },
  {
    intent: "invest_how",
    keywords: [
      "how do i invest",
      "how to invest",
      "invest kaise",
      "kaise lagaye",
      "investment plan",
      "infinity",
      "new plan",
    ],
    priority: 7,
  },
  {
    intent: "referral_how",
    keywords: [
      "how does referral",
      "how referral",
      "refer kaise",
      "referral work",
      "referral kaise",
      "share code",
    ],
    priority: 7,
  },
  {
    intent: "withdraw_rules",
    keywords: [
      "when can i withdraw",
      "when withdraw",
      "withdrawal rule",
      "withdraw rules",
      "withdrawal policy",
      "30 day",
      "48 hour",
    ],
    priority: 7,
  },
  {
    intent: "sip_info",
    keywords: [
      "what is sip",
      "sip kya",
      "sip meaning",
      "sip lock",
      "sip rule",
    ],
    priority: 7,
  },
  {
    intent: "greeting",
    keywords: [
      "hi",
      "hello",
      "hey",
      "namaste",
      "good morning",
      "good evening",
    ],
    priority: 3,
  },
];

function normalize(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, " ");
}

export function matchBuddyIntent(message: string): BuddyIntent {
  const text = normalize(message);
  if (!text) return "fallback";

  let best: { intent: BuddyIntent; score: number; priority: number } | null =
    null;

  for (const def of INTENT_DEFS) {
    let score = 0;
    for (const keyword of def.keywords) {
      if (text.includes(keyword)) score += 1;
    }
    if (score === 0) continue;

    if (
      !best ||
      score > best.score ||
      (score === best.score && def.priority > best.priority)
    ) {
      best = { intent: def.intent, score, priority: def.priority };
    }
  }

  return best?.intent ?? "fallback";
}
