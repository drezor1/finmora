import { useTranslations } from "next-intl";
import { REFERRAL_COMMISSION } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Share2, QrCode, Activity, Trophy } from "lucide-react";

const features = [
  { key: "uniqueCode" as const, icon: QrCode },
  { key: "instantTracking" as const, icon: Activity },
  { key: "leaderboard" as const, icon: Trophy },
];

export function ReferralSection() {
  const t = useTranslations("referral");

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-light">
          <div className="grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-2 lg:gap-12">
            <div>
              <Badge variant="gold" className="mb-4">
                {t("commission")}
              </Badge>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                {t("title")}
              </h2>
              <p className="mt-4 text-lg text-white/70">{t("subtitle")}</p>
              <p className="mt-4 text-sm leading-relaxed text-white/60">
                {t("desc")}
              </p>

              <div className="mt-8 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
                  <Share2 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent">
                    {REFERRAL_COMMISSION}%
                  </div>
                  <div className="text-sm text-white/60">{t("commission")}</div>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {features.map(({ key, icon: Icon }) => (
                <Card
                  key={key}
                  className="border-white/10 bg-white/5 backdrop-blur-sm"
                >
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/20">
                      <Icon className="h-5 w-5 text-accent" />
                    </div>
                    <span className="font-medium text-white">
                      {t(key)}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
