import { useTranslations } from "next-intl";
import { SIP_OPTIONS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, Percent, TrendingUp } from "lucide-react";

export function SipSection() {
  const t = useTranslations("sip");

  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Badge variant="accent" className="mb-4">
              SIP
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-4 text-lg text-muted">{t("subtitle")}</p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                  <Percent className="h-5 w-5 text-accent" />
                </div>
                <p className="text-sm text-muted">{t("allocation")}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15">
                  <Lock className="h-5 w-5 text-gold" />
                </div>
                <p className="text-sm text-muted">{t("lockPeriod")}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
                <p className="text-sm text-muted">
                  Long-term wealth compounding
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {SIP_OPTIONS.map((option) => (
              <Card
                key={option.years}
                className="text-center transition-all hover:-translate-y-1 hover:card-shadow-lg"
              >
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-accent">
                    {option.years}
                  </div>
                  <p className="mt-1 text-sm font-medium text-primary">
                    {option.years === 1
                      ? t("years", { years: option.years })
                      : t("yearsPlural", { years: option.years })}
                  </p>
                  <p className="mt-3 text-xs text-muted">
                    {option.minPercent}–{option.maxPercent}% allocation
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
