"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { apiGet, apiPatch, apiPost } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Upload, Bell, User, Lock, CheckCircle2 } from "lucide-react";
import type { KYCStatus } from "@/lib/types";
import { DashboardPanelSkeleton } from "@/components/dashboard/dashboard-skeletons";
import { ThemeToggle } from "@/components/layout/theme-toggle";

type UserMe = {
  user: {
    id: string;
    name: string;
    email: string;
    mobile: string;
    referralCode: string;
    kycStatus: KYCStatus;
  };
};

type KycSummary = {
  status: KYCStatus;
  rejectReason: string | null;
  documents: Array<{
    id: string;
    docType: string;
    status: string;
    uploadedAt: string;
  }>;
  canUpload: boolean;
  bothUploaded: boolean;
  underReview: boolean;
};

type KycUploadResponse = {
  documentId: string;
  uploadUrl: string | null;
  mock?: boolean;
};

function inferContentType(file: File): string {
  if (file.type === "image/jpg") return "image/jpeg";
  if (file.type) return file.type;
  if (file.name.toLowerCase().endsWith(".pdf")) return "application/pdf";
  return "image/jpeg";
}

export function SettingsPanel() {
  const t = useTranslations("dashboard.settings");
  const [user, setUser] = useState<UserMe["user"] | null>(null);
  const [kyc, setKyc] = useState<KycSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [notifications, setNotifications] = useState({
    sms: true,
    email: true,
    push: false,
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const loadKyc = useCallback(async () => {
    const data = await apiGet<KycSummary>("/api/kyc");
    setKyc(data);
  }, []);

  useEffect(() => {
    Promise.all([apiGet<UserMe>("/api/users/me"), apiGet<KycSummary>("/api/kyc")])
      .then(([me, kycData]) => {
        setUser(me.user);
        setName(me.user.name);
        setMobile(me.user.mobile);
        setKyc(kycData);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiPatch("/api/users/me", { name, mobile });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleKycUpload(docType: "aadhaar" | "pan", file: File) {
    setUploading(docType);
    setUploadError(null);
    setUploadSuccess(null);
    try {
      const contentType = inferContentType(file);
      const res = await apiPost<KycUploadResponse>("/api/kyc/upload", {
        docType,
        fileName: file.name,
        contentType,
        fileSize: file.size,
      });
      if (res.uploadUrl) {
        const uploadRes = await fetch(res.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": contentType },
          body: file,
        });
        if (!uploadRes.ok) {
          throw new Error("File upload failed");
        }
      }
      await loadKyc();
      setUploadSuccess(t("uploadSuccess"));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  }

  if (loading) {
    return <DashboardPanelSkeleton rows={6} />;
  }

  if (error && !user) {
    return <p className="py-8 text-center text-sm text-destructive">{error}</p>;
  }

  if (!user || !kyc) {
    return <p className="py-8 text-center text-sm text-destructive">Failed to load</p>;
  }

  const kycStatus = kyc.status;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold text-primary">{t("profile")}</h2>
          </div>
          <form onSubmit={handleSave} className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t("name")}</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t("emailAddress")}</label>
              <Input type="email" value={user.email} readOnly />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t("mobile")}</label>
              <Input value={mobile} onChange={(e) => setMobile(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t("referralCode")}</label>
              <Input value={user.referralCode} readOnly className="font-mono" />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" variant="accent" disabled={saving}>{t("saveProfile")}</Button>
              {saved && <span className="ml-3 text-sm text-accent">{t("saved")}</span>}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold text-primary">{t("kyc")}</h2>
            </div>
            <Badge variant={kycStatus === "verified" ? "accent" : kycStatus === "rejected" ? "outline" : "gold"}>
              {t(`kycStatus.${kycStatus}`)}
            </Badge>
          </div>
          {kycStatus === "verified" ? (
            <p className="mt-4 text-sm text-muted">{t("kycVerified")}</p>
          ) : (
            <div className="mt-4 space-y-4">
              {kycStatus === "rejected" && kyc.rejectReason && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
                  <p className="font-medium text-destructive">{t("kycRejected")}</p>
                  <p className="mt-1 text-muted">
                    {t("kycRejectReason")}: {kyc.rejectReason}
                  </p>
                </div>
              )}
              {kyc.underReview && (
                <p className="rounded-xl bg-gold/10 px-4 py-3 text-sm text-primary">
                  {t("kycUnderReview")}
                </p>
              )}
              <p className="text-sm text-muted">{t("kycUploadDesc")}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {(["aadhaar", "pan"] as const).map((doc) => {
                  const uploaded = kyc.documents.find((d) => d.docType === doc);
                  return (
                    <div
                      key={doc}
                      className="rounded-xl border border-border p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{t(doc)}</span>
                        {uploaded ? (
                          <span className="flex items-center gap-1 text-xs text-accent">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {t("docUploaded")}
                          </span>
                        ) : (
                          <span className="text-xs text-muted">{t("docMissing")}</span>
                        )}
                      </div>
                      {kyc.canUpload && (
                        <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border p-4 transition-colors hover:border-accent/50 hover:bg-accent/5">
                          <Upload className="h-6 w-6 text-muted" />
                          <span className="mt-1 text-xs text-muted">
                            {uploading === doc ? "Uploading..." : t("clickUpload")}
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/jpeg,image/png,image/jpg,application/pdf"
                            disabled={!!uploading}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleKycUpload(doc, file);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
              {uploadSuccess && (
                <p className="text-sm text-accent">{uploadSuccess}</p>
              )}
              {uploadError && (
                <p className="text-sm text-destructive">{uploadError}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold text-primary">{t("password")}</h2>
          </div>
          <div className="mt-4 grid gap-4 sm:max-w-md">
            <Input type="password" placeholder={t("currentPassword")} />
            <Input type="password" placeholder={t("newPassword")} />
            <Input type="password" placeholder={t("confirmPassword")} />
            <Button variant="outline">{t("updatePassword")}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-primary">{t("appearance")}</h2>
              <p className="mt-1 text-sm text-muted">{t("appearanceDesc")}</p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold text-primary">{t("notifications")}</h2>
          </div>
          <div className="mt-4 space-y-3">
            {(["sms", "email", "push"] as const).map((key) => (
              <label key={key} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                <span className="text-sm font-medium">{t(key)}</span>
                <input
                  type="checkbox"
                  checked={notifications[key]}
                  onChange={(e) =>
                    setNotifications((prev) => ({ ...prev, [key]: e.target.checked }))
                  }
                  className="h-4 w-4 accent-accent"
                />
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
