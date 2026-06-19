import { SignJWT, jwtVerify } from "jose";
import type { UserRole } from "@prisma/client";

const MOBILE_TOKEN_EXPIRY = "7d";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not configured");
  return new TextEncoder().encode(secret);
}

export type MobileTokenPayload = {
  sub: string;
  role: UserRole;
};

export async function signMobileToken(userId: string, role: UserRole): Promise<string> {
  return new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(MOBILE_TOKEN_EXPIRY)
    .sign(getSecret());
}

export async function verifyMobileToken(
  token: string
): Promise<MobileTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const sub = payload.sub;
    const role = payload.role as UserRole;
    if (!sub || !role) return null;
    return { sub, role };
  } catch {
    return null;
  }
}
