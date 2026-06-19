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
      {/* Bottom navigation bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
        style={{
          background: "rgba(7, 9, 15, 0.92)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
          {mainTabs.map(({ href, icon: Icon, key, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-medium transition-all duration-200",
                  active ? "text-accent" : "text-muted-foreground"
                )}
              >
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200",
                  active ? "bg-accent/15" : ""
                )}>
                  <Icon className={cn("h-4.5 w-4.5 transition-all", active && "scale-110")} />
                </div>
                {t(key)}
                {active && (
                  <span
                    className="absolute top-0.5 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full"
                    style={{ background: "var(--accent)", boxShadow: "0 0 6px rgba(0,217,126,0.8)" }}
                  />
                )}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-medium transition-all duration-200",
              isMoreActive || moreOpen ? "text-accent" : "text-muted-foreground"
            )}
          >
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200",
              (isMoreActive || moreOpen) ? "bg-accent/15" : ""
            )}>
              <Menu className="h-4.5 w-4.5" />
            </div>
            {t("more")}
            {(isMoreActive || moreOpen) && (
              <span
                className="absolute top-0.5 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full"
                style={{ background: "var(--accent)", boxShadow: "0 0 6px rgba(0,217,126,0.8)" }}
              />
            )}
          </button>
        </div>
      </nav>

      {/* More drawer overlay */}
      {moreOpen && (
        <>
          <div
            className="fixed inset-0 z-50 lg:hidden"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
            onClick={() => setMoreOpen(false)}
          />
          <div
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] lg:hidden animate-in slide-in-from-bottom duration-200"
            style={{
              background: "linear-gradient(180deg, #111827 0%, #0d1117 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderBottom: "none",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.6)",
            }}
          >
            {/* Handle */}
            <div className="mx-auto mb-5 h-1 w-12 rounded-full bg-white/10" />

            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                More Options
              </h3>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {moreLinks.map(({ href, icon: Icon, key }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                      active
                        ? "bg-accent/10 text-accent"
                        : "bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
                    )}
                    style={active ? { border: "1px solid rgba(0,217,126,0.2)" } : { border: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
                      active ? "bg-accent/15" : "bg-white/[0.04]"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    {t(key)}
                  </Link>
                );
              })}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              style={{ border: "1px solid rgba(240, 69, 69, 0.15)" }}
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
