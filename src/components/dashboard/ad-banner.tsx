"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { apiGet, apiPost } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Megaphone } from "lucide-react";

type ActiveAd = {
  id: string;
  title: string;
  advertiser: string;
  targetUrl: string | null;
  imageUrl: string | null;
};

export function AdBanner() {
  const t = useTranslations("dashboard.ads");
  const [ads, setAds] = useState<ActiveAd[]>([]);
  const [index, setIndex] = useState(0);
  const trackedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    apiGet<ActiveAd[]>("/api/ads/active")
      .then(setAds)
      .catch(() => setAds([]));
  }, []);

  const trackImpression = useCallback(async (adId: string) => {
    if (trackedRef.current.has(adId)) return;
    trackedRef.current.add(adId);
    try {
      await apiPost(`/api/ads/${adId}/impression`, {});
    } catch {
      trackedRef.current.delete(adId);
    }
  }, []);

  useEffect(() => {
    if (ads.length === 0) return;
    trackImpression(ads[index].id);
  }, [ads, index, trackImpression]);

  useEffect(() => {
    if (ads.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % ads.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [ads.length]);

  async function handleClick(ad: ActiveAd) {
    try {
      const res = await apiPost<{ targetUrl?: string }>(`/api/ads/${ad.id}/click`, {});
      const url = res.targetUrl ?? ad.targetUrl;
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      if (ad.targetUrl) window.open(ad.targetUrl, "_blank", "noopener,noreferrer");
    }
  }

  if (ads.length === 0) return null;

  const ad = ads[index];

  return (
    <Card className="overflow-hidden border-accent/20 bg-gradient-to-r from-accent/5 to-gold/5">
      <CardContent className="p-0">
        <button
          type="button"
          onClick={() => handleClick(ad)}
          className="flex w-full items-stretch text-left transition-opacity hover:opacity-95"
        >
          {ad.imageUrl ? (
            <div className="relative h-28 w-full sm:h-32">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ad.imageUrl}
                alt={ad.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4 text-white">
                <Badge variant="gold" className="mb-1 text-[10px]">
                  {t("sponsored")}
                </Badge>
                <p className="font-semibold">{ad.title}</p>
                <p className="text-xs opacity-80">{ad.advertiser}</p>
              </div>
            </div>
          ) : (
            <div className="flex w-full items-center gap-4 p-4 sm:p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15">
                <Megaphone className="h-6 w-6 text-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <Badge variant="outline" className="mb-1 text-[10px]">
                  {t("sponsored")}
                </Badge>
                <p className="font-semibold text-primary">{ad.title}</p>
                <p className="text-sm text-muted">{ad.advertiser}</p>
              </div>
              {ad.targetUrl && (
                <ExternalLink className="h-5 w-5 shrink-0 text-muted" />
              )}
            </div>
          )}
        </button>
        {ads.length > 1 && (
          <div className="flex justify-center gap-1.5 border-t border-border py-2">
            {ads.map((a, i) => (
              <button
                key={a.id}
                type="button"
                aria-label={`Ad ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-4 bg-accent" : "w-1.5 bg-border"
                }`}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
