import { NextResponse } from "next/server";
import { requireUser, jsonError } from "@/lib/api-auth";
import { getUserMePayload } from "@/lib/user-me-service";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const payload = await getUserMePayload(auth.userId);
  if (!payload) return jsonError("User not found", 404);

  return NextResponse.json(payload);
}
