"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/layout/brand-logo";
import {
  TrendingUp,
  LayoutDashboard,
  Wallet,
  Share2,
  PiggyBank,
  Banknote,
  Settings,
  LogOut,
  Trophy,
  FileText,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, key: "overview" as const },
  { href: "/dashboard/investments", icon: Wallet, key: "investments" as const },
  { href: "/dashboard/referrals", icon: Share2, key: "referrals" as const },
  { href: "/dashboard/sip", icon: PiggyBank, key: "sip" as const },
  { href: "/dashboard/withdrawals", icon: Banknote, key: "withdrawals" as const },
  { href: "/dashboard/leaderboard", icon: Trophy, key: "leaderboard" as const },
  { href: "/dashboard/invoices", icon: FileText, key: "invoices" as const },
  { href: "/dashboard/settings", icon: Settings, key: "settings" as const },
];

export function DashboardSidebar() {
  const t = useTranslations("dashboard.nav");
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block"
      style={{ background: "linear-gradient(180deg, #0a0c14 0%, #070911 100%)", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: "linear-gradient(135deg, #00d97e 0%, #00b869 100%)", boxShadow: "0 0 16px rgba(0,217,126,0.35)" }}
          >
            <TrendingUp className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
          </div>
          <BrandLogo className="text-[17px] text-foreground" accentClassName="text-accent" />
        </div>

        {/* Navigation label */}
        <div className="px-6 pb-1 pt-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
            Navigation
          </p>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
          {navItems.map(({ href, icon: Icon, key }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                )}
              >
                {active && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full"
                    style={{ background: "var(--accent)", boxShadow: "0 0 8px rgba(0,217,126,0.7)" }}
                  />
                )}
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors duration-200",
                    active ? "text-accent" : "text-muted group-hover:text-foreground"
                  )}
                />
                {t(key)}
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" style={{ boxShadow: "0 0 6px rgba(0,217,126,0.8)" }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            {t("logout")}
          </button>
        </div>
      </div>
    </aside>
  );
}
