import { NextResponse } from "next/server";
import { requireAdmin, jsonError } from "@/lib/api-auth";
import { reversePenalty } from "@/lib/referral-service";
import { formatDate, toPenaltyReason } from "@/lib/serializers";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const body = await request.json();
  const { action } = body as { action?: string };

  if (action !== "reverse") {
    return jsonError("Invalid action");
  }

  try {
    await reversePenalty(id);
    const penalty = await prisma.referralPenalty.findUnique({
      where: { id },
      include: { user: { select: { name: true } } },
    });
    if (!penalty) return jsonError("Penalty not found", 404);

    return NextResponse.json({
      id: penalty.id,
      userId: penalty.userId,
      userName: penalty.user.name,
      reason: toPenaltyReason(penalty.reason),
      amount: penalty.amount,
      appliedAt: formatDate(penalty.appliedAt),
      status: penalty.status.toLowerCase(),
    });
  } catch (err) {
    console.error("Reverse penalty error:", err);
    return jsonError("Failed to reverse penalty", 500);
  }
}
