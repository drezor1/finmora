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
    <section
      className="relative min-h-screen overflow-hidden pt-16"
      style={{
        background: "linear-gradient(160deg, #07090f 0%, #080f1c 40%, #07090f 100%)",
      }}
    >
      {/* Background ambient layers */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-[600px] w-[600px] -translate-y-1/4 translate-x-1/4"
        style={{ background: "radial-gradient(circle, rgba(0,217,126,0.05) 0%, transparent 65%)" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-[500px] w-[500px] translate-y-1/4 -translate-x-1/4"
        style={{ background: "radial-gradient(circle, rgba(212,168,67,0.04) 0%, transparent 65%)" }}
      />

      {/* Dot grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.9) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Thin horizontal accent line */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-px w-[600px] -translate-x-1/2 -translate-y-1/2 opacity-20"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(0,217,126,0.6) 50%, transparent 100%)" }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6 sm:py-36 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex">
            <Badge variant="gold">
              {t("badge")}
            </Badge>
          </div>

          {/* Headline */}
          <h1
            className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            style={{ lineHeight: 1.1 }}
          >
            {t("title")}{" "}
            <span className="gradient-text">{t("titleHighlight")}</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t("subtitle")}
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
                className="min-w-[180px]"
              >
                {t("ctaSecondary")}
              </Button>
            </Link>
          </div>

          {/* Trust note */}
          <p className="mt-6 text-xs text-muted" style={{ color: "rgba(139, 154, 184, 0.5)" }}>
            No lock-in period &bull; Withdraw anytime &bull; SEBI compliant
          </p>
        </div>

        {/* Stats grid */}
        <div className="mt-24 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:gap-5">
          {stats.map(({ key, value, icon: Icon }) => (
            <div
              key={key}
              className="group relative overflow-hidden rounded-2xl p-5 text-center transition-all duration-200 hover:-translate-y-1"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: "radial-gradient(circle at center, rgba(0,217,126,0.05) 0%, transparent 70%)" }}
              />
              <div
                className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: "rgba(0,217,126,0.08)" }}
              >
                <Icon className="h-5 w-5 text-accent" />
              </div>
              <div className="text-2xl font-bold text-foreground sm:text-3xl">
                {value}
              </div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {t(`stats.${key}`)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
