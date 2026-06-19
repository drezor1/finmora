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
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-primary lg:block">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 border-b border-white/10 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <BrandLogo className="text-lg text-white" />
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {navItems.map(({ href, icon: Icon, key }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent/20 text-accent"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {t(key)}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            {t("logout")}
          </button>
        </div>
      </div>
    </aside>
  );
}
