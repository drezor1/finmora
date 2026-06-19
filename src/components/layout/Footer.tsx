import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { TrendingUp } from "lucide-react";
import { BrandLogo } from "@/components/layout/brand-logo";

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");

  return (
    <footer className="bg-primary text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <BrandLogo className="text-lg text-white" />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              {t("tagline")}
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
              {t("product")}
            </h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <Link href="/#features" className="transition-colors hover:text-accent">
                  {nav("features")}
                </Link>
              </li>
              <li>
                <Link href="/#plans" className="transition-colors hover:text-accent">
                  {nav("plans")}
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="transition-colors hover:text-accent">
                  {nav("howItWorks")}
                </Link>
              </li>
              <li>
                <Link href="/advertise" className="transition-colors hover:text-accent">
                  {nav("advertise")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
              {t("company")}
            </h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <Link href="/about" className="transition-colors hover:text-accent">
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-accent">
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
              {t("legal")}
            </h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <Link href="/privacy" className="transition-colors hover:text-accent">
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition-colors hover:text-accent">
                  {t("terms")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-white/40">
          © {new Date().getFullYear()} Finmora. {t("rights")}
        </div>
      </div>
    </footer>
  );
}
