"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminHeader } from "@/components/admin/admin-header";
import { StatCard } from "@/components/admin/stat-card";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiGet } from "@/lib/api-client";
import type {
  AdminStats,
  AdminUser,
  AdminWithdrawal,
} from "@/lib/admin-types";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  ShieldAlert,
  IndianRupee,
  Clock,
  ArrowRight,
} from "lucide-react";

export function OverviewPanel() {
  const t = useTranslations("adminPanel");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<AdminWithdrawal[]>(
    []
  );
  const [pendingKycUsers, setPendingKycUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [statsData, withdrawals, users] = await Promise.all([
          apiGet<AdminStats>("/api/admin/stats"),
          apiGet<AdminWithdrawal[]>("/api/admin/withdrawals"),
          apiGet<AdminUser[]>("/api/admin/users?kyc=pending"),
        ]);
        if (!cancelled) {
          setStats(statsData);
          setPendingWithdrawals(
            withdrawals.filter((w) => w.status === "pending").slice(0, 5)
          );
          setPendingKycUsers(users.slice(0, 4));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !stats) {
    return (
      <>
        <AdminHeader title={t("overview.title")} subtitle={t("overview.subtitle")} />
        <div className="flex items-center justify-center p-12 text-sm text-muted">
          Loading…
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader title={t("overview.title")} subtitle={t("overview.subtitle")} />

      <div className="p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label={t("stats.totalUsers")}
            value={stats.totalUsers.toLocaleString()}
            icon={Users}
            change="+8.2%"
            trend="up"
            accent
          />
          <StatCard
            label={t("stats.pendingKyc")}
            value={stats.pendingKyc.toLocaleString()}
            icon={ShieldAlert}
            change={t("stats.needsReview")}
            trend="neutral"
          />
          <StatCard
            label={t("stats.totalInvested")}
            value={formatCurrency(stats.totalInvested)}
            icon={IndianRupee}
            change="+15.4%"
            trend="up"
            accent
          />
          <StatCard
            label={t("stats.pendingWithdrawals")}
            value={String(stats.pendingWithdrawals)}
            icon={Clock}
            change={formatCurrency(stats.pendingWithdrawalAmount)}
            trend="neutral"
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-primary">
                  {t("overview.pendingWithdrawals")}
                </h2>
                <Link href="/admin/withdrawals">
                  <Button variant="ghost" size="sm">
                    {t("overview.viewAll")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <DataTable
                keyField="id"
                data={pendingWithdrawals}
                columns={[
                  {
                    key: "user",
                    header: t("table.user"),
                    render: (row) => (
                      <span className="font-medium">{row.userName}</span>
                    ),
                  },
                  {
                    key: "amount",
                    header: t("table.amount"),
                    render: (row) => formatCurrency(row.amount),
                  },
                  {
                    key: "type",
                    header: t("table.type"),
                    render: (row) => (
                      <span className="capitalize text-muted">
                        {row.type.replace("_", " ")}
                      </span>
                    ),
                  },
                  {
                    key: "status",
                    header: t("table.status"),
                    render: (row) => (
                      <StatusBadge
                        status={row.status}
                        label={t(`status.${row.status}`)}
                      />
                    ),
                  },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-primary">
                  {t("overview.pendingKyc")}
                </h2>
                <Link href="/admin/users">
                  <Button variant="ghost" size="sm">
                    {t("overview.viewAll")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <DataTable
                keyField="id"
                data={pendingKycUsers}
                columns={[
                  {
                    key: "name",
                    header: t("table.name"),
                    render: (row) => (
                      <span className="font-medium">{row.name}</span>
                    ),
                  },
                  {
                    key: "email",
                    header: t("table.email"),
                    render: (row) => (
                      <span className="text-muted">{row.email}</span>
                    ),
                  },
                  {
                    key: "investment",
                    header: t("table.investment"),
                    render: (row) => formatCurrency(row.totalInvestment),
                  },
                  {
                    key: "kyc",
                    header: t("table.kyc"),
                    render: (row) => (
                      <StatusBadge
                        status={row.kycStatus}
                        label={t(`kyc.${row.kycStatus}`)}
                      />
                    ),
                  },
                ]}
              />
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              href: "/admin/users",
              label: t("nav.users"),
              count: stats.totalUsers.toLocaleString(),
            },
            {
              href: "/admin/referrals",
              label: t("nav.referrals"),
              count: formatCurrency(stats.totalReferralPayouts),
            },
            {
              href: "/admin/ads",
              label: t("nav.ads"),
              count: stats.activeAds,
            },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="cursor-pointer transition-all hover:-translate-y-0.5 hover:card-shadow-lg">
                <CardContent className="flex items-center justify-between py-5">
                  <span className="font-medium text-primary">{item.label}</span>
                  <span className="text-lg font-bold text-accent">{item.count}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
