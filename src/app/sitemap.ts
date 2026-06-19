import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/metadata";
import { routing } from "@/i18n/routing";

const publicPaths = [
  "",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/login",
  "/signup",
  "/advertise",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routing.locales.flatMap((locale) =>
    publicPaths.map((path) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified,
      changeFrequency: path === "" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "" ? 1 : 0.7,
    }))
  );
}
