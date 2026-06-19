import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { fulfillPayment } from "@/lib/investment-service";

export async function POST(request: Request) {
  const signature = request.headers.get("x-razorpay-signature");
  const body = await request.text();

  if (!signature || !verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: {
    event?: string;
    payload?: {
      payment?: {
        entity?: {
          id?: string;
          order_id?: string;
          status?: string;
        };
      };
    };
  };

  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (event.event === "payment.captured") {
    const paymentEntity = event.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;
    const paymentId = paymentEntity?.id;

    if (orderId && paymentId) {
      try {
        await fulfillPayment(orderId, paymentId);
      } catch (err) {
        console.error("Webhook fulfill error:", err);
        return NextResponse.json({ error: "Fulfillment failed" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
