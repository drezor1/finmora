"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { INVESTMENT_PLANS } from "@/lib/constants";
import { apiGet } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TierBadge } from "@/components/app/tier-badge";
import { InvestModal } from "@/components/dashboard/invest-modal";
import { DashboardPanelSkeleton } from "@/components/dashboard/dashboard-skeletons";
import { TrendingUp, Calendar, Plus } from "lucide-react";
import type { PlanConfig } from "@/lib/investment-plans";

type Investment = {
  id: string;
  plan: string;
  amount: number;
  roi: number;
  monthlyIncome: number;
  startDate: string;
  status: string;
  nextPayout: string | null;
};

export function InvestmentsPanel() {
  const t = useTranslations("dashboard.investments");
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanConfig | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadInvestments = useCallback(() => {
    setLoading(true);
    apiGet<Investment[]>("/api/investments")
      .then(setInvestments)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadInvestments();
  }, [loadInvestments]);

  function handleInvestSuccess() {
    setSuccessMsg("Investment successful! Your plan is now active.");
    loadInvestments();
    setTimeout(() => setSuccessMsg(null), 5000);
  }

  if (loading && investments.length === 0) {
    return <DashboardPanelSkeleton rows={5} />;
  }

  if (error && investments.length === 0) {
    return <p className="py-8 text-center text-sm text-destructive">{error}</p>;
  }

  return (
    <div className="space-y-6">
      {successMsg && (
        <p className="rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">
          {successMsg}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {investments.map((inv) => (
          <Card key={inv.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <Badge variant="accent">{inv.plan}</Badge>
                <Badge variant="outline">{inv.status}</Badge>
              </div>
              <p className="mt-4 text-2xl font-bold text-primary">
                {formatCurrency(inv.amount)}
              </p>
              <div className="mt-3 space-y-2 text-sm text-muted">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  {inv.roi}% ROI · {formatCurrency(inv.monthlyIncome)}/mo
                </div>
                {inv.nextPayout && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {t("nextPayout")}: {inv.nextPayout}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold text-primary">{t("history")}</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted">
                  <th className="pb-3 pr-4">{t("plan")}</th>
                  <th className="pb-3 pr-4">{t("amount")}</th>
                  <th className="pb-3 pr-4">{t("roi")}</th>
                  <th className="pb-3 pr-4">{t("monthly")}</th>
                  <th className="pb-3">{t("startDate")}</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((inv) => (
                  <tr key={inv.id} className="border-b border-border last:border-0">
                    <td className="py-3 pr-4 font-medium">{inv.plan}</td>
                    <td className="py-3 pr-4">{formatCurrency(inv.amount)}</td>
                    <td className="py-3 pr-4 text-accent">{inv.roi}%</td>
                    <td className="py-3 pr-4">{formatCurrency(inv.monthlyIncome)}</td>
                    <td className="py-3">{inv.startDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-primary">{t("upgradeTitle")}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {INVESTMENT_PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={"popular" in plan && plan.popular ? "ring-2 ring-accent" : ""}
            >
              <div className={`h-1 bg-gradient-to-r ${plan.color}`} />
              <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-2">
                  <TierBadge planId={plan.id} />
                  {"popular" in plan && plan.popular && (
                    <Badge variant="accent">Popular</Badge>
                  )}
                </div>
                <p className="mt-2 text-2xl font-bold text-accent">{plan.roi}%</p>
                <p className="text-xs text-muted">{t("perMonth")}</p>
                <p className="mt-3 text-sm text-muted">
                  {formatCurrency(plan.min)} – {formatCurrency(plan.max)}
                </p>
                <Button
                  variant={"popular" in plan && plan.popular ? "accent" : "outline"}
                  className="mt-4 w-full gap-2"
                  onClick={() => setSelectedPlan(plan)}
                >
                  <Plus className="h-4 w-4" />
                  {t("investNow")}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {selectedPlan && (
        <InvestModal
          open={Boolean(selectedPlan)}
          onClose={() => setSelectedPlan(null)}
          plan={selectedPlan}
          onSuccess={handleInvestSuccess}
        />
      )}
    </div>
  );
}
