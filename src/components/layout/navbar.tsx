"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { LANGUAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Menu, X, TrendingUp, Globe } from "lucide-react";

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

  const isLanding = pathname === "/";

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        isLanding
          ? "bg-transparent"
          : "border-b border-border bg-card/95 backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <BrandLogo
            className={cn("text-lg", isLanding ? "text-white" : "text-primary")}
            accentClassName={isLanding ? "text-accent" : "text-accent"}
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-accent",
                isLanding ? "text-white/80 hover:text-white" : "text-muted"
              )}
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-colors",
                isLanding
                  ? "text-white/80 hover:text-white hover:bg-white/10"
                  : "text-muted hover:text-foreground hover:bg-background"
              )}
            >
              <Globe className="h-4 w-4" />
              {LANGUAGES.find((l) => l.code === locale)?.label}
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 rounded-xl border border-border bg-card py-1 card-shadow">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      router.replace(pathname, { locale: lang.code });
                      setLangOpen(false);
                    }}
                    className={cn(
                      "block w-full px-4 py-2 text-left text-sm transition-colors hover:bg-background",
                      locale === lang.code
                        ? "font-medium text-accent"
                        : "text-foreground"
                    )}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className={isLanding ? "text-white hover:bg-white/10" : ""}
            >
              {t("login")}
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="accent" size="sm">
              {t("signup")}
            </Button>
          </Link>
        </div>

        <button
          className={cn("md:hidden", isLanding ? "text-white" : "text-primary")}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-card px-4 py-4 md:hidden card-shadow-lg">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-foreground"
              >
                {t(link.key)}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
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
          </nav>
        </div>
      )}
    </header>
  );
}
