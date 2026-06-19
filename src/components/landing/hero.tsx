import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, IndianRupee, Share2, TrendingUp } from "lucide-react";

const stats = [
  { key: "users" as const, value: "12,500+", icon: Users },
  { key: "invested" as const, value: "₹48 Cr+", icon: IndianRupee },
  { key: "referrals" as const, value: "₹2.1 Cr+", icon: Share2 },
  { key: "roi" as const, value: "10.2%", icon: TrendingUp },
];

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="gradient-hero relative overflow-hidden pt-16">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="gold" className="mb-6 glass text-white border-white/20">
            {t("badge")}
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {t("title")}{" "}
            <span className="gradient-text">{t("titleHighlight")}</span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-white/70 sm:text-xl">
            {t("subtitle")}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button variant="accent" size="lg" className="min-w-[180px]">
                {t("ctaPrimary")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/advertise">
              <Button
                variant="outline"
                size="lg"
                className="min-w-[180px] border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30"
              >
                {t("ctaSecondary")}
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
          {stats.map(({ key, value, icon: Icon }) => (
            <div
              key={key}
              className="glass rounded-2xl p-5 text-center transition-transform hover:scale-[1.02]"
            >
              <Icon className="mx-auto mb-2 h-5 w-5 text-accent" />
              <div className="text-2xl font-bold text-white sm:text-3xl">
                {value}
              </div>
              <div className="mt-1 text-xs text-white/60 sm:text-sm">
                {t(`stats.${key}`)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
