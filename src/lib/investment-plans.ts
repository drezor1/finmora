import { INVESTMENT_PLANS } from "@/lib/constants";

export type PlanConfig = (typeof INVESTMENT_PLANS)[number];

export function getPlanBySlug(slug: string): PlanConfig | undefined {
  return INVESTMENT_PLANS.find((p) => p.id === slug);
}

export function validatePlanAmount(planSlug: string, amount: number) {
  const plan = getPlanBySlug(planSlug);
  if (!plan) {
    return { ok: false as const, error: "Invalid investment plan" };
  }
  if (!Number.isInteger(amount) || amount < plan.min || amount > plan.max) {
    return {
      ok: false as const,
      error: `Amount must be between ₹${plan.min.toLocaleString("en-IN")} and ₹${plan.max.toLocaleString("en-IN")}`,
    };
  }
  return { ok: true as const, plan };
}

export function computeMonthlyIncome(amount: number, roi: number): number {
  return Math.round((amount * roi) / 100);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}
