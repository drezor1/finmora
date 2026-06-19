import { NextResponse } from "next/server";
import { requireUser, jsonError } from "@/lib/api-auth";
import { getActiveCompanyAdsForUser } from "@/lib/ad-service";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const ads = await getActiveCompanyAdsForUser();
  return NextResponse.json(ads);
}
