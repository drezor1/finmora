import { useTranslations } from "next-intl";
import {
  UserPlus,
  Wallet,
  TrendingUp,
  PiggyBank,
  Share2,
  Banknote,
} from "lucide-react";

const steps = [
  { key: "signup" as const, icon: UserPlus },
  { key: "invest" as const, icon: Wallet },
  { key: "income" as const, icon: TrendingUp },
  { key: "sip" as const, icon: PiggyBank },
  { key: "referral" as const, icon: Share2 },
  { key: "withdraw" as const, icon: Banknote },
];

export function HowItWorks() {
  const t = useTranslations("howItWorks");

  return (
    <section id="how-it-works" className="bg-primary py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-white/60">{t("subtitle")}</p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map(({ key, icon: Icon }, index) => (
            <div
              key={key}
              className="relative rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:bg-white/10"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-sm font-bold text-white">
                  {index + 1}
                </div>
                <Icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                {t(`steps.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                {t(`steps.${key}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
