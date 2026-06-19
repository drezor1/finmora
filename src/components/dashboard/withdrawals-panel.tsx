"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { apiGet, apiPost } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardPanelSkeleton } from "@/components/dashboard/dashboard-skeletons";
import {
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  XCircle,
  Wallet,
} from "lucide-react";
import type { WithdrawalStatus } from "@/lib/types";

type Withdrawal = {
  id: string;
  amount: number;
  type: "monthly_income" | "referral_income";
  status: WithdrawalStatus;
  requestedAt: string;
  processedAt?: string;
};

type WithdrawalLimits = {
  monthlyAvailable: number;
  referralAvailable: number;
  daysUntilMonthly: number;
  canWithdrawMonthly: boolean;
  canWithdrawReferral: boolean;
};

type WithdrawalsResponse = {
  items: Withdrawal[];
  limits: WithdrawalLimits;
};

export function WithdrawalsPanel() {
  const t = useTranslations("dashboard.withdrawals");
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [limits, setLimits] = useState<WithdrawalLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"monthly_income" | "referral_income">("monthly_income");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [filter, setFilter] = useState<WithdrawalStatus | "all">("all");

  async function loadWithdrawals() {
    const data = await apiGet<WithdrawalsResponse>("/api/withdrawals");
    setWithdrawals(data.items);
    setLimits(data.limits);
  }

  useEffect(() => {
    loadWithdrawals()
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = withdrawals.filter(
    (w) => filter === "all" || w.status === filter
  );

  const maxAmount =
    type === "monthly_income"
      ? limits?.monthlyAvailable ?? 0
      : limits?.referralAvailable ?? 0;

  const canSubmit =
    type === "monthly_income"
      ? limits?.canWithdrawMonthly
      : limits?.canWithdrawReferral;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await apiPost<Withdrawal>("/api/withdrawals", {
        amount: Number(amount),
        type,
      });
      setWithdrawals((prev) => [created, ...prev]);
      await loadWithdrawals();
      setSubmitted(true);
      setAmount("");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  }

  const statusVariant = (s: WithdrawalStatus) => {
    if (s === "approved") return "accent";
    if (s === "rejected") return "outline";
    return "gold";
  };

  if (loading) {
    return <DashboardPanelSkeleton rows={5} />;
  }

  if (error || !limits) {
    return <p className="py-8 text-center text-sm text-destructive">{error ?? "Failed to load"}</p>;
  }

  const pipelineSteps = [
    { key: "pending" as const, icon: Loader2 },
    { key: "approved" as const, icon: CheckCircle2 },
    { key: "rejected" as const, icon: XCircle },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-start gap-4 pt-6">
            <Wallet className="h-8 w-8 shrink-0 text-accent" />
            <div>
              <p className="text-sm text-muted">{t("availableMonthly")}</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(limits.monthlyAvailable)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-start gap-4 pt-6">
            <Wallet className="h-8 w-8 shrink-0 text-gold" />
            <div>
              <p className="text-sm text-muted">{t("availableReferral")}</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(limits.referralAvailable)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {limits.daysUntilMonthly > 0 && (
        <div className="rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-primary">
          <Clock className="mr-2 inline h-4 w-4 text-gold" />
          {t("nextAvailable", { days: limits.daysUntilMonthly })}
        </div>
      )}

      {!limits.canWithdrawMonthly && type === "monthly_income" && limits.daysUntilMonthly === 0 && (
        <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted">
          {t("pendingMonthlyBlocked")}
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
            {t("pipeline")}
          </h2>
          <div className="flex items-center justify-between gap-2">
            {pipelineSteps.map(({ key, icon: Icon }) => (
              <div key={key} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    key === "pending"
                      ? "bg-gold/15 text-gold"
                      : key === "approved"
                        ? "bg-accent/10 text-accent"
                        : "bg-destructive/10 text-destructive"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-center text-[10px] font-medium text-muted sm:text-xs">
                  {t(`status.${key}`)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-start gap-4 pt-6">
            <Calendar className="h-8 w-8 shrink-0 text-accent" />
            <div>
              <h3 className="font-semibold text-primary">{t("monthlyRule")}</h3>
              <p className="mt-1 text-sm text-muted">{t("monthlyRuleDesc")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-start gap-4 pt-6">
            <Clock className="h-8 w-8 shrink-0 text-gold" />
            <div>
              <h3 className="font-semibold text-primary">{t("referralRule")}</h3>
              <p className="mt-1 text-sm text-muted">{t("referralRuleDesc")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold text-primary">{t("requestTitle")}</h2>
          {submitted ? (
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-accent/10 p-4 text-sm text-accent-dark">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {t("requestSuccess")}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="flex gap-2">
                {(["monthly_income", "referral_income"] as const).map((tkey) => (
                  <button
                    key={tkey}
                    type="button"
                    onClick={() => setType(tkey)}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium ${
                      type === tkey
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border text-muted"
                    }`}
                  >
                    {t(tkey)}
                  </button>
                ))}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t("amount")}</label>
                <Input
                  type="number"
                  required
                  min={100}
                  max={maxAmount > 0 ? maxAmount : undefined}
                  placeholder="10000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={!canSubmit}
                />
                {maxAmount > 0 && (
                  <p className="mt-1 text-xs text-muted">
                    {t("maxAvailable")}: {formatCurrency(maxAmount)}
                  </p>
                )}
              </div>
              {submitError && (
                <p className="text-sm text-destructive">{submitError}</p>
              )}
              <Button type="submit" variant="accent" disabled={submitting || !canSubmit}>
                {t("submit")}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex flex-wrap gap-2">
            {(["all", "pending", "approved", "rejected"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  filter === f ? "bg-primary text-white" : "bg-background text-muted border border-border"
                }`}
              >
                {f === "all" ? t("all") : t(`status.${f}`)}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted">
                  <th className="pb-3 pr-4">{t("id")}</th>
                  <th className="pb-3 pr-4">{t("type")}</th>
                  <th className="pb-3 pr-4">{t("amount")}</th>
                  <th className="pb-3 pr-4">{t("date")}</th>
                  <th className="pb-3">{t("statusLabel")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((w) => (
                  <tr key={w.id} className="border-b border-border last:border-0">
                    <td className="py-3 pr-4 font-mono text-xs">{w.id}</td>
                    <td className="py-3 pr-4 capitalize">{t(w.type)}</td>
                    <td className="py-3 pr-4 font-medium">{formatCurrency(w.amount)}</td>
                    <td className="py-3 pr-4 text-muted">{w.requestedAt}</td>
                    <td className="py-3">
                      <Badge variant={statusVariant(w.status)}>{t(`status.${w.status}`)}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
