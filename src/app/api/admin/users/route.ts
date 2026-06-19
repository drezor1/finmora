import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, jsonError } from "@/lib/api-auth";
import {
  formatDate,
  toKycStatus,
  toAccountStatus,
} from "@/lib/serializers";
import type { KycStatus } from "@prisma/client";

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const kyc = searchParams.get("kyc");

  const users = await prisma.user.findMany({
    where: {
      role: "USER",
      ...(kyc && kyc !== "all"
        ? { kycStatus: kyc.toUpperCase() as KycStatus }
        : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { mobile: { contains: search } },
            ],
          }
        : {}),
    },
    include: {
      investments: { where: { status: "ACTIVE" }, take: 1 },
      _count: { select: { referrals: true } },
      referredBy: { select: { referralCode: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      mobile: u.mobile,
      referralCode: u.referralCode,
      referredBy: u.referredBy?.referralCode,
      kycStatus: toKycStatus(u.kycStatus),
      totalInvestment: u.investments.reduce((s, i) => s + i.amount, 0),
      plan: u.investments[0]?.planName ?? "—",
      createdAt: formatDate(u.createdAt),
      status: toAccountStatus(u.accountStatus),
      referralCount: u._count.referrals,
    }))
  );
}
