"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { AdminHeader } from "@/components/admin/admin-header";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { AdminModal } from "@/components/admin/admin-modal";
import { AdminToast } from "@/components/admin/admin-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiGet, apiPatch } from "@/lib/api-client";
import type { AdminUser } from "@/lib/admin-types";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle, XCircle, Eye, ExternalLink } from "lucide-react";
import type { KYCStatus } from "@/lib/types";

type AdminKycDoc = {
  id: string;
  docType: string;
  status: string;
  uploadedAt: string;
  viewUrl: string | null;
  mock: boolean;
};

type AdminKycResponse = {
  documents: AdminKycDoc[];
  bothUploaded: boolean;
};

export function UsersPanel() {
  const t = useTranslations("adminPanel");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filter, setFilter] = useState<KYCStatus | "all">("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [kycDocs, setKycDocs] = useState<AdminKycResponse | null>(null);
  const [kycLoading, setKycLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (filter !== "all") params.set("kyc", filter);
        const query = params.toString();
        const data = await apiGet<AdminUser[]>(
          `/api/admin/users${query ? `?${query}` : ""}`
        );
        if (!cancelled) setUsers(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [search, filter]);

  async function loadUserKyc(userId: string) {
    setKycLoading(true);
    try {
      const data = await apiGet<AdminKycResponse>(`/api/admin/users/${userId}/kyc`);
      setKycDocs(data);
    } catch {
      setKycDocs(null);
    } finally {
      setKycLoading(false);
    }
  }

  async function openUser(user: AdminUser) {
    setSelectedUser(user);
    setRejectReason("");
    await loadUserKyc(user.id);
  }

  async function handleKycAction(action: "approve_kyc" | "reject_kyc") {
    if (!selectedUser) return;
    setErrorToast(null);
    try {
      const result = await apiPatch<{ id: string; kycStatus: KYCStatus; status: "active" | "suspended" }>(
        `/api/admin/users/${selectedUser.id}`,
        action === "approve_kyc"
          ? { action: "approve_kyc" }
          : { action: "reject_kyc", reason: rejectReason || undefined }
      );
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? { ...u, kycStatus: result.kycStatus, status: result.status }
            : u
        )
      );
      setSelectedUser((prev) =>
        prev ? { ...prev, kycStatus: result.kycStatus, status: result.status } : null
      );
      setToast(
        action === "approve_kyc" ? t("users.kycApproved") : t("users.kycRejected")
      );
      await loadUserKyc(selectedUser.id);
    } catch (e) {
      setErrorToast(e instanceof Error ? e.message : "Action failed");
    }
  }

  async function toggleSuspend(user: AdminUser) {
    const next = user.status === "suspended" ? "active" : "suspended";
    const result = await apiPatch<{ id: string; kycStatus: KYCStatus; status: "active" | "suspended" }>(
      `/api/admin/users/${user.id}`,
      { accountStatus: next }
    );
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id ? { ...u, status: result.status } : u
      )
    );
    setSelectedUser((prev) =>
      prev?.id === user.id ? { ...prev, status: result.status } : prev
    );
    setToast(
      next === "suspended" ? t("users.suspended") : t("users.reactivated")
    );
  }

  const filters: { key: KYCStatus | "all"; label: string }[] = [
    { key: "all", label: t("users.all") },
    { key: "pending", label: t("kyc.pending") },
    { key: "verified", label: t("kyc.verified") },
    { key: "rejected", label: t("kyc.rejected") },
  ];

  return (
    <>
      <AdminHeader
        title={t("users.title")}
        subtitle={t("users.subtitle")}
        showSearch
        searchPlaceholder={t("users.searchPlaceholder")}
        onSearch={setSearch}
      />

      <div className="p-6">
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
          <DataTable<AdminUser>
            keyField="id"
            data={users}
            emptyMessage={t("users.noResults")}
            columns={[
              {
                key: "name",
                header: t("table.name"),
                render: (row) => (
                  <div>
                    <p className="font-medium text-primary">{row.name}</p>
                    <p className="text-xs text-muted">{row.id}</p>
                  </div>
                ),
              },
              {
                key: "contact",
                header: t("table.contact"),
                render: (row) => (
                  <div className="text-muted">
                    <p>{row.email}</p>
                    <p className="text-xs">{row.mobile}</p>
                  </div>
                ),
              },
              {
                key: "plan",
                header: t("table.plan"),
                render: (row) => row.plan,
              },
              {
                key: "investment",
                header: t("table.investment"),
                render: (row) => (
                  <span className="font-medium text-accent">
                    {formatCurrency(row.totalInvestment)}
                  </span>
                ),
              },
              {
                key: "referral",
                header: t("table.referralCode"),
                render: (row) => (
                  <span className="font-mono text-xs">{row.referralCode}</span>
                ),
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
              {
                key: "actions",
                header: t("table.actions"),
                className: "text-right",
                render: (row) => (
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      title={t("users.detail.view")}
                      onClick={() => openUser(row)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {row.kycStatus === "pending" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-accent hover:text-accent-dark"
                          onClick={() => openUser(row)}
                          title={t("actions.approve")}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => openUser(row)}
                          title={t("actions.reject")}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ),
              },
            ]}
          />
        )}

        <p className="mt-4 text-sm text-muted">
          {t("users.showing", { count: users.length, total: users.length })}
        </p>
      </div>

      <AdminModal
        open={!!selectedUser}
        onClose={() => {
          setSelectedUser(null);
          setKycDocs(null);
        }}
        title={t("users.detail.title")}
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted">{t("table.name")}</p>
                <p className="font-medium text-primary">{selectedUser.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted">{t("table.email")}</p>
                <p className="text-sm">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted">{t("users.detail.mobile")}</p>
                <p className="text-sm">{selectedUser.mobile}</p>
              </div>
              <div>
                <p className="text-xs text-muted">{t("users.detail.joined")}</p>
                <p className="text-sm">{selectedUser.createdAt}</p>
              </div>
              <div>
                <p className="text-xs text-muted">{t("table.plan")}</p>
                <p className="text-sm">{selectedUser.plan}</p>
              </div>
              <div>
                <p className="text-xs text-muted">{t("table.investment")}</p>
                <p className="font-medium text-accent">
                  {formatCurrency(selectedUser.totalInvestment)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">{t("table.kyc")}</p>
                <StatusBadge
                  status={selectedUser.kycStatus}
                  label={t(`kyc.${selectedUser.kycStatus}`)}
                />
              </div>
            </div>

            <div className="rounded-xl border border-border p-4">
              <h3 className="text-sm font-semibold text-primary">{t("users.kycSection")}</h3>
              {kycLoading ? (
                <p className="mt-2 text-sm text-muted">Loading…</p>
              ) : kycDocs && kycDocs.documents.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {kycDocs.documents.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="capitalize">{doc.docType}</span>
                      {doc.viewUrl ? (
                        <a
                          href={doc.viewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-accent hover:underline"
                        >
                          {t("users.viewDocument")}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : doc.mock ? (
                        <span className="text-xs text-muted">{t("users.mockDocument")}</span>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-muted">{t("users.bothDocsRequired")}</p>
              )}
              {!kycDocs?.bothUploaded && kycDocs && (
                <p className="mt-2 text-xs text-gold">{t("users.bothDocsRequired")}</p>
              )}
            </div>

            {selectedUser.kycStatus === "pending" && (
              <div className="space-y-3">
                <Input
                  placeholder={t("users.rejectReasonPlaceholder")}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    variant="accent"
                    className="flex-1"
                    onClick={() => handleKycAction("approve_kyc")}
                  >
                    {t("users.approveKyc")}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-destructive/30 text-destructive"
                    onClick={() => handleKycAction("reject_kyc")}
                  >
                    {t("users.rejectKyc")}
                  </Button>
                </div>
              </div>
            )}

            <Button
              variant={selectedUser.status === "suspended" ? "accent" : "outline"}
              className="w-full"
              onClick={() => toggleSuspend(selectedUser)}
            >
              {selectedUser.status === "suspended"
                ? t("users.reactivate")
                : t("users.suspend")}
            </Button>
          </div>
        )}
      </AdminModal>

      <AdminToast message={toast} onDismiss={dismissToast} />
      <AdminToast message={errorToast} onDismiss={() => setErrorToast(null)} />
    </>
  );
}
