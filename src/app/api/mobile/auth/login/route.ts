import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-auth";
import { signMobileToken } from "@/lib/mobile-jwt";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Email and password are required");
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { mobile: email }],
    },
  });

  if (!user || user.accountStatus === "SUSPENDED") {
    return jsonError("Invalid credentials", 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return jsonError("Invalid credentials", 401);
  }

  const accessToken = await signMobileToken(user.id, user.role);

  return NextResponse.json({
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}
