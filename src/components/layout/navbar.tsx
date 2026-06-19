"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { LANGUAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Menu, X, TrendingUp, Globe, ChevronDown } from "lucide-react";

const navLinks = [
  { href: "/#features", key: "features" as const },
  { href: "/#how-it-works", key: "howItWorks" as const },
  { href: "/#plans", key: "plans" as const },
  { href: "/advertise", key: "advertise" as const },
];

export function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isLanding = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-500",
        scrolled || !isLanding
          ? "border-b"
          : "border-b border-transparent"
      )}
      style={scrolled || !isLanding ? {
        background: "rgba(7, 9, 15, 0.88)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        borderBottomColor: "rgba(255,255,255,0.07)",
        boxShadow: "0 1px 40px rgba(0,0,0,0.4)",
      } : undefined}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 group-hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #00d97e 0%, #00b869 100%)",
              boxShadow: "0 0 16px rgba(0,217,126,0.3)",
            }}
          >
            <TrendingUp className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
          </div>
          <BrandLogo className="text-[17px] text-foreground" accentClassName="text-accent" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-white/[0.05] hover:text-foreground"
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 md:flex">
          {/* Language picker */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-white/[0.05] hover:text-foreground"
            >
              <Globe className="h-4 w-4" />
              {LANGUAGES.find((l) => l.code === locale)?.label}
              <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", langOpen && "rotate-180")} />
            </button>
            {langOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-40 overflow-hidden rounded-xl py-1"
                style={{
                  background: "#111827",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                }}
              >
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      router.replace(pathname, { locale: lang.code });
                      setLangOpen(false);
                    }}
                    className={cn(
                      "block w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/[0.05]",
                      locale === lang.code
                        ? "font-semibold text-accent"
                        : "text-muted-foreground"
                    )}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link href="/login">
            <Button variant="ghost" size="sm">
              {t("login")}
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="accent" size="sm">
              {t("signup")}
            </Button>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="px-4 py-4 md:hidden"
          style={{
            background: "#0d1117",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground"
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>
          <div
            className="mt-3 flex flex-col gap-2 pt-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
          >
            <Link href="/login" onClick={() => setOpen(false)}>
              <Button variant="outline" className="w-full">
                {t("login")}
              </Button>
            </Link>
            <Link href="/signup" onClick={() => setOpen(false)}>
              <Button variant="accent" className="w-full">
                {t("signup")}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
