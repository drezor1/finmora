import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createPageMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.advertise" });
  return createPageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/advertise",
    locale,
  });
}

export default async function AdvertiseLayout({
  children,
  params,
}: Props & { children: React.ReactNode }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return children;
}
