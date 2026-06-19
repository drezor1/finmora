import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { formatDate, toAdType, toAdStatus } from "@/lib/serializers";
import { createAdViewUrl } from "@/lib/supabase-storage";
import type { AdStatus } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

async function serializeAd(a: {
  id: string;
  title: string;
  type: Parameters<typeof toAdType>[0];
  advertiser: string;
  status: Parameters<typeof toAdStatus>[0];
  impressions: number;
  clicks: number;
  startDate: Date;
  targetUrl: string | null;
  imageKey: string | null;
}) {
  let imageUrl: string | null = null;
  if (a.imageKey) {
    if (a.imageKey.startsWith("http")) {
      imageUrl = a.imageKey;
    } else {
      try {
        imageUrl = await createAdViewUrl(a.imageKey);
      } catch {
        imageUrl = a.imageKey;
      }
    }
  }

  return {
    id: a.id,
    title: a.title,
    type: toAdType(a.type),
    advertiser: a.advertiser,
    status: toAdStatus(a.status),
    impressions: a.impressions,
    clicks: a.clicks,
    startDate: formatDate(a.startDate),
    targetUrl: a.targetUrl,
    imageKey: a.imageKey,
    imageUrl,
  };
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const body = await request.json();

  const { title, advertiser, startDate, targetUrl, status, imageKey } = body as {
    title?: string;
    advertiser?: string;
    startDate?: string;
    targetUrl?: string;
    status?: "active" | "paused" | "pending";
    imageKey?: string | null;
  };

  const ad = await prisma.ad.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(advertiser && { advertiser }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(targetUrl !== undefined && { targetUrl: targetUrl || null }),
      ...(status && { status: status.toUpperCase() as AdStatus }),
      ...(imageKey !== undefined && { imageKey: imageKey || null }),
    },
  });

  return NextResponse.json(await serializeAd(ad));
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  await prisma.ad.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
