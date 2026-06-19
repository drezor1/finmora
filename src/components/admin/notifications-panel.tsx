"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { AdminHeader } from "@/components/admin/admin-header";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { AdminToast } from "@/components/admin/admin-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { apiGet, apiPost } from "@/lib/api-client";
import type { AdminNotification } from "@/lib/admin-types";
import { Bell, Mail, Layers } from "lucide-react";

const audienceKeys = [
  "allUsers",
  "activeInvestors",
  "pendingKyc",
  "pendingWithdrawals",
] as const;

type NotifyChannel = "in_app" | "email" | "both";

type AdminNotificationResponse = AdminNotification & {
  recipientCount?: number;
};

export function NotificationsPanel() {
  const t = useTranslations("adminPanel");
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [channel, setChannel] = useState<NotifyChannel>("in_app");
  const [audience, setAudience] = useState<(typeof audienceKeys)[number]>("allUsers");
  const [scheduleAt, setScheduleAt] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await apiGet<AdminNotification[]>("/api/admin/notifications");
        if (!cancelled) setNotifications(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const channels: {
    key: NotifyChannel;
    icon: typeof Bell;
    label: string;
  }[] = [
    { key: "in_app", icon: Bell, label: t("notifications.channelInApp") },
    { key: "email", icon: Mail, label: t("notifications.channelEmail") },
    { key: "both", icon: Layers, label: t("notifications.channelBoth") },
  ];

  const channelIcons: Record<string, typeof Bell> = {
    in_app: Bell,
    email: Mail,
    both: Layers,
    sms: Mail,
    push: Bell,
  };

  function resetForm() {
    setTitle("");
    setMessage("");
    setScheduleAt("");
  }

  function toastForResult(entry: AdminNotificationResponse, scheduled: boolean) {
    if (scheduled) {
      setToast(t("notifications.scheduledSuccess"));
      return;
    }
    const count = entry.recipientCount ?? 0;
    setToast(t("notifications.sentSuccessCount", { count }));
  }

  async function sendNow(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    const entry = await apiPost<AdminNotificationResponse>(
      "/api/admin/notifications",
      {
        title,
        message,
        channel,
        audience,
      }
    );
    setNotifications((prev) => [entry, ...prev]);
    resetForm();
    toastForResult(entry, false);
  }

  async function scheduleNotification() {
    if (!title.trim() || !message.trim() || !scheduleAt) return;
    const entry = await apiPost<AdminNotificationResponse>(
      "/api/admin/notifications",
      {
        title,
        message,
        channel,
        audience,
        scheduledAt: scheduleAt,
      }
    );
    setNotifications((prev) => [entry, ...prev]);
    resetForm();
    toastForResult(entry, true);
  }

  return (
    <>
      <AdminHeader
        title={t("notifications.title")}
        subtitle={t("notifications.subtitle")}
      />

      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-2">
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5 text-accent" />
                <h2 className="font-semibold text-primary">
                  {t("notifications.compose")}
                </h2>
              </div>

              <form className="space-y-4" onSubmit={sendNow}>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-primary">
                    {t("notifications.channel")}
                  </label>
                  <div className="flex gap-2">
                    {channels.map(({ key, icon: Icon, label }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setChannel(key)}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-medium transition-colors sm:text-sm ${
                          channel === key
                            ? "border-accent bg-accent/10 text-accent-dark"
                            : "border-border text-muted hover:border-accent/30"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-primary">
                    {t("notifications.notifTitle")}
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t("notifications.titlePlaceholder")}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-primary">
                    {t("notifications.message")}
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t("notifications.messagePlaceholder")}
                    className="flex min-h-[100px] w-full rounded-xl border border-border bg-card px-4 py-3 text-sm transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-primary">
                    {t("notifications.audience")}
                  </label>
                  <select
                    value={audience}
                    onChange={(e) =>
                      setAudience(e.target.value as (typeof audienceKeys)[number])
                    }
                    className="flex h-11 w-full rounded-xl border border-border bg-card px-4 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  >
                    {audienceKeys.map((key) => (
                      <option key={key} value={key}>
                        {t(`notifications.${key}`)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-primary">
                    {t("notifications.scheduleAt")}
                  </label>
                  <Input
                    type="datetime-local"
                    value={scheduleAt}
                    onChange={(e) => setScheduleAt(e.target.value)}
                  />
                </div>

                <div className="flex gap-3">
                  <Button variant="accent" className="flex-1" type="submit">
                    {t("notifications.sendNow")}
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={scheduleNotification}
                    disabled={!scheduleAt}
                  >
                    {t("notifications.schedule")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="lg:col-span-3">
            <h2 className="mb-4 font-semibold text-primary">
              {t("notifications.history")}
            </h2>
            {loading ? (
              <div className="flex items-center justify-center py-12 text-sm text-muted">
                Loading…
              </div>
            ) : (
              <DataTable<AdminNotification>
                keyField="id"
                data={notifications}
                columns={[
                  {
                    key: "title",
                    header: t("notifications.notifTitle"),
                    render: (row) => (
                      <span className="font-medium">{row.title}</span>
                    ),
                  },
                  {
                    key: "channel",
                    header: t("notifications.channel"),
                    render: (row) => {
                      const Icon = channelIcons[row.channel] ?? Bell;
                      return (
                        <span className="flex items-center gap-1.5 text-muted">
                          <Icon className="h-4 w-4" />
                          {t(`notifications.channelLabel.${row.channel}`, {
                            default: row.channel,
                          })}
                        </span>
                      );
                    },
                  },
                  {
                    key: "audience",
                    header: t("notifications.audience"),
                    render: (row) => (
                      <span className="text-sm text-muted">
                        {row.audienceLabel ??
                          t(`notifications.${row.audience as (typeof audienceKeys)[number]}`, {
                            default: row.audience,
                          })}
                      </span>
                    ),
                  },
                  {
                    key: "recipientCount",
                    header: t("notifications.recipients"),
                    render: (row) =>
                      row.recipientCount != null && row.recipientCount > 0
                        ? row.recipientCount.toLocaleString()
                        : "—",
                  },
                  {
                    key: "sentAt",
                    header: t("table.date"),
                    render: (row) => (
                      <span className="text-xs text-muted">{row.sentAt}</span>
                    ),
                  },
                  {
                    key: "status",
                    header: t("table.status"),
                    render: (row) => (
                      <StatusBadge
                        status={row.status}
                        label={t(`notifications.status.${row.status}`)}
                      />
                    ),
                  },
                ]}
              />
            )}
          </div>
        </div>
      </div>

      <AdminToast message={toast} onDismiss={dismissToast} />
    </>
  );
}
