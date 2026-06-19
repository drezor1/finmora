"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Wallet,
  Share2,
  PiggyBank,
  Menu,
  Banknote,
  Trophy,
  FileText,
  Settings,
  LogOut,
  X,
} from "lucide-react";

const mainTabs = [
  { href: "/dashboard", icon: LayoutDashboard, key: "overview" as const, exact: true },
  { href: "/dashboard/investments", icon: Wallet, key: "investments" as const },
  { href: "/dashboard/referrals", icon: Share2, key: "referrals" as const },
  { href: "/dashboard/sip", icon: PiggyBank, key: "sip" as const },
];

const moreLinks = [
  { href: "/dashboard/withdrawals", icon: Banknote, key: "withdrawals" as const },
  { href: "/dashboard/leaderboard", icon: Trophy, key: "leaderboard" as const },
  { href: "/dashboard/invoices", icon: FileText, key: "invoices" as const },
  { href: "/dashboard/settings", icon: Settings, key: "settings" as const },
];

export function DashboardBottomNav() {
  const t = useTranslations("dashboard.nav");
  const pathname = usePathname();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreActive = moreLinks.some((l) => pathname === l.href);

  async function handleLogout() {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <nav className="glass-nav fixed bottom-0 left-0 right-0 z-40 border-t border-border/50 lg:hidden">
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
          {mainTabs.map(({ href, icon: Icon, key, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-all",
                  active ? "scale-105 text-accent" : "text-muted"
                )}
              >
                {active && (
                  <span className="absolute top-1 h-1 w-1 rounded-full bg-accent" />
                )}
                <Icon className={cn("h-5 w-5 transition-transform", active && "scale-110 text-accent")} />
                {t(key)}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-all",
              isMoreActive || moreOpen ? "scale-105 text-accent" : "text-muted"
            )}
          >
            {(isMoreActive || moreOpen) && (
              <span className="absolute top-1 h-1 w-1 rounded-full bg-accent" />
            )}
            <Menu className={cn("h-5 w-5", (isMoreActive || moreOpen) && "scale-110")} />
            {t("more")}
          </button>
        </div>
      </nav>

      {moreOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 lg:hidden"
            onClick={() => setMoreOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-border bg-card p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] lg:hidden card-shadow-lg animate-in slide-in-from-bottom duration-200">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-primary">{t("more")}</h3>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="rounded-lg p-1 text-muted hover:bg-background"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {moreLinks.map(({ href, icon: Icon, key }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-medium transition-colors",
                    pathname === href
                      ? "border-accent/30 bg-accent/10 text-accent"
                      : "text-primary hover:bg-background"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t(key)}
                </Link>
              ))}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/20 py-3 text-sm font-medium text-destructive hover:bg-destructive/5"
            >
              <LogOut className="h-4 w-4" />
              {t("logout")}
            </button>
          </div>
        </>
      )}
    </>
  );
}
