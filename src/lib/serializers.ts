import type {
  KycStatus,
  WithdrawalStatus,
  WithdrawalType,
  UserRole,
  AccountStatus,
  AdStatus,
  AdType,
  PenaltyReason,
  PenaltyStatus,
  SipStatus,
  ReferralEarningStatus,
  AdminNotificationStatus,
  NotificationChannel,
  UserNotificationType,
  InvoiceStatus,
} from "@prisma/client";

export function toKycStatus(s: KycStatus): "pending" | "verified" | "rejected" {
  return s.toLowerCase() as "pending" | "verified" | "rejected";
}

export function toWithdrawalStatus(
  s: WithdrawalStatus
): "pending" | "approved" | "rejected" {
  return s.toLowerCase() as "pending" | "approved" | "rejected";
}

export function toWithdrawalType(
  t: WithdrawalType
): "monthly_income" | "referral_income" {
  return t === "MONTHLY_INCOME" ? "monthly_income" : "referral_income";
}

export function fromWithdrawalType(
  t: "monthly_income" | "referral_income"
): WithdrawalType {
  return t === "monthly_income" ? "MONTHLY_INCOME" : "REFERRAL_INCOME";
}

export function toAdType(t: AdType): "company" | "third_party" {
  return t === "COMPANY" ? "company" : "third_party";
}

export function fromAdType(t: "company" | "third_party"): AdType {
  return t === "company" ? "COMPANY" : "THIRD_PARTY";
}

export function toAdStatus(s: AdStatus): "active" | "paused" | "pending" {
  return s.toLowerCase() as "active" | "paused" | "pending";
}

export function toPenaltyReason(
  r: PenaltyReason
): "fraud" | "self_referral" | "spam" {
  const map: Record<PenaltyReason, "fraud" | "self_referral" | "spam"> = {
    FRAUD: "fraud",
    SELF_REFERRAL: "self_referral",
    SPAM: "spam",
  };
  return map[r];
}

export function fromPenaltyReason(
  r: "fraud" | "self_referral" | "spam"
): PenaltyReason {
  const map = {
    fraud: "FRAUD" as PenaltyReason,
    self_referral: "SELF_REFERRAL" as PenaltyReason,
    spam: "SPAM" as PenaltyReason,
  };
  return map[r];
}

export function toAccountStatus(s: AccountStatus): "active" | "suspended" {
  return s === "ACTIVE" ? "active" : "suspended";
}

export function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function formatDateTime(d: Date): string {
  return d.toLocaleString("en-IN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export type { UserRole, SipStatus, ReferralEarningStatus, AdminNotificationStatus, NotificationChannel, UserNotificationType, InvoiceStatus, PenaltyStatus };
