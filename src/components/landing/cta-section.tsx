import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot } from "lucide-react";

export function CtaSection() {
  const t = useTranslations("cta");

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent to-accent-dark px-8 py-16 text-center sm:px-16">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />

          <div className="relative">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
              {t("subtitle")}
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup">
                <Button
                  variant="primary"
                  size="lg"
                  className="min-w-[200px] bg-primary hover:bg-primary-light"
                >
                  {t("primary")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="min-w-[200px] border-white/30 bg-white/10 text-white hover:bg-white/20"
              >
                <Bot className="h-4 w-4" />
                {t("secondary")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
