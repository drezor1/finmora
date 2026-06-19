import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validators/auth";
import { generateReferralCode } from "@/lib/referral-code";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { name, email, mobile, password, referralCode } = parsed.data;

    const referrer = await prisma.user.findUnique({
      where: { referralCode: referralCode.toUpperCase() },
    });
    if (!referrer) {
      return NextResponse.json({ error: "Invalid referral code" }, { status: 400 });
    }
    if (referrer.accountStatus === "SUSPENDED") {
      return NextResponse.json({ error: "Referral code is not active" }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { mobile }] },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Email or mobile already registered" },
        { status: 409 }
      );
    }

    let code = generateReferralCode();
    while (await prisma.user.findUnique({ where: { referralCode: code } })) {
      code = generateReferralCode();
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        mobile,
        passwordHash,
        referralCode: code,
        referredById: referrer.id,
      },
    });

    await prisma.userNotification.create({
      data: {
        userId: referrer.id,
        title: "New Referral Joined",
        message: `${name} joined Finmora using your referral code.`,
        type: "REFERRAL",
      },
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      referralCode: user.referralCode,
    });
  } catch {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
