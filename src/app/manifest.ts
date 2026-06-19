import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/metadata";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "Finmora",
    description:
      "Investment, referral and SIP platform for monthly income and long-term wealth.",
    start_url: "/en",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#10b981",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
