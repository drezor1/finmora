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
  { key: "monthlyIncome" as const, icon: TrendingUp },
  { key: "referralEarnings" as const, icon: Share2 },
  { key: "sipBalance" as const, icon: PiggyBank },
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
    <div className="space-y-6 p-4 sm:p-6">
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

      <div className="grid grid-cols-3 gap-3">
        {miniStatKeys.map(({ key, icon: Icon }) => (
          <div
            key={key}
            className="rounded-2xl border border-border bg-card p-3 transition-all hover:card-shadow sm:p-4"
          >
            <Icon className="h-4 w-4 text-accent" />
            <MoneyText amount={stats[key]} className="mt-2 text-sm sm:text-base" />
            <p className="mt-0.5 text-[10px] text-muted sm:text-xs">{t(key)}</p>
          </div>
        ))}
      </div>

      <QuickActions
        referralCode={user.referralCode}
        labels={{
          invest: t("quickInvest"),
          withdraw: t("quickWithdraw"),
          share: t("quickShare"),
        }}
      />

      <AdBanner />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-primary">{t("recentActivity")}</h2>
              <Badge variant="accent">Live</Badge>
            </div>
            <div className="mt-4 divide-y divide-border">
              {activity.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted">{t("noActivity")}</p>
              ) : (
                activity.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-sm font-medium text-primary">{item.type}</p>
                      <p className="text-xs text-muted">{item.date}</p>
                    </div>
                    <div className="text-right">
                      <MoneyText amount={item.amount} variant="positive" showSign className="text-sm" />
                      <Badge variant={item.status === "paid" ? "accent" : "gold"} className="mt-1">
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-primary">{t("activePlan")}</h2>
            {user.activePlan && user.planRoi != null ? (
              <div className="mt-4 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-4 text-white">
                <p className="text-sm font-medium opacity-80">{user.activePlan}</p>
                <p className="mt-1 text-2xl font-bold">{user.planRoi}% ROI</p>
                <p className="mt-2 text-sm opacity-80">
                  <MoneyText amount={stats.totalInvestment} className="text-white" />
                  {" "}invested
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted">{t("noActivePlan")}</p>
            )}
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted">{t("referralCode")}</span>
                <span className="font-mono font-medium text-primary">{user.referralCode}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">{t("kycStatus")}</span>
                <Badge variant="accent">{user.kycStatus}</Badge>
              </div>
            </div>
            <div className="mt-6 grid gap-2">
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
