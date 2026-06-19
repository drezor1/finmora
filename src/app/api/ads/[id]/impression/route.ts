import { NextResponse } from "next/server";
import { requireUser, jsonError } from "@/lib/api-auth";
import { recordAdImpression } from "@/lib/ad-service";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  try {
    await recordAdImpression(id);
    return NextResponse.json({ ok: true });
  } catch {
    return jsonError("Ad not found", 404);
  }
}
