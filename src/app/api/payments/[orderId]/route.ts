import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, jsonError } from "@/lib/api-auth";

type Params = { params: Promise<{ orderId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const { orderId } = await params;

  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId: orderId },
    select: {
      userId: true,
      status: true,
      amount: true,
      planName: true,
      investmentId: true,
      paidAt: true,
    },
  });

  if (!payment || payment.userId !== auth.userId) {
    return jsonError("Payment not found", 404);
  }

  return NextResponse.json({
    status: payment.status.toLowerCase(),
    amount: payment.amount,
    planName: payment.planName,
    investmentId: payment.investmentId,
    paidAt: payment.paidAt?.toISOString() ?? null,
  });
}
