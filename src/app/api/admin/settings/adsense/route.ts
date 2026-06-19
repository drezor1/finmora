import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";

const DEFAULT = {
  enabled: true,
  publisherId: "",
  adSlotHtml: "",
  lastUpdated: new Date().toISOString().slice(0, 10),
};

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const setting = await prisma.platformSetting.findUnique({
    where: { key: "adsense" },
  });

  return NextResponse.json(setting?.value ?? DEFAULT);
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const value = {
    ...DEFAULT,
    ...body,
    lastUpdated: new Date().toISOString().slice(0, 10),
  };

  await prisma.platformSetting.upsert({
    where: { key: "adsense" },
    create: { key: "adsense", value },
    update: { value },
  });

  return NextResponse.json(value);
}
