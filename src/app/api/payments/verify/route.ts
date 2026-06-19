import { NextResponse } from "next/server";
import { requireUser, jsonError } from "@/lib/api-auth";
import { verifyPaymentSchema } from "@/lib/validators/payment";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { fulfillPayment } from "@/lib/investment-service";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const parsed = verifyPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid request");
  }

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId },
  });
  if (!payment || payment.userId !== auth.userId) {
    return jsonError("Payment not found", 404);
  }

  if (!verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
    return jsonError("Invalid payment signature", 400);
  }

  try {
    const result = await fulfillPayment(razorpayOrderId, razorpayPaymentId);
    return NextResponse.json({
      status: "paid",
      alreadyFulfilled: result.alreadyFulfilled,
      investmentId: "investment" in result ? result.investment?.id : undefined,
    });
  } catch (err) {
    console.error("Payment verify error:", err);
    return jsonError("Failed to confirm payment", 500);
  }
}
