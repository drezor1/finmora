"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { AdminHeader } from "@/components/admin/admin-header";
import { DataTable } from "@/components/admin/data-table";
import { StatCard } from "@/components/admin/stat-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { AdminModal } from "@/components/admin/admin-modal";
import { AdminToast } from "@/components/admin/admin-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { apiGet, apiPatch, apiPost } from "@/lib/api-client";
import type { AdminReferral, AdminReferralPenalty } from "@/lib/admin-types";
import { formatCurrency } from "@/lib/utils";
import { Share2, Trophy, IndianRupee, Users, AlertTriangle } from "lucide-react";

type PenaltyReason = "fraud" | "self_referral" | "spam";

export function ReferralsPanel() {
  const t = useTranslations("adminPanel");
  const [referrals, setReferrals] = useState<AdminReferral[]>([]);
  const [penalties, setPenalties] = useState<AdminReferralPenalty[]>([]);
  const [penaltyModal, setPenaltyModal] = useState<AdminReferral | null>(null);
  const [penaltyReason, setPenaltyReason] = useState<PenaltyReason>("fraud");
  const [penaltyAmount, setPenaltyAmount] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const dismissToast = useCallback(() => setToast(null), []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [refs, pens] = await Promise.all([
        apiGet<AdminReferral[]>("/api/admin/referrals"),
        apiGet<AdminReferralPenalty[]>("/api/admin/referrals/penalties"),
      ]);
      setReferrals(refs);
      setPenalties(pens);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalReferrals = referrals.reduce((s, r) => s + r.totalReferrals, 0);
  const totalEarnings = referrals.reduce((s, r) => s + r.totalEarnings, 0);
  const pendingPayouts = referrals.reduce((s, r) => s + r.pendingPayout, 0);
  const sorted = [...referrals].sort(
    (a, b) => b.totalReferrals - a.totalReferrals
  );

  async function approvePayout(referral: AdminReferral) {
    await apiPatch("/api/admin/referrals", {
      userId: referral.id,
      action: "approve_payout",
    });
    await loadData();
    setToast(t("referrals.payoutApproved"));
  }

  async function reversePenalty(penalty: AdminReferralPenalty) {
    await apiPatch(`/api/admin/referrals/penalties/${penalty.id}`, {
      action: "reverse",
    });
    await loadData();
    setToast(t("referrals.penaltyReversedSuccess"));
  }

  async function applyPenalty() {
    if (!penaltyModal || !penaltyAmount) return;
    const newPenalty = await apiPost<AdminReferralPenalty>(
      "/api/admin/referrals/penalties",
      {
        userId: penaltyModal.id,
        reason: penaltyReason,
        amount: Number(penaltyAmount),
      }
    );
    setPenalties((prev) => [newPenalty, ...prev]);
    setPenaltyModal(null);
    setPenaltyAmount("");
    await loadData();
    setToast(t("referrals.penaltyApplied"));
  }

  const reasonOptions: { key: PenaltyReason; label: string }[] = [
    { key: "fraud", label: t("referrals.reasons.fraud") },
    { key: "self_referral", label: t("referrals.reasons.self_referral") },
    { key: "spam", label: t("referrals.reasons.spam") },
  ];

  if (loading) {
    return (
      <>
        <AdminHeader
          title={t("referrals.title")}
          subtitle={t("referrals.subtitle")}
        />
        <div className="flex items-center justify-center p-12 text-sm text-muted">
          Loading…
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader
        title={t("referrals.title")}
        subtitle={t("referrals.subtitle")}
      />

      <div className="p-6">
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label={t("referrals.totalReferrals")}
            value={totalReferrals.toLocaleString()}
            icon={Users}
            accent
          />
          <StatCard
            label={t("referrals.totalEarnings")}
            value={formatCurrency(totalEarnings)}
            icon={IndianRupee}
          />
          <StatCard
            label={t("referrals.pendingPayouts")}
            value={formatCurrency(pendingPayouts)}
            icon={Share2}
          />
          <StatCard
            label={t("referrals.topReferrers")}
            value={String(referrals.length)}
            icon={Trophy}
            accent
          />
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="mb-4 font-semibold text-primary">
              {t("referrals.leaderboard")}
            </h2>
            <div className="space-y-3">
              {sorted.slice(0, 3).map((ref, i) => (
                <div
                  key={ref.id}
                  className="flex items-center gap-4 rounded-xl bg-background p-4"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                      i === 0
                        ? "bg-gold/20 text-gold"
                        : i === 1
                          ? "bg-muted/20 text-muted"
                          : "bg-accent/10 text-accent"
                    }`}
                  >
                    #{i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-primary">{ref.userName}</p>
                    <p className="font-mono text-xs text-muted">
                      {ref.referralCode}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-accent">
                      {ref.totalReferrals} {t("referrals.referrals")}
                    </p>
                    <p className="text-xs text-muted">
                      {formatCurrency(ref.totalEarnings)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <DataTable<AdminReferral>
          keyField="id"
          data={referrals}
          columns={[
            {
              key: "user",
              header: t("table.user"),
              render: (row) => (
                <span className="font-medium">{row.userName}</span>
              ),
            },
            {
              key: "code",
              header: t("table.referralCode"),
              render: (row) => (
                <span className="font-mono text-xs">{row.referralCode}</span>
              ),
            },
            {
              key: "referrals",
              header: t("referrals.referrals"),
              render: (row) => row.totalReferrals,
            },
            {
              key: "earnings",
              header: t("referrals.earnings"),
              render: (row) => (
                <span className="font-medium text-accent">
                  {formatCurrency(row.totalEarnings)}
                </span>
              ),
            },
            {
              key: "pending",
              header: t("referrals.pending"),
              render: (row) =>
                row.pendingPayout > 0 ? (
                  <span className="font-medium text-gold">
                    {formatCurrency(row.pendingPayout)}
                  </span>
                ) : (
                  <span className="text-muted">—</span>
                ),
            },
            {
              key: "balance",
              header: t("referrals.availableBalance"),
              render: (row) => formatCurrency(row.availableBalance),
            },
            {
              key: "actions",
              header: t("table.actions"),
              className: "text-right",
              render: (row) => (
                <div className="flex items-center justify-end gap-2">
                  {row.pendingPayout > 0 && (
                    <Button
                      variant="accent"
                      size="sm"
                      onClick={() => approvePayout(row)}
                    >
                      {t("referrals.approvePayout")}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPenaltyModal(row)}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    {t("referrals.applyPenalty")}
                  </Button>
                </div>
              ),
            },
          ]}
        />

        <h2 className="mb-4 mt-8 font-semibold text-primary">
          {t("referrals.penalties")}
        </h2>
        <DataTable<AdminReferralPenalty>
          keyField="id"
          data={penalties}
          columns={[
            {
              key: "user",
              header: t("table.user"),
              render: (row) => row.userName,
            },
            {
              key: "reason",
              header: t("referrals.penaltyReason"),
              render: (row) => t(`referrals.reasons.${row.reason as PenaltyReason}`),
            },
            {
              key: "amount",
              header: t("table.amount"),
              render: (row) => formatCurrency(row.amount),
            },
            {
              key: "date",
              header: t("table.date"),
              render: (row) => row.appliedAt,
            },
            {
              key: "status",
              header: t("table.status"),
              render: (row) => (
                <StatusBadge
                  status={row.status === "active" ? "rejected" : "approved"}
                  label={
                    row.status === "active"
                      ? t("referrals.penaltyActive")
                      : t("referrals.penaltyReversed")
                  }
                />
              ),
            },
            {
              key: "actions",
              header: t("table.actions"),
              className: "text-right",
              render: (row) =>
                row.status === "active" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => reversePenalty(row)}
                  >
                    {t("referrals.reversePenalty")}
                  </Button>
                ) : null,
            },
          ]}
        />
      </div>

      <AdminModal
        open={!!penaltyModal}
        onClose={() => setPenaltyModal(null)}
        title={t("referrals.applyPenalty")}
      >
        {penaltyModal && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              {t("referrals.penaltyFor")}:{" "}
              <span className="font-medium text-primary">
                {penaltyModal.userName}
              </span>
            </p>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-primary">
                {t("referrals.penaltyReason")}
              </label>
              <select
                value={penaltyReason}
                onChange={(e) => setPenaltyReason(e.target.value as PenaltyReason)}
                className="flex h-11 w-full rounded-xl border border-border bg-card px-4 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                {reasonOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-primary">
                {t("table.amount")}
              </label>
              <Input
                type="number"
                value={penaltyAmount}
                onChange={(e) => setPenaltyAmount(e.target.value)}
                placeholder="5000"
              />
            </div>
            <Button variant="accent" className="w-full" onClick={applyPenalty}>
              {t("referrals.applyPenalty")}
            </Button>
          </div>
        )}
      </AdminModal>

      <AdminToast message={toast} onDismiss={dismissToast} />
    </>
  );
}
