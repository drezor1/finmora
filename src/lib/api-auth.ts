import { auth } from "@/lib/auth";
import { verifyMobileToken } from "@/lib/mobile-jwt";
import { NextResponse } from "next/server";
import type { UserRole } from "@prisma/client";

export async function requireUser() {
  const session = await auth();
  if (session?.user?.id) {
    return {
      session,
      userId: session.user.id,
      role: session.user.role as UserRole,
    };
  }

  return requireBearerUser();
}

async function requireBearerUser() {
  const { headers } = await import("next/headers");
  const headerStore = await headers();
  const authorization = headerStore.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const token = authorization.slice(7);
  const payload = await verifyMobileToken(token);

  if (!payload) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return {
    userId: payload.sub,
    role: payload.role,
  };
}

export async function requireAdmin() {
  const result = await requireUser();
  if ("error" in result) return result;
  if (result.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return result;
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
