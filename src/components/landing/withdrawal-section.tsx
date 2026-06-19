import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, CheckCircle, XCircle, Loader } from "lucide-react";

export function WithdrawalSection() {
  const t = useTranslations("withdrawal");

  const statuses = [
    { key: "pending" as const, icon: Loader, color: "text-gold" },
    { key: "approved" as const, icon: CheckCircle, color: "text-accent" },
    { key: "rejected" as const, icon: XCircle, color: "text-destructive" },
  ];

  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            {t("title")}
          </h2>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <Card className="transition-all hover:-translate-y-1 hover:card-shadow-lg">
            <CardContent className="pt-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <Calendar className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-primary">
                {t("monthly")}
              </h3>
              <p className="mt-2 text-muted">{t("monthlyRule")}</p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:-translate-y-1 hover:card-shadow-lg">
            <CardContent className="pt-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/15">
                <Clock className="h-6 w-6 text-gold" />
              </div>
              <h3 className="text-xl font-semibold text-primary">
                {t("referral")}
              </h3>
              <p className="mt-2 text-muted">{t("referralRule")}</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          {statuses.map(({ key, icon: Icon, color }) => (
            <div
              key={key}
              className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm"
            >
              <Icon className={`h-4 w-4 ${color}`} />
              <span className="text-muted">{t(`statuses.${key}`)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
