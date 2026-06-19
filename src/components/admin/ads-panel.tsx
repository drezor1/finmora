"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { AdminHeader } from "@/components/admin/admin-header";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { StatCard } from "@/components/admin/stat-card";
import { AdminModal } from "@/components/admin/admin-modal";
import { AdminToast } from "@/components/admin/admin-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";
import type { AdminAd, AdminAdInquiry } from "@/lib/admin-types";
import {
  Megaphone,
  Eye,
  MousePointer,
  Building,
  Plus,
  Pencil,
  Trash2,
  Inbox,
  Mail,
} from "lucide-react";

type AdForm = {
  title: string;
  advertiser: string;
  startDate: string;
  targetUrl: string;
  imageKey: string;
};

const emptyForm: AdForm = {
  title: "",
  advertiser: "",
  startDate: "",
  targetUrl: "",
  imageKey: "",
};

export function AdsPanel() {
  const t = useTranslations("adminPanel");
  const [tab, setTab] = useState<"ads" | "inquiries">("ads");
  const [ads, setAds] = useState<AdminAd[]>([]);
  const [inquiries, setInquiries] = useState<AdminAdInquiry[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editAd, setEditAd] = useState<AdminAd | null>(null);
  const [form, setForm] = useState<AdForm>(emptyForm);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingAdId, setPendingAdId] = useState<string | null>(null);

  const dismissToast = useCallback(() => setToast(null), []);

  const companyAds = ads.filter((a) => a.type === "company");

  async function loadData() {
    setLoading(true);
    try {
      const [adsData, inquiriesData] = await Promise.all([
        apiGet<AdminAd[]>("/api/admin/ads"),
        apiGet<AdminAdInquiry[]>("/api/admin/ad-inquiries"),
      ]);
      setAds(adsData);
      setInquiries(inquiriesData);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const totalImpressions = companyAds.reduce((s, a) => s + a.impressions, 0);
  const totalClicks = companyAds.reduce((s, a) => s + a.clicks, 0);
  const activeCount = companyAds.filter((a) => a.status === "active").length;
  const pendingInquiries = inquiries.filter((i) => i.status === "pending").length;

  async function toggleStatus(ad: AdminAd) {
    const next =
      ad.status === "active"
        ? "paused"
        : ad.status === "paused"
          ? "active"
          : ad.status;
    const updated = await apiPatch<AdminAd>(`/api/admin/ads/${ad.id}`, {
      status: next,
    });
    setAds((prev) => prev.map((a) => (a.id === ad.id ? { ...a, ...updated } : a)));
  }

  async function approveAd(id: string) {
    const updated = await apiPatch<AdminAd>(`/api/admin/ads/${id}`, {
      status: "active",
    });
    setAds((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)));
    setToast(t("ads.approveSuccess"));
  }

  function openCreate(fromInquiry?: AdminAdInquiry) {
    setForm(
      fromInquiry
        ? {
            title: fromInquiry.name,
            advertiser: fromInquiry.name,
            startDate: new Date().toISOString().slice(0, 10),
            targetUrl: "",
            imageKey: "",
          }
        : emptyForm
    );
    setCreateOpen(true);
  }

  function openEdit(ad: AdminAd) {
    setForm({
      title: ad.title,
      advertiser: ad.advertiser,
      startDate: ad.startDate,
      targetUrl: ad.targetUrl ?? "",
      imageKey: ad.imageKey ?? "",
    });
    setEditAd(ad);
    setPendingAdId(ad.id);
  }

  async function saveCreate() {
    if (!form.title || !form.advertiser) return;
    const newAd = await apiPost<AdminAd>("/api/admin/ads", {
      title: form.title,
      advertiser: form.advertiser,
      startDate: form.startDate || undefined,
      targetUrl: form.targetUrl || undefined,
      imageKey: form.imageKey || undefined,
    });
    setAds((prev) => [newAd, ...prev]);
    setCreateOpen(false);
    setEditAd(newAd);
    setPendingAdId(newAd.id);
    setForm({
      title: newAd.title,
      advertiser: newAd.advertiser,
      startDate: newAd.startDate,
      targetUrl: newAd.targetUrl ?? "",
      imageKey: newAd.imageKey ?? "",
    });
    setToast(t("ads.createSuccess"));
  }

  async function saveEdit() {
    if (!editAd) return;
    const updated = await apiPatch<AdminAd>(`/api/admin/ads/${editAd.id}`, {
      title: form.title,
      advertiser: form.advertiser,
      startDate: form.startDate,
      targetUrl: form.targetUrl,
      imageKey: form.imageKey || null,
    });
    setAds((prev) =>
      prev.map((a) => (a.id === editAd.id ? { ...a, ...updated } : a))
    );
    setEditAd(null);
    setToast(t("ads.editSuccess"));
  }

  async function deleteAd(id: string) {
    await apiDelete(`/api/admin/ads/${id}`);
    setAds((prev) => prev.filter((a) => a.id !== id));
    setToast(t("ads.deleteSuccess"));
  }

  async function updateInquiryStatus(
    id: string,
    status: "contacted" | "converted"
  ) {
    const updated = await apiPatch<AdminAdInquiry>(
      `/api/admin/ad-inquiries/${id}`,
      { status }
    );
    setInquiries((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...updated } : i))
    );
  }

  async function handleImageUpload(file: File, adId: string) {
    setUploading(true);
    try {
      const meta = await apiPost<{
        signedUrl?: string;
        path?: string;
        mock?: boolean;
      }>("/api/admin/ads/upload-url", {
        adId,
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
      });

      if (meta.mock && meta.path) {
        setForm((f) => ({ ...f, imageKey: meta.path! }));
        setToast(t("ads.mockUpload"));
        return;
      }

      if (!meta.signedUrl || !meta.path) throw new Error("Upload failed");

      await fetch(meta.signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      setForm((f) => ({ ...f, imageKey: meta.path! }));
      setToast(t("ads.imageUploaded"));
    } catch {
      setToast(t("ads.uploadFailed"));
    } finally {
      setUploading(false);
    }
  }

  const formFields = (
    <>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-primary">
          {t("ads.adTitle")}
        </label>
        <Input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-primary">
          {t("ads.advertiser")}
        </label>
        <Input
          value={form.advertiser}
          onChange={(e) => setForm({ ...form, advertiser: e.target.value })}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-primary">
          {t("table.date")}
        </label>
        <Input
          type="date"
          value={form.startDate}
          onChange={(e) => setForm({ ...form, startDate: e.target.value })}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-primary">
          {t("ads.targetUrl")}
        </label>
        <Input
          value={form.targetUrl}
          onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
          placeholder="https://"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-primary">
          {t("ads.imageKey")}
        </label>
        <Input
          value={form.imageKey}
          onChange={(e) => setForm({ ...form, imageKey: e.target.value })}
          placeholder="Storage path or https:// image URL"
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            const adId = pendingAdId ?? editAd?.id;
            if (file && adId) handleImageUpload(file, adId);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          disabled={uploading || !(pendingAdId ?? editAd?.id)}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? t("ads.uploading") : t("ads.uploadImage")}
        </Button>
        {!(pendingAdId ?? editAd?.id) && createOpen && (
          <p className="mt-1 text-xs text-muted">{t("ads.saveFirstForUpload")}</p>
        )}
      </div>
    </>
  );

  if (loading) {
    return (
      <>
        <AdminHeader title={t("ads.title")} subtitle={t("ads.subtitleCompany")} />
        <div className="flex items-center justify-center p-12 text-sm text-muted">
          Loading…
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader title={t("ads.title")} subtitle={t("ads.subtitleCompany")} />

      <div className="p-6">
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          <StatCard
            label={t("ads.activeAds")}
            value={String(activeCount)}
            icon={Megaphone}
            accent
          />
          <StatCard
            label={t("ads.impressions")}
            value={totalImpressions.toLocaleString()}
            icon={Eye}
          />
          <StatCard
            label={t("ads.clicks")}
            value={totalClicks.toLocaleString()}
            icon={MousePointer}
          />
          <StatCard
            label={t("ads.pendingInquiries")}
            value={String(pendingInquiries)}
            icon={Inbox}
          />
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setTab("ads")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === "ads"
                  ? "bg-primary text-white"
                  : "border border-border bg-card text-muted hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5" />
                {t("ads.company")}
              </span>
            </button>
            <button
              onClick={() => setTab("inquiries")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === "inquiries"
                  ? "bg-primary text-white"
                  : "border border-border bg-card text-muted hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {t("ads.inquiries")}
                {pendingInquiries > 0 && (
                  <Badge variant="gold" className="ml-1 h-5 px-1.5 text-[10px]">
                    {pendingInquiries}
                  </Badge>
                )}
              </span>
            </button>
          </div>
          {tab === "ads" && (
            <Button variant="accent" size="sm" onClick={() => openCreate()}>
              <Plus className="h-4 w-4" />
              {t("ads.createAd")}
            </Button>
          )}
        </div>

        {tab === "ads" ? (
          <DataTable<AdminAd>
            keyField="id"
            data={companyAds}
            columns={[
              {
                key: "title",
                header: t("ads.adTitle"),
                render: (row) => (
                  <div>
                    <p className="font-medium text-primary">{row.title}</p>
                    <p className="text-xs text-muted">{row.advertiser}</p>
                  </div>
                ),
              },
              {
                key: "impressions",
                header: t("ads.impressions"),
                render: (row) => row.impressions.toLocaleString(),
              },
              {
                key: "clicks",
                header: t("ads.clicks"),
                render: (row) => row.clicks.toLocaleString(),
              },
              {
                key: "ctr",
                header: "CTR",
                render: (row) =>
                  row.impressions > 0
                    ? `${((row.clicks / row.impressions) * 100).toFixed(2)}%`
                    : "—",
              },
              {
                key: "status",
                header: t("table.status"),
                render: (row) => (
                  <StatusBadge
                    status={row.status === "pending" ? "pending" : row.status}
                    label={t(`ads.status.${row.status}`)}
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
                      onClick={() => openEdit(row)}
                      title={t("ads.editAd")}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => deleteAd(row.id)}
                      title={t("ads.deleteAd")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {row.status === "pending" && (
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => approveAd(row.id)}
                      >
                        {t("actions.approve")}
                      </Button>
                    )}
                    {(row.status === "active" || row.status === "paused") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleStatus(row)}
                      >
                        {row.status === "active"
                          ? t("ads.pause")
                          : t("ads.activate")}
                      </Button>
                    )}
                  </div>
                ),
              },
            ]}
          />
        ) : (
          <DataTable<AdminAdInquiry>
            keyField="id"
            data={inquiries}
            columns={[
              {
                key: "name",
                header: t("table.name"),
                render: (row) => (
                  <div>
                    <p className="font-medium text-primary">{row.name}</p>
                    <p className="text-xs text-muted">{row.email}</p>
                  </div>
                ),
              },
              {
                key: "package",
                header: t("ads.package"),
                render: (row) => row.package ?? "—",
              },
              {
                key: "message",
                header: t("ads.inquiryMessage"),
                render: (row) => (
                  <p className="max-w-xs truncate text-sm text-muted">{row.message}</p>
                ),
              },
              {
                key: "status",
                header: t("table.status"),
                render: (row) => (
                  <StatusBadge
                    status={row.status === "pending" ? "pending" : "active"}
                    label={t(`ads.inquiryStatus.${row.status}`)}
                  />
                ),
              },
              {
                key: "actions",
                header: t("table.actions"),
                className: "text-right",
                render: (row) => (
                  <div className="flex items-center justify-end gap-1">
                    {row.status === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateInquiryStatus(row.id, "contacted")}
                        >
                          {t("ads.markContacted")}
                        </Button>
                        <Button
                          variant="accent"
                          size="sm"
                          onClick={() => openCreate(row)}
                        >
                          {t("ads.createFromInquiry")}
                        </Button>
                      </>
                    )}
                    {row.status === "contacted" && (
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => updateInquiryStatus(row.id, "converted")}
                      >
                        {t("ads.markConverted")}
                      </Button>
                    )}
                  </div>
                ),
              },
            ]}
          />
        )}
      </div>

      <AdminModal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setPendingAdId(null);
        }}
        title={t("ads.createAd")}
      >
        <div className="space-y-4">
          {formFields}
          <Button variant="accent" className="w-full" onClick={saveCreate}>
            {t("ads.createAd")}
          </Button>
        </div>
      </AdminModal>

      <AdminModal
        open={!!editAd}
        onClose={() => {
          setEditAd(null);
          setPendingAdId(null);
        }}
        title={t("ads.editAd")}
      >
        <div className="space-y-4">
          {formFields}
          <Button variant="accent" className="w-full" onClick={saveEdit}>
            {t("ads.editAd")}
          </Button>
        </div>
      </AdminModal>

      <AdminToast message={toast} onDismiss={dismissToast} />
    </>
  );
}
