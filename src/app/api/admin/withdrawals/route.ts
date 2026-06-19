import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, jsonError } from "@/lib/api-auth";
import {
  isReferralSlaOverdue,
  referralWithdrawalOverdueHours,
} from "@/lib/withdrawal-service";
import {
  formatDate,
  toWithdrawalStatus,
  toWithdrawalType,
} from "@/lib/serializers";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const items = await prisma.withdrawal.findMany({
    include: { user: { select: { name: true } } },
    orderBy: { requestedAt: "desc" },
  });

  return NextResponse.json(
    items.map((w) => ({
      id: w.id,
      userName: w.user.name,
      amount: w.amount,
      type: toWithdrawalType(w.type),
      status: toWithdrawalStatus(w.status),
      requestedAt: formatDate(w.requestedAt),
      hoursPending:
        w.status === "PENDING"
          ? referralWithdrawalOverdueHours(w.requestedAt)
          : undefined,
      slaOverdue: isReferralSlaOverdue(w.type, w.status, w.requestedAt),
    }))
  );
}
