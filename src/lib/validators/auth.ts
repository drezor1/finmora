import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  mobile: z.string().min(10),
  password: z.string().min(6),
  referralCode: z.string().min(4),
});

export const withdrawalSchema = z.object({
  amount: z.number().int().positive(),
  type: z.enum(["monthly_income", "referral_income"]),
});

export const kycUploadSchema = z.object({
  docType: z.enum(["aadhaar", "pan"]),
  fileName: z.string().min(1),
  contentType: z.enum([
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
  ]),
  fileSize: z.number().int().positive().max(5 * 1024 * 1024),
});

export const adCreateSchema = z.object({
  title: z.string().min(1),
  advertiser: z.string().min(1),
  startDate: z.string().optional(),
  targetUrl: z.string().url().optional().or(z.literal("")),
  imageKey: z.string().optional(),
});

export const adInquirySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10).optional().or(z.literal("")),
  message: z.string().min(10),
  package: z.string().optional(),
});

export const adImageUploadSchema = z.object({
  adId: z.string().min(1),
  fileName: z.string().min(1),
  contentType: z.enum(["image/jpeg", "image/png", "image/jpg", "image/webp"]),
  fileSize: z.number().int().positive().max(5 * 1024 * 1024),
});

export const penaltySchema = z.object({
  userId: z.string(),
  reason: z.enum(["fraud", "self_referral", "spam"]),
  amount: z.number().int().positive(),
});

export const notificationSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  channel: z.enum(["in_app", "email", "both"]),
  audience: z.enum(["allUsers", "activeInvestors", "pendingKyc", "pendingWithdrawals"]),
  scheduledAt: z.string().optional(),
});
