import { NextResponse } from "next/server";
import { requireUser, jsonError } from "@/lib/api-auth";
import { recordAdClick } from "@/lib/ad-service";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  try {
    const targetUrl = await recordAdClick(id);
    return NextResponse.json({ ok: true, targetUrl });
  } catch {
    return jsonError("Ad not found", 404);
  }
}
