"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Bell, X } from "lucide-react";
import { apiGet, apiPatch } from "@/lib/api-client";

type Notification = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: string;
};

export function NotificationsPanel() {
  const t = useTranslations("dashboard.notifications");
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Notification[]>("/api/notifications")
      .then(setNotifications)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  async function handleMarkAllRead() {
    try {
      await apiPatch("/api/notifications", {});
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // ignore
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-xl border border-border p-2.5 transition-colors hover:bg-background"
        aria-label={t("title")}
      >
        <Bell className="h-5 w-5 text-muted" />
        {unread > 0 && (
          <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-card card-shadow-lg sm:w-96">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="font-semibold text-primary">{t("title")}</h3>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                </div>
              ) : error ? (
                <p className="px-4 py-6 text-center text-xs text-destructive">{error}</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "border-b border-border px-4 py-3 last:border-0",
                      !n.read && "bg-accent/5"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-primary">{n.title}</p>
                      {!n.read && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted">{n.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{n.time}</p>
                  </div>
                ))
              )}
            </div>
            <div className="border-t border-border px-4 py-2 text-center">
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-accent hover:underline"
              >
                {t("markAllRead")}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
