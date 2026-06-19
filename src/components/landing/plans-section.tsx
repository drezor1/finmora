import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { INVESTMENT_PLANS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function PlansSection() {
  const t = useTranslations("plans");

  return (
    <section id="plans" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-muted">{t("subtitle")}</p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {INVESTMENT_PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                "relative overflow-hidden transition-all duration-300 hover:-translate-y-1",
                "popular" in plan &&
                  plan.popular &&
                  "ring-2 ring-accent card-shadow-lg scale-[1.02]"
              )}
            >
              {"popular" in plan && plan.popular && (
                <div className="absolute right-4 top-4">
                  <Badge variant="accent">{t("popular")}</Badge>
                </div>
              )}

              <div className={cn("h-1.5 bg-gradient-to-r", plan.color)} />

              <CardContent className="pt-8">
                <h3 className="text-xl font-bold text-primary">{plan.name}</h3>

                <div className="mt-6">
                  <span className="text-4xl font-bold text-accent">
                    {plan.roi}%
                  </span>
                  <span className="ml-1 text-muted">/ month</span>
                </div>
                <p className="mt-1 text-sm text-muted">{t("monthlyRoi")}</p>

                <div className="mt-6 space-y-3 border-t border-border pt-6">
                  <div className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span className="text-muted">
                      {t("minMax")}: {formatCurrency(plan.min)} –{" "}
                      {formatCurrency(plan.max)}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span className="text-muted">
                      {t("example")}
                    </span>
                  </div>
                </div>

                <Link href="/signup" className="mt-8 block">
                  <Button
                    variant={
                      "popular" in plan && plan.popular ? "accent" : "outline"
                    }
                    className="w-full"
                  >
                    {t("getStarted")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
