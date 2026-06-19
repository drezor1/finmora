"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { REFERRAL_COMMISSION } from "@/lib/constants";
import { apiGet } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyCodeButton } from "@/components/dashboard/copy-code-button";
import { DashboardPanelSkeleton } from "@/components/dashboard/dashboard-skeletons";
import { MiniBarChart } from "@/components/ui/mini-charts";
import { Share2, Users, IndianRupee, Trophy, Wallet } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

type ReferralsData = {
  referralCode: string;
  totalReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  availableBalance: number;
  network: Array<{
    id: string;
    name: string;
    joinDate: string;
    totalDeposit: number;
  }>;
  earnings: Array<{
    id: string;
    name: string;
    date: string;
    deposit: number;
    commission: number;
    status: "paid" | "pending";
  }>;
};

export function ReferralsPanel() {
  const t = useTranslations("dashboard.referrals");
  const [data, setData] = useState<ReferralsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<ReferralsData>("/api/referrals")
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <DashboardPanelSkeleton rows={5} />;
  }

  if (error || !data) {
    return <p className="py-8 text-center text-sm text-destructive">{error ?? "Failed to load"}</p>;
  }

  const chartData =
    data.earnings.length > 0
      ? data.earnings.slice(0, 6).map((e) => e.commission)
      : [0, 0, 0, 0];

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-primary to-primary-light p-6 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-white/70">{t("yourCode")}</p>
              <p className="mt-1 font-mono text-2xl font-bold tracking-wider">
                {data.referralCode}
              </p>
              <p className="mt-2 text-sm text-white/60">
                {t("commission", { percent: REFERRAL_COMMISSION })}
              </p>
            </div>
            <CopyCodeButton code={data.referralCode} className="border-white/20 bg-white/10 text-white hover:bg-white/20" />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <Users className="h-8 w-8 text-accent" />
            <div>
              <p className="text-2xl font-bold text-primary">{data.totalReferrals}</p>
              <p className="text-sm text-muted">{t("totalReferrals")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <IndianRupee className="h-8 w-8 text-accent" />
            <div>
              <p className="text-2xl font-bold text-primary">{formatCurrency(data.totalEarnings)}</p>
              <p className="text-sm text-muted">{t("totalEarned")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <Share2 className="h-8 w-8 text-gold" />
            <div>
              <p className="text-2xl font-bold text-primary">{formatCurrency(data.pendingEarnings)}</p>
              <p className="text-sm text-muted">{t("pending")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <Wallet className="h-8 w-8 text-accent" />
            <div>
              <p className="text-2xl font-bold text-primary">{formatCurrency(data.availableBalance)}</p>
              <p className="text-sm text-muted">{t("availableBalance")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-4 text-lg font-semibold text-primary">{t("earningsChart")}</h2>
          <MiniBarChart data={chartData} barClassName="from-accent to-accent/40" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary">{t("network")}</h2>
            <Link href="/dashboard/leaderboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <Trophy className="h-4 w-4" />
                {t("viewLeaderboard")}
              </Button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted">
                  <th className="pb-3 pr-4">{t("name")}</th>
                  <th className="pb-3 pr-4">{t("joinDate")}</th>
                  <th className="pb-3">{t("deposit")}</th>
                </tr>
              </thead>
              <tbody>
                {data.network.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-muted">
                      {t("noNetwork")}
                    </td>
                  </tr>
                ) : (
                  data.network.map((m) => (
                    <tr key={m.id} className="border-b border-border last:border-0">
                      <td className="py-3 pr-4 font-medium">{m.name}</td>
                      <td className="py-3 pr-4 text-muted">{m.joinDate}</td>
                      <td className="py-3">{formatCurrency(m.totalDeposit)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-4 text-lg font-semibold text-primary">{t("earningsTitle")}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted">
                  <th className="pb-3 pr-4">{t("name")}</th>
                  <th className="pb-3 pr-4">{t("joinDate")}</th>
                  <th className="pb-3 pr-4">{t("deposit")}</th>
                  <th className="pb-3 pr-4">{t("commissionCol")}</th>
                  <th className="pb-3">{t("status")}</th>
                </tr>
              </thead>
              <tbody>
                {data.earnings.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0">
                    <td className="py-3 pr-4 font-medium">{r.name}</td>
                    <td className="py-3 pr-4 text-muted">{r.date}</td>
                    <td className="py-3 pr-4">{formatCurrency(r.deposit)}</td>
                    <td className="py-3 pr-4 text-accent">{formatCurrency(r.commission)}</td>
                    <td className="py-3">
                      <Badge variant={r.status === "paid" ? "accent" : "gold"}>
                        {r.status}
                      </Badge>
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
