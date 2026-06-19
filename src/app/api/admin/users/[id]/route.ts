import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, jsonError } from "@/lib/api-auth";
import { approveKyc, rejectKyc } from "@/lib/kyc-service";
import {
  formatDate,
  toKycStatus,
  toAccountStatus,
} from "@/lib/serializers";
import type { KycStatus, AccountStatus } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      investments: true,
      referredBy: { select: { referralCode: true, name: true } },
      _count: { select: { referrals: true } },
    },
  });
  if (!user) return jsonError("User not found", 404);

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    referralCode: user.referralCode,
    referredBy: user.referredBy?.referralCode,
    kycStatus: toKycStatus(user.kycStatus),
    totalInvestment: user.investments.reduce((s, i) => s + i.amount, 0),
    plan: user.investments[0]?.planName ?? "—",
    createdAt: formatDate(user.createdAt),
    status: toAccountStatus(user.accountStatus),
    referralCount: user._count.referrals,
  });
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const body = await request.json();

  const { action, reason, kycStatus, accountStatus } = body as {
    action?: "approve_kyc" | "reject_kyc";
    reason?: string;
    kycStatus?: "pending" | "verified" | "rejected";
    accountStatus?: "active" | "suspended";
  };

  if (action === "approve_kyc") {
    try {
      await approveKyc(id);
    } catch (e) {
      return jsonError(e instanceof Error ? e.message : "Failed to approve KYC", 400);
    }
  } else if (action === "reject_kyc") {
    try {
      await rejectKyc(id, reason);
    } catch (e) {
      return jsonError(e instanceof Error ? e.message : "Failed to reject KYC", 400);
    }
  } else if (kycStatus === "verified") {
    try {
      await approveKyc(id);
    } catch (e) {
      return jsonError(e instanceof Error ? e.message : "Failed to approve KYC", 400);
    }
  } else if (kycStatus === "rejected") {
    await rejectKyc(id, reason);
  }

  const data: {
    kycStatus?: KycStatus;
    accountStatus?: AccountStatus;
  } = {};

  if (kycStatus && !action && kycStatus !== "verified" && kycStatus !== "rejected") {
    data.kycStatus = kycStatus.toUpperCase() as KycStatus;
  }
  if (accountStatus) {
    data.accountStatus = (accountStatus === "active"
      ? "ACTIVE"
      : "SUSPENDED") as AccountStatus;
  }

  const user =
    Object.keys(data).length > 0
      ? await prisma.user.update({ where: { id }, data })
      : await prisma.user.findUnique({ where: { id } });

  if (!user) return jsonError("User not found", 404);

  return NextResponse.json({
    id: user.id,
    kycStatus: toKycStatus(user.kycStatus),
    status: toAccountStatus(user.accountStatus),
  });
}
