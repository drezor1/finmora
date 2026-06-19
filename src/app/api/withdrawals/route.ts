import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, jsonError } from "@/lib/api-auth";
import { withdrawalSchema } from "@/lib/validators/auth";
import {
  getWithdrawalLimits,
  validateMonthlyWithdrawal,
  validateReferralWithdrawal,
} from "@/lib/withdrawal-service";
import {
  formatDate,
  toWithdrawalStatus,
  toWithdrawalType,
  fromWithdrawalType,
} from "@/lib/serializers";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const [items, limits] = await Promise.all([
    prisma.withdrawal.findMany({
      where: { userId: auth.userId },
      orderBy: { requestedAt: "desc" },
    }),
    getWithdrawalLimits(auth.userId),
  ]);

  return NextResponse.json({
    items: items.map((w) => ({
      id: w.id,
      amount: w.amount,
      type: toWithdrawalType(w.type),
      status: toWithdrawalStatus(w.status),
      requestedAt: formatDate(w.requestedAt),
      processedAt: w.processedAt ? formatDate(w.processedAt) : undefined,
    })),
    limits,
  });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const user = await prisma.user.findUnique({ where: { id: auth.userId } });
  if (!user || user.kycStatus !== "VERIFIED") {
    return jsonError("KYC must be verified before withdrawal", 403);
  }

  const body = await request.json();
  const parsed = withdrawalSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid withdrawal request");

  try {
    if (parsed.data.type === "monthly_income") {
      await validateMonthlyWithdrawal(auth.userId, parsed.data.amount);
    } else {
      await validateReferralWithdrawal(auth.userId, parsed.data.amount);
    }
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Withdrawal validation failed", 400);
  }

  const withdrawal = await prisma.withdrawal.create({
    data: {
      userId: auth.userId,
      amount: parsed.data.amount,
      type: fromWithdrawalType(parsed.data.type),
    },
  });

  await prisma.userNotification.create({
    data: {
      userId: auth.userId,
      title: "Withdrawal Requested",
      message: `Your ₹${parsed.data.amount.toLocaleString("en-IN")} withdrawal is under review.`,
      type: "WITHDRAWAL",
    },
  });

  return NextResponse.json({
    id: withdrawal.id,
    amount: withdrawal.amount,
    type: toWithdrawalType(withdrawal.type),
    status: toWithdrawalStatus(withdrawal.status),
    requestedAt: formatDate(withdrawal.requestedAt),
  });
}
