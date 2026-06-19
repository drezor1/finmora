"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { apiGet } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoneyText } from "@/components/app/money-text";
import { PortfolioHeroCard } from "@/components/dashboard/portfolio-hero-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { AdBanner } from "@/components/dashboard/ad-banner";
import { DashboardOverviewSkeleton } from "@/components/dashboard/dashboard-skeletons";
import {
  TrendingUp,
  Share2,
  PiggyBank,
  ArrowRight,
  Activity,
  Zap,
} from "lucide-react";

type UserMe = {
  user: {
    name: string;
    referralCode: string;
    kycStatus: string;
    activePlan: string | null;
    planRoi: number | null;
  };
  stats: {
    totalInvestment: number;
    monthlyIncome: number;
    referralEarnings: number;
    sipBalance: number;
  };
};

type Invoice = {
  id: string;
  type: string;
  amount: number;
  date: string;
  status: string;
};

const miniStatKeys = [
  { key: "monthlyIncome" as const, icon: TrendingUp, color: "accent" as const },
  { key: "referralEarnings" as const, icon: Share2, color: "gold" as const },
  { key: "sipBalance" as const, icon: PiggyBank, color: "accent" as const },
];

export function DashboardOverview() {
  const t = useTranslations("dashboard");
  const [userMe, setUserMe] = useState<UserMe | null>(null);
  const [activity, setActivity] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiGet<UserMe>("/api/users/me"),
      apiGet<Invoice[]>("/api/invoices"),
    ])
      .then(([me, invoices]) => {
        setUserMe(me);
        setActivity(invoices.slice(0, 4));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <DashboardOverviewSkeleton />;
  }

  if (error || !userMe) {
    return <p className="p-6 text-center text-sm text-destructive">{error ?? "Failed to load"}</p>;
  }

  const { user, stats } = userMe;
  const totalPortfolio = stats.totalInvestment + stats.sipBalance;
  const growthPercent =
    stats.totalInvestment > 0
      ? (stats.monthlyIncome / stats.totalInvestment) * 100
      : 0;

  const sparklineData = activity.length
    ? [...activity].reverse().map((a) => a.amount)
    : [stats.monthlyIncome * 0.8, stats.monthlyIncome * 0.9, stats.monthlyIncome];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      {/* Hero card */}
      <PortfolioHeroCard
        userName={user.name}
        totalPortfolio={totalPortfolio}
        monthlyIncome={stats.monthlyIncome}
        growthPercent={growthPercent}
        kycStatus={user.kycStatus}
        activePlan={user.activePlan}
        sparklineData={sparklineData}
        labels={{
          greeting: t("welcome"),
          portfolio: t("portfolioValue"),
          thisMonth: t("thisMonth"),
          verified: t("kycVerified"),
        }}
      />

      {/* Mini stat cards */}
      <div className="grid grid-cols-3 gap-3">
        {miniStatKeys.map(({ key, icon: Icon, color }) => (
          <div
            key={key}
            className="group relative overflow-hidden rounded-2xl p-3 transition-all duration-200 hover:-translate-y-0.5 sm:p-4"
            style={{
              background: "linear-gradient(145deg, #0f1623 0%, #0a0e18 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
            }}
          >
            <div
              className="absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background: color === "accent"
                  ? "radial-gradient(circle, rgba(0,217,126,0.12) 0%, transparent 70%)"
                  : "radial-gradient(circle, rgba(212,168,67,0.12) 0%, transparent 70%)",
              }}
            />
            <div
              className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg"
              style={{
                background: color === "accent" ? "rgba(0,217,126,0.1)" : "rgba(212,168,67,0.1)",
              }}
            >
              <Icon
                className="h-4 w-4"
                style={{ color: color === "accent" ? "var(--accent)" : "var(--gold)" }}
              />
            </div>
            <MoneyText amount={stats[key]} className="text-sm font-bold text-foreground sm:text-base" />
            <p className="mt-0.5 text-[10px] font-medium text-muted-foreground sm:text-xs">{t(key)}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <QuickActions
        referralCode={user.referralCode}
        labels={{
          invest: t("quickInvest"),
          withdraw: t("quickWithdraw"),
          share: t("quickShare"),
        }}
      />

      <AdBanner />

      {/* Content grid */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Recent activity */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: "rgba(0,217,126,0.1)" }}
                >
                  <Activity className="h-4 w-4 text-accent" />
                </div>
                <h2 className="text-base font-semibold text-foreground">{t("recentActivity")}</h2>
              </div>
              <Badge variant="accent">Live</Badge>
            </div>
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              {activity.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">{t("noActivity")}</p>
              ) : (
                activity.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-4 transition-colors hover:bg-white/[0.01]"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ background: item.status === "paid" ? "var(--accent)" : "var(--gold)" }}
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.type}</p>
                        <p className="text-xs text-muted-foreground">{item.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <MoneyText amount={item.amount} variant="positive" showSign className="text-sm font-semibold" />
                      <Badge
                        variant={item.status === "paid" ? "accent" : "gold"}
                        className="mt-1"
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active plan card */}
        <Card>
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: "rgba(212,168,67,0.1)" }}
              >
                <Zap className="h-4 w-4 text-gold" />
              </div>
              <h2 className="text-base font-semibold text-foreground">{t("activePlan")}</h2>
            </div>

            {user.activePlan && user.planRoi != null ? (
              <div
                className="relative overflow-hidden rounded-2xl p-5"
                style={{
                  background: "linear-gradient(135deg, rgba(212,168,67,0.15) 0%, rgba(212,168,67,0.05) 100%)",
                  border: "1px solid rgba(212,168,67,0.2)",
                }}
              >
                <div
                  className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(212,168,67,0.15) 0%, transparent 70%)" }}
                />
                <p className="text-xs font-semibold uppercase tracking-widest text-gold/70">
                  {user.activePlan}
                </p>
                <p className="mt-1 text-3xl font-bold text-gold">{user.planRoi}%</p>
                <p className="text-xs text-gold/60">Annual ROI</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  <MoneyText amount={stats.totalInvestment} className="text-foreground font-semibold" />
                  {" "}invested
                </p>
              </div>
            ) : (
              <p className="rounded-xl p-4 text-sm text-muted-foreground" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                {t("noActivePlan")}
              </p>
            )}

            <div
              className="mt-4 space-y-3 rounded-xl p-4"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("referralCode")}</span>
                <span className="font-mono font-semibold text-foreground">{user.referralCode}</span>
              </div>
              <div
                className="h-px"
                style={{ background: "rgba(255,255,255,0.05)" }}
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("kycStatus")}</span>
                <Badge variant="accent">{user.kycStatus}</Badge>
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              <Link href="/dashboard/investments">
                <Button variant="outline" className="w-full justify-between">
                  {t("viewInvestments")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard/withdrawals">
                <Button variant="accent" className="w-full justify-between">
                  {t("requestWithdrawal")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
