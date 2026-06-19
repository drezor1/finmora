export const INVESTMENT_PLANS = [
  {
    id: "infinity-start",
    name: "Infinity Start",
    min: 10000,
    max: 99000,
    roi: 8,
    tierColor: "#10B981",
    tierColorEnd: "#059669",
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: "infinity-grow",
    name: "Infinity Grow",
    min: 100000,
    max: 999000,
    roi: 10,
    tierColor: "#C9A227",
    tierColorEnd: "#D97706",
    color: "from-amber-500 to-orange-600",
    popular: true,
  },
  {
    id: "infinity-max",
    name: "Infinity Max",
    min: 1000000,
    max: 10000000,
    roi: 12,
    tierColor: "#6366F1",
    tierColorEnd: "#818CF8",
    color: "from-violet-500 to-purple-600",
  },
] as const;

export const SIP_OPTIONS = [
  { years: 1 as const, minPercent: 30, maxPercent: 50 },
  { years: 3 as const, minPercent: 30, maxPercent: 50 },
  { years: 5 as const, minPercent: 30, maxPercent: 50 },
] as const;

export const REFERRAL_COMMISSION = 5;

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "or", label: "ଓଡ଼ିଆ" },
  { code: "bn", label: "বাংলা" },
] as const;

export type PlanId = (typeof INVESTMENT_PLANS)[number]["id"];

export function getPlanById(id: string) {
  return INVESTMENT_PLANS.find((p) => p.id === id);
}
