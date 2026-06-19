import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, jsonError } from "@/lib/api-auth";
import { approveReferralPayouts } from "@/lib/referral-service";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const users = await prisma.user.findMany({
    where: { role: "USER" },
    include: {
      referralEarnings: true,
      _count: { select: { referrals: true } },
    },
  });

  return NextResponse.json(
    users
      .filter((u) => u._count.referrals > 0 || u.referralEarnings.length > 0)
      .map((u) => {
        const totalEarnings = u.referralEarnings.reduce(
          (s, e) => s + e.commission,
          0
        );
        const pendingPayout = u.referralEarnings
          .filter((e) => e.status === "PENDING")
          .reduce((s, e) => s + e.commission, 0);
        return {
          id: u.id,
          userName: u.name,
          referralCode: u.referralCode,
          totalReferrals: u._count.referrals,
          totalEarnings,
          pendingPayout,
          availableBalance: u.referralBalance,
        };
      })
  );
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const { userId, action } = body as { userId: string; action: "approve_payout" };

  if (action !== "approve_payout" || !userId) {
    return jsonError("Invalid action");
  }

  try {
    const result = await approveReferralPayouts(userId);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("Approve payout error:", err);
    return jsonError("Failed to approve payout", 500);
  }
}
