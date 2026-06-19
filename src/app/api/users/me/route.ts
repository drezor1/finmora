import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, jsonError } from "@/lib/api-auth";
import { getUserMePayload } from "@/lib/user-me-service";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const payload = await getUserMePayload(auth.userId);
  if (!payload) return jsonError("User not found", 404);

  return NextResponse.json(payload);
}

export async function PATCH(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const { name, mobile, locale } = body as {
    name?: string;
    mobile?: string;
    locale?: string;
  };

  const user = await prisma.user.update({
    where: { id: auth.userId },
    data: {
      ...(name && { name }),
      ...(mobile && { mobile }),
      ...(locale && { locale }),
    },
  });

  return NextResponse.json({
    id: user.id,
    name: user.name,
    mobile: user.mobile,
    locale: user.locale,
  });
}
