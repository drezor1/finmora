"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/layout/brand-logo";
import { signOut } from "next-auth/react";
import {
  Shield,
  LayoutDashboard,
  Users,
  Banknote,
  Share2,
  PiggyBank,
  Megaphone,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, key: "overview" as const, exact: true },
  { href: "/admin/users", icon: Users, key: "users" as const },
  { href: "/admin/withdrawals", icon: Banknote, key: "withdrawals" as const },
  { href: "/admin/referrals", icon: Share2, key: "referrals" as const },
  { href: "/admin/sip", icon: PiggyBank, key: "sip" as const },
  { href: "/admin/ads", icon: Megaphone, key: "ads" as const },
  { href: "/admin/notifications", icon: Bell, key: "notifications" as const },
];

export function AdminSidebar() {
  const t = useTranslations("adminPanel.nav");
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await signOut({ redirect: false });
    router.push("/");
  }

  return (
    <>
      <button
        className="fixed left-4 top-4 z-50 rounded-lg bg-primary p-2 text-white lg:hidden"
        onClick={() => setOpen(!open)}
        aria-label="Toggle admin menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform border-r border-white/10 bg-primary transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 px-6 py-5">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/20">
                <Shield className="h-5 w-5 text-gold" />
              </div>
              <div>
                <span className="text-lg text-white">
                  <BrandLogo />
                </span>
                <p className="text-[10px] font-medium uppercase tracking-widest text-gold">
                  Admin
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
            {navItems.map(({ href, icon: Icon, key, exact }) => {
              const active = exact
                ? pathname === href
                : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-gold/15 text-gold"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {t(key)}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-1 border-t border-white/10 p-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
              {t("userDashboard")}
            </Link>
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

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
