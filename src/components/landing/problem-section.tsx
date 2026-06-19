import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Puzzle, Eye, BarChart3, Building2 } from "lucide-react";

const items = [
  { key: "complex" as const, icon: Puzzle, color: "text-accent" },
  { key: "transparent" as const, icon: Eye, color: "text-gold" },
  { key: "tracking" as const, icon: BarChart3, color: "text-accent" },
  { key: "management" as const, icon: Building2, color: "text-gold" },
];

export function ProblemSection() {
  const t = useTranslations("problem");

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-muted">{t("subtitle")}</p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ key, icon: Icon, color }) => (
            <Card
              key={key}
              className="group transition-all duration-300 hover:-translate-y-1 hover:card-shadow-lg"
            >
              <CardContent className="pt-6">
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-background ${color}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-primary">
                  {t(`items.${key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {t(`items.${key}.desc`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
