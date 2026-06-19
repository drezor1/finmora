import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, jsonError } from "@/lib/api-auth";
import { penaltySchema } from "@/lib/validators/auth";
import { deductReferralBalance } from "@/lib/referral-service";
import { formatDate, toPenaltyReason, fromPenaltyReason } from "@/lib/serializers";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const items = await prisma.referralPenalty.findMany({
    include: { user: { select: { name: true } } },
    orderBy: { appliedAt: "desc" },
  });

  return NextResponse.json(
    items.map((p) => ({
      id: p.id,
      userId: p.userId,
      userName: p.user.name,
      reason: toPenaltyReason(p.reason),
      amount: p.amount,
      appliedAt: formatDate(p.appliedAt),
      status: p.status.toLowerCase(),
    }))
  );
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const parsed = penaltySchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid penalty data");

  const penalty = await prisma.referralPenalty.create({
    data: {
      userId: parsed.data.userId,
      reason: fromPenaltyReason(parsed.data.reason),
      amount: parsed.data.amount,
    },
    include: { user: { select: { name: true } } },
  });

  await deductReferralBalance(parsed.data.userId, parsed.data.amount, false);

  await prisma.userNotification.create({
    data: {
      userId: parsed.data.userId,
      title: "Referral Penalty Applied",
      message: `A penalty of ₹${parsed.data.amount.toLocaleString("en-IN")} has been applied to your referral balance.`,
      type: "REFERRAL",
    },
  });

  return NextResponse.json({
    id: penalty.id,
    userId: penalty.userId,
    userName: penalty.user.name,
    reason: toPenaltyReason(penalty.reason),
    amount: penalty.amount,
    appliedAt: formatDate(penalty.appliedAt),
    status: penalty.status.toLowerCase(),
  });
}
