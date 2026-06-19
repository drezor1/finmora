import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/Footer";
import { StaticPage } from "@/components/layout/static-page";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.terms" });
  return createPageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/terms",
    locale,
  });
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Navbar />
      <main>
        <StaticPage namespace="terms" />
      </main>
      <Footer />
    </>
  );
}
