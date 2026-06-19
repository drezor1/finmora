import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { getKycSummary } from "@/lib/kyc-service";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const summary = await getKycSummary(auth.userId);
  return NextResponse.json(summary);
}
