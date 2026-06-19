"use client";

import { useMemo, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { AdminHeader } from "@/components/admin/admin-header";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { StatCard } from "@/components/admin/stat-card";
import { AdminToast } from "@/components/admin/admin-toast";
import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/api-client";
import type { AdminSIP, AdminStats } from "@/lib/admin-types";
import { formatCurrency } from "@/lib/utils";
import { PiggyBank, Lock, IndianRupee, Download } from "lucide-react";

type SipFilter =
  | "all"
  | "active"
  | "completed"
  | "lock1"
  | "lock3"
  | "lock5";

export function SipPanel() {
  const t = useTranslations("adminPanel");
  const [sips, setSips] = useState<AdminSIP[]>([]);
  const [activeSipUsers, setActiveSipUsers] = useState(0);
  const [filter, setFilter] = useState<SipFilter>("all");
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [sipData, stats] = await Promise.all([
          apiGet<AdminSIP[]>("/api/admin/sip"),
          apiGet<AdminStats>("/api/admin/stats"),
        ]);
        if (!cancelled) {
          setSips(sipData);
          setActiveSipUsers(stats.activeSipUsers);
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

  const filtered = useMemo(() => {
    return sips.filter((sip) => {
      if (filter === "all") return true;
      if (filter === "active" || filter === "completed") return sip.status === filter;
      if (filter === "lock1") return sip.lockYears === 1;
      if (filter === "lock3") return sip.lockYears === 3;
      if (filter === "lock5") return sip.lockYears === 5;
      return true;
    });
  }, [sips, filter]);

  const totalContributions = sips.reduce((s, sip) => s + sip.totalContributed, 0);
  const activeSips = sips.filter((s) => s.status === "active");

  const filters: { key: SipFilter; label: string }[] = [
    { key: "all", label: t("sip.filters.all") },
    { key: "active", label: t("sip.filters.active") },
    { key: "completed", label: t("sip.filters.completed") },
    { key: "lock1", label: t("sip.filters.lock1") },
    { key: "lock3", label: t("sip.filters.lock3") },
    { key: "lock5", label: t("sip.filters.lock5") },
  ];

  function exportReport() {
    const headers = ["ID", "User", "Amount", "Allocation", "Lock Years", "Start", "End", "Status"];
    const rows = filtered.map((s) =>
      [s.id, s.userName, s.amount, `${s.percentOfIncome}%`, s.lockYears, s.startDate, s.endDate, s.status].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "finmora-sip-report.csv";
    a.click();
    URL.revokeObjectURL(url);
    setToast(t("sip.exportSuccess"));
  }

  return (
    <>
      <AdminHeader title={t("sip.title")} subtitle={t("sip.subtitle")} />

      <div className="p-6">
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard
            label={t("sip.activeUsers")}
            value={activeSipUsers.toLocaleString()}
            icon={PiggyBank}
            accent
          />
          <StatCard
            label={t("sip.totalContributions")}
            value={formatCurrency(totalContributions)}
            icon={IndianRupee}
          />
          <StatCard
            label={t("sip.activePlans")}
            value={String(activeSips.length)}
            icon={Lock}
          />
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  filter === f.key
                    ? "bg-primary text-white"
                    : "border border-border bg-card text-muted hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={exportReport}>
            <Download className="h-4 w-4" />
            {t("sip.exportReport")}
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted">
            Loading…
          </div>
        ) : (
          <DataTable<AdminSIP>
            keyField="id"
            data={filtered}
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
                header: t("sip.monthlyAmount"),
                render: (row) => (
                  <span className="font-medium text-accent">
                    {formatCurrency(row.monthlyAmount)}
                  </span>
                ),
              },
              {
                key: "totalContributed",
                header: t("sip.totalContributedCol"),
                render: (row) => (
                  <span className="font-medium">{formatCurrency(row.totalContributed)}</span>
                ),
              },
              {
                key: "percent",
                header: t("sip.allocation"),
                render: (row) => `${row.percentOfIncome}%`,
              },
              {
                key: "lock",
                header: t("sip.lockPeriod"),
                render: (row) => (
                  <span>
                    {row.lockYears}{" "}
                    {row.lockYears === 1 ? t("sip.year") : t("sip.years")}
                  </span>
                ),
              },
              {
                key: "period",
                header: t("sip.period"),
                render: (row) => (
                  <span className="text-xs text-muted">
                    {row.startDate} → {row.endDate}
                  </span>
                ),
              },
              {
                key: "status",
                header: t("table.status"),
                render: (row) => (
                  <StatusBadge
                    status={row.status}
                    label={t(`sip.status.${row.status}`)}
                  />
                ),
              },
            ]}
          />
        )}
      </div>

      <AdminToast message={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
