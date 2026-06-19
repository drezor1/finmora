import { useTranslations } from "next-intl";

type Section = {
  title: string;
  content: string;
};

type StaticPageProps = {
  namespace: "about" | "privacy" | "terms";
};

export function StaticPage({ namespace }: StaticPageProps) {
  const t = useTranslations(`pages.${namespace}`);
  const sections = t.raw("sections") as Section[];

  return (
    <div className="bg-background px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          {t("title")}
        </h1>
        {t.has("subtitle") && (
          <p className="mt-4 text-lg text-muted">{t("subtitle")}</p>
        )}
        {t.has("updated") && (
          <p className="mt-2 text-sm text-muted-foreground">{t("updated")}</p>
        )}

        <div className="mt-12 space-y-10">
          {sections.map((section, index) => (
            <section key={index}>
              <h2 className="text-xl font-semibold text-primary">
                {section.title}
              </h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-muted">
                {section.content}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
