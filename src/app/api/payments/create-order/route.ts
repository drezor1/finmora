import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, jsonError } from "@/lib/api-auth";
import { createOrderSchema } from "@/lib/validators/payment";
import { validatePlanAmount } from "@/lib/investment-plans";
import { getRazorpayClient, getRazorpayKeyId } from "@/lib/razorpay";

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { accountStatus: true, email: true, name: true, mobile: true },
  });
  if (!user || user.accountStatus !== "ACTIVE") {
    return jsonError("Account is not active", 403);
  }

  const body = await request.json();
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid request");
  }

  const { planSlug, amount } = parsed.data;
  const validation = validatePlanAmount(planSlug, amount);
  if (!validation.ok) return jsonError(validation.error);

  const { plan } = validation;
  const receipt = `inv_${auth.userId.slice(-8)}_${Date.now()}`;

  try {
    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt,
      notes: {
        userId: auth.userId,
        planSlug,
        planName: plan.name,
      },
    });

    await prisma.payment.create({
      data: {
        userId: auth.userId,
        razorpayOrderId: order.id,
        amount,
        planSlug,
        planName: plan.name,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: getRazorpayKeyId(),
      planName: plan.name,
      prefill: {
        name: user.name,
        email: user.email,
        contact: user.mobile.replace(/\D/g, "").slice(-10),
      },
    });
  } catch (err) {
    console.error("Razorpay order error:", err);
    return jsonError("Failed to create payment order", 500);
  }
}
