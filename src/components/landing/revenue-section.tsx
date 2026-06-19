import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Share2, PiggyBank, Building, Globe } from "lucide-react";

const sources = [
  { key: "investment" as const, icon: Wallet },
  { key: "referral" as const, icon: Share2 },
  { key: "sip" as const, icon: PiggyBank },
  { key: "companyAds" as const, icon: Building },
  { key: "thirdParty" as const, icon: Globe },
];

export function RevenueSection() {
  const t = useTranslations("revenue");

  return (
    <section className="bg-primary py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-white/60">{t("subtitle")}</p>
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-4">
          {sources.map(({ key, icon: Icon }) => (
            <Card
              key={key}
              className="border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:bg-white/10"
            >
              <CardContent className="flex items-center gap-3 py-4 px-6">
                <Icon className="h-5 w-5 text-accent" />
                <span className="font-medium text-white">
                  {t(`sources.${key}`)}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
