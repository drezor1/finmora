import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import {
  LayoutDashboard,
  Share2,
  PiggyBank,
  ShieldCheck,
  Banknote,
  Bell,
  Bot,
  Megaphone,
  Settings,
  FileText,
  Monitor,
  Trophy,
  Smartphone,
  Languages,
} from "lucide-react";

const featureIcons = {
  dashboard: LayoutDashboard,
  referralDash: Share2,
  sipDash: PiggyBank,
  kyc: ShieldCheck,
  withdrawal: Banknote,
  alerts: Bell,
  ai: Bot,
  advertise: Megaphone,
  adminPanel: Settings,
  invoice: FileText,
  ads: Monitor,
  leaderboard: Trophy,
  push: Smartphone,
  multilang: Languages,
};

const featureKeys = Object.keys(featureIcons) as (keyof typeof featureIcons)[];

export function FeaturesSection() {
  const t = useTranslations("features");

  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-muted">{t("subtitle")}</p>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featureKeys.map((key) => {
            const Icon = featureIcons[key];
            return (
              <Card
                key={key}
                className="group transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:card-shadow-lg"
              >
                <CardContent className="flex items-center gap-3 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 transition-colors group-hover:bg-accent/20">
                    <Icon className="h-4 w-4 text-accent" />
                  </div>
                  <span className="text-sm font-medium text-primary">
                    {t(`list.${key}`)}
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
