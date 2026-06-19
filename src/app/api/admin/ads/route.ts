import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, jsonError } from "@/lib/api-auth";
import { adCreateSchema } from "@/lib/validators/auth";
import { formatDate, toAdType, toAdStatus } from "@/lib/serializers";
import { createAdViewUrl } from "@/lib/supabase-storage";

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

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const items = await prisma.ad.findMany({ orderBy: { startDate: "desc" } });
  return NextResponse.json(await Promise.all(items.map(serializeAd)));
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const parsed = adCreateSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid ad data");

  const ad = await prisma.ad.create({
    data: {
      title: parsed.data.title,
      advertiser: parsed.data.advertiser,
      type: "COMPANY",
      status: "PENDING",
      startDate: parsed.data.startDate
        ? new Date(parsed.data.startDate)
        : new Date(),
      targetUrl: parsed.data.targetUrl || null,
      imageKey: parsed.data.imageKey || null,
    },
  });

  return NextResponse.json(await serializeAd(ad));
}
