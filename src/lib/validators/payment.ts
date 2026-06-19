import { z } from "zod";

export const createOrderSchema = z.object({
  planSlug: z.enum(["infinity-start", "infinity-grow", "infinity-max"]),
  amount: z.number().int().positive(),
});

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});
