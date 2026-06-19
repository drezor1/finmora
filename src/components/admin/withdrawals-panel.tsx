"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { AdminHeader } from "@/components/admin/admin-header";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { StatCard } from "@/components/admin/stat-card";
import { AdminToast } from "@/components/admin/admin-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiGet, apiPatch } from "@/lib/api-client";
import type { AdminWithdrawal } from "@/lib/admin-types";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle, XCircle, Clock, IndianRupee } from "lucide-react";
import type { WithdrawalStatus } from "@/lib/types";

type WithdrawalFilter = WithdrawalStatus | "all" | "referral_overdue";

export function WithdrawalsPanel() {
  const t = useTranslations("adminPanel");
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([]);
  const [filter, setFilter] = useState<WithdrawalFilter>("all");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  async function loadWithdrawals() {
    setLoading(true);
    try {
      const data = await apiGet<AdminWithdrawal[]>("/api/admin/withdrawals");
      setWithdrawals(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const filtered = useMemo(() => {
    return withdrawals.filter((w) => {
      if (filter === "all") return true;
      if (filter === "referral_overdue") return w.slaOverdue === true;
      return w.status === filter;
    });
  }, [withdrawals, filter]);

  const pending = withdrawals.filter((w) => w.status === "pending");
  const pendingTotal = pending.reduce((s, w) => s + w.amount, 0);
  const overdueCount = withdrawals.filter((w) => w.slaOverdue).length;

  async function updateStatus(id: string, status: WithdrawalStatus) {
    setErrorToast(null);
    try {
      const result = await apiPatch<{ id: string; status: WithdrawalStatus }>(
        `/api/admin/withdrawals/${id}`,
        { status }
      );
      setWithdrawals((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status: result.status, slaOverdue: false } : w))
      );
      setToast(
        status === "approved"
          ? t("withdrawals.approveSuccess")
          : t("withdrawals.rejectSuccess")
      );
      await loadWithdrawals();
    } catch (e) {
      setErrorToast(e instanceof Error ? e.message : "Action failed");
    }
  }

  const filters: { key: WithdrawalFilter; label: string }[] = [
    { key: "all", label: t("withdrawals.all") },
    { key: "pending", label: t("status.pending") },
    { key: "referral_overdue", label: t("withdrawals.slaOverdueFilter") },
    { key: "approved", label: t("status.approved") },
    { key: "rejected", label: t("status.rejected") },
  ];

  return (
    <>
      <AdminHeader
        title={t("withdrawals.title")}
        subtitle={t("withdrawals.subtitle")}
      />

      <div className="p-6">
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard
            label={t("withdrawals.pendingCount")}
            value={String(pending.length)}
            icon={Clock}
          />
          <StatCard
            label={t("withdrawals.pendingAmount")}
            value={formatCurrency(pendingTotal)}
            icon={IndianRupee}
            accent
          />
          <StatCard
            label={t("withdrawals.slaOverdueCount")}
            value={String(overdueCount)}
            icon={Clock}
          />
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
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

        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted">
            Loading…
          </div>
        ) : (
          <DataTable<AdminWithdrawal>
            keyField="id"
            data={filtered}
            columns={[
              {
                key: "id",
                header: t("table.id"),
                render: (row) => (
                  <span className="font-mono text-xs">{row.id}</span>
                ),
              },
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
                render: (row) => (
                  <span className="font-semibold text-accent">
                    {formatCurrency(row.amount)}
                  </span>
                ),
              },
              {
                key: "type",
                header: t("table.type"),
                render: (row) => (
                  <span className="capitalize text-muted">
                    {t(`withdrawals.types.${row.type}`)}
                  </span>
                ),
              },
              {
                key: "date",
                header: t("table.date"),
                render: (row) => row.requestedAt,
              },
              {
                key: "status",
                header: t("table.status"),
                render: (row) => (
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge
                      status={row.status}
                      label={t(`status.${row.status}`)}
                    />
                    {row.slaOverdue && (
                      <Badge variant="outline" className="border-destructive/40 text-destructive">
                        {t("withdrawals.slaOverdue")}
                      </Badge>
                    )}
                  </div>
                ),
              },
              {
                key: "actions",
                header: t("table.actions"),
                className: "text-right",
                render: (row) =>
                  row.status === "pending" ? (
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => updateStatus(row.id, "approved")}
                      >
                        <CheckCircle className="h-4 w-4" />
                        {t("actions.approve")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-destructive/30 text-destructive hover:bg-destructive/5"
                        onClick={() => updateStatus(row.id, "rejected")}
                      >
                        <XCircle className="h-4 w-4" />
                        {t("actions.reject")}
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted">—</span>
                  ),
              },
            ]}
          />
        )}
      </div>

      <AdminToast message={toast} onDismiss={() => setToast(null)} />
      <AdminToast message={errorToast} onDismiss={() => setErrorToast(null)} />
    </>
  );
}
