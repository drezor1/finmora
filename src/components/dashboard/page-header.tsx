"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { NotificationsPanel } from "@/components/dashboard/notifications-panel";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { apiGet } from "@/lib/api-client";

type DashboardPageHeaderProps = {
  titleKey: string;
  subtitleKey?: string;
  namespace?: string;
};

export function DashboardPageHeader({
  titleKey,
  subtitleKey,
  namespace = "dashboard",
}: DashboardPageHeaderProps) {
  const t = useTranslations(namespace);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/95 px-4 py-4 backdrop-blur-md sm:px-6">
      <div className="min-w-0 flex-1 pr-4">
        <h1 className="truncate text-lg font-bold text-primary sm:text-xl">{t(titleKey)}</h1>
        {subtitleKey && (
          <p className="truncate text-sm text-muted">{t(subtitleKey)}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle />
        <NotificationsPanel />
      </div>
    </header>
  );
}

export function DashboardOverviewHeader() {
  const t = useTranslations("dashboard");
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    apiGet<{ user: { name: string } }>("/api/users/me")
      .then((data) => setUserName(data.user.name))
      .catch(() => setUserName(null));
  }, []);

  const greeting = userName
    ? `${t("welcome")}, ${userName.split(" ")[0]}`
    : t("title");

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/95 px-4 py-4 backdrop-blur-md sm:px-6 lg:hidden">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-bold text-primary">{greeting}</h1>
        <p className="text-sm text-muted">{t("portfolioValue")}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle />
        <NotificationsPanel />
      </div>
    </header>
  );
}
