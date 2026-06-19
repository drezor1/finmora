import type { Metadata } from "next";

export const SITE_NAME = "Finmora";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://finmora.in";

type PageMetadataOptions = {
  title: string;
  description: string;
  path?: string;
  locale?: string;
};

export function createPageMetadata({
  title,
  description,
  path = "",
  locale = "en",
}: PageMetadataOptions): Metadata {
  const normalizedPath = path.startsWith("/") ? path : path ? `/${path}` : "";
  const url = `${SITE_URL}/${locale}${normalizedPath}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `${SITE_URL}/en${normalizedPath}`,
        hi: `${SITE_URL}/hi${normalizedPath}`,
        or: `${SITE_URL}/or${normalizedPath}`,
        bn: `${SITE_URL}/bn${normalizedPath}`,
      },
    },
    openGraph: { title, description, url, siteName: SITE_NAME, locale, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}
