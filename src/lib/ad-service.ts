import { prisma } from "@/lib/db";
import { createAdViewUrl } from "@/lib/supabase-storage";
import { AdStatus, AdType } from "@prisma/client";

export async function getActiveCompanyAds() {
  return prisma.ad.findMany({
    where: { type: AdType.COMPANY, status: AdStatus.ACTIVE },
    orderBy: { startDate: "desc" },
  });
}

async function resolveImageUrl(imageKey: string | null): Promise<string | null> {
  if (!imageKey) return null;
  if (imageKey.startsWith("http://") || imageKey.startsWith("https://")) {
    return imageKey;
  }
  try {
    return await createAdViewUrl(imageKey);
  } catch {
    return null;
  }
}

export async function getActiveCompanyAdsForUser() {
  const ads = await getActiveCompanyAds();
  return Promise.all(
    ads.map(async (ad) => ({
      id: ad.id,
      title: ad.title,
      advertiser: ad.advertiser,
      targetUrl: ad.targetUrl,
      imageUrl: await resolveImageUrl(ad.imageKey),
    }))
  );
}

export async function recordAdImpression(adId: string) {
  const ad = await prisma.ad.findFirst({
    where: { id: adId, type: AdType.COMPANY, status: AdStatus.ACTIVE },
  });
  if (!ad) throw new Error("Ad not found");

  await prisma.ad.update({
    where: { id: adId },
    data: { impressions: { increment: 1 } },
  });
}

export async function recordAdClick(adId: string) {
  const ad = await prisma.ad.findFirst({
    where: { id: adId, type: AdType.COMPANY, status: AdStatus.ACTIVE },
  });
  if (!ad) throw new Error("Ad not found");

  await prisma.ad.update({
    where: { id: adId },
    data: { clicks: { increment: 1 } },
  });

  return ad.targetUrl;
}
