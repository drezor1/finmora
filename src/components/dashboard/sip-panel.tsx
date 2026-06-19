"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { SIP_OPTIONS } from "@/lib/constants";
import { apiGet, apiPatch, apiPost } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, TrendingUp, Percent, PiggyBank } from "lucide-react";

type SipData = {
  active: boolean;
  status: string | null;
  lockYears: 1 | 3 | 5;
  percentOfIncome: number;
  monthlyContribution: number;
  totalContributed: number;
  startDate: string | null;
  endDate: string | null;
  projectedValue: number;
  daysRemaining: number;
  canEnroll: boolean;
  grossMonthlyIncome: number;
  history: Array<{ month: string; amount: number }>;
};

export function SipPanel() {
  const t = useTranslations("dashboard.sip");
  const [sip, setSip] = useState<SipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYears, setSelectedYears] = useState<1 | 3 | 5>(3);
  const [percent, setPercent] = useState(30);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadSip = useCallback(() => {
    return apiGet<SipData>("/api/sip")
      .then((data) => {
        setSip(data);
        setSelectedYears(data.lockYears);
        setPercent(data.percentOfIncome);
        setError(null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  useEffect(() => {
    loadSip().finally(() => setLoading(false));
  }, [loadSip]);

  async function handleEnroll() {
    setSaving(true);
    setMessage(null);
    try {
      const data = await apiPost<SipData>("/api/sip", {
        lockYears: selectedYears,
        percentOfIncome: percent,
      });
      setSip(data);
      setMessage(t("sipEnrolled"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to enroll");
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const data = await apiPatch<SipData>("/api/sip", {
        percentOfIncome: percent,
      });
      setSip(data);
      setMessage(t("sipUpdated"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (error && !sip) {
    return <p className="py-8 text-center text-sm text-destructive">{error}</p>;
  }

  if (!sip) {
    return null;
  }

  if (!sip.active && sip.canEnroll) {
    const previewAmount = Math.round(sip.grossMonthlyIncome * (percent / 100));
    return (
      <div className="space-y-6">
        {message && (
          <p className="rounded-xl bg-accent/10 px-4 py-3 text-sm text-accent">{message}</p>
        )}
        {error && (
          <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
        )}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-primary">{t("enrollTitle")}</h2>
            <p className="mt-1 text-sm text-muted">{t("enrollDesc")}</p>
            <p className="mt-3 text-sm text-muted">
              {t("grossIncome")}:{" "}
              <span className="font-semibold text-primary">
                {formatCurrency(sip.grossMonthlyIncome)}
              </span>
            </p>
            <div className="mt-4">
              <label className="text-sm font-medium">
                {t("allocation")}: {percent}%
              </label>
              <input
                type="range"
                min={30}
                max={50}
                value={percent}
                onChange={(e) => setPercent(Number(e.target.value))}
                className="mt-2 w-full accent-accent"
              />
              <p className="mt-1 text-sm text-muted">
                {t("monthlyContribution")}: {formatCurrency(previewAmount)}
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              {SIP_OPTIONS.map((o) => (
                <button
                  key={o.years}
                  type="button"
                  onClick={() => setSelectedYears(o.years)}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                    selectedYears === o.years
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted hover:border-accent/30"
                  }`}
                >
                  {o.years} {t("years")}
                </button>
              ))}
            </div>
            <Button
              variant="accent"
              className="mt-4 w-full"
              disabled={saving}
              onClick={handleEnroll}
            >
              {saving ? "…" : t("startSip")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!sip.active && !sip.canEnroll) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-sm text-muted">{t("noActiveInvestment")}</p>
        </CardContent>
      </Card>
    );
  }

  const isActive = sip.status === "active";

  return (
    <div className="space-y-6">
      {message && (
        <p className="rounded-xl bg-accent/10 px-4 py-3 text-sm text-accent">{message}</p>
      )}
      {error && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <PiggyBank className="h-6 w-6 text-accent" />
            <p className="mt-3 text-2xl font-bold text-primary">
              {formatCurrency(sip.totalContributed)}
            </p>
            <p className="text-sm text-muted">{t("totalContributed")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <TrendingUp className="h-6 w-6 text-accent" />
            <p className="mt-3 text-2xl font-bold text-primary">
              {formatCurrency(sip.projectedValue)}
            </p>
            <p className="text-sm text-muted">{t("projectedValue")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Lock className="h-6 w-6 text-gold" />
            <p className="mt-3 text-2xl font-bold text-primary">
              {isActive ? sip.daysRemaining : 0}
            </p>
            <p className="text-sm text-muted">
              {isActive ? t("daysRemaining") : t("completed")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Percent className="h-6 w-6 text-accent" />
            <p className="mt-3 text-2xl font-bold text-primary">
              {sip.percentOfIncome}%
            </p>
            <p className="text-sm text-muted">{t("allocation")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-primary">{t("activeSip")}</h2>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted">{t("monthlyContribution")}</span>
                <span className="font-semibold">{formatCurrency(sip.monthlyContribution)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">{t("lockPeriod")}</span>
                <span>
                  {sip.lockYears} {t("years")}
                </span>
              </div>
              {sip.startDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted">{t("startDate")}</span>
                  <span>{sip.startDate}</span>
                </div>
              )}
              {sip.endDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted">{t("endDate")}</span>
                  <span>{sip.endDate}</span>
                </div>
              )}
              <Badge variant={isActive ? "accent" : "outline"} className="mt-2">
                {isActive ? t("active") : t("completed")}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {isActive && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold text-primary">{t("adjustAllocation")}</h2>
              <p className="mt-1 text-sm text-muted">{t("adjustDesc")}</p>
              <div className="mt-4">
                <label className="text-sm font-medium">
                  {t("allocation")}: {percent}%
                </label>
                <input
                  type="range"
                  min={30}
                  max={50}
                  value={percent}
                  onChange={(e) => setPercent(Number(e.target.value))}
                  className="mt-2 w-full accent-accent"
                  disabled={!isActive}
                />
              </div>
              <Button
                variant="accent"
                className="mt-4 w-full"
                disabled={saving || percent === sip.percentOfIncome}
                onClick={handleSave}
              >
                {saving ? "…" : t("saveChanges")}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold text-primary">{t("contributionHistory")}</h2>
          {sip.history.length === 0 ? (
            <p className="mt-4 text-sm text-muted">{t("noContributions")}</p>
          ) : (
            <div className="mt-4 divide-y divide-border">
              {sip.history.map((h) => (
                <div key={h.month} className="flex items-center justify-between py-3">
                  <span className="text-sm text-muted">{h.month}</span>
                  <span className="font-medium text-accent">+{formatCurrency(h.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
