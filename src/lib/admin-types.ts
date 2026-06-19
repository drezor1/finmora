import type { KYCStatus, WithdrawalStatus } from "./types";

export interface AdminStats {
  totalUsers: number;
  pendingKyc: number;
  totalInvested: number;
  pendingWithdrawals: number;
  pendingWithdrawalAmount: number;
  activeSipUsers: number;
  activeAds: number;
  totalReferralPayouts: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  referralCode: string;
  referredBy?: string;
  kycStatus: KYCStatus;
  totalInvestment: number;
  plan: string;
  createdAt: string;
  status?: "active" | "suspended";
  referralCount?: number;
}

export interface AdminWithdrawal {
  id: string;
  userName: string;
  amount: number;
  type: "monthly_income" | "referral_income";
  status: WithdrawalStatus;
  requestedAt: string;
  hoursPending?: number;
  slaOverdue?: boolean;
}

export interface AdminReferral {
  id: string;
  userName: string;
  referralCode: string;
  totalReferrals: number;
  totalEarnings: number;
  pendingPayout: number;
  availableBalance: number;
}

export interface AdminSIP {
  id: string;
  userName: string;
  amount: number;
  monthlyAmount: number;
  totalContributed: number;
  lockYears: 1 | 3 | 5;
  percentOfIncome: number;
  startDate: string;
  endDate: string;
  status: "active" | "completed";
}

export interface AdminAd {
  id: string;
  title: string;
  type: "company" | "third_party";
  advertiser: string;
  status: "active" | "paused" | "pending";
  impressions: number;
  clicks: number;
  startDate: string;
  targetUrl?: string;
  imageKey?: string | null;
  imageUrl?: string;
}

export interface AdminAdInquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  package: string | null;
  status: "pending" | "contacted" | "converted";
  createdAt: string;
}

export interface AdminReferralPenalty {
  id: string;
  userId?: string;
  userName: string;
  reason: string;
  amount: number;
  appliedAt: string;
  status: "active" | "reversed";
}

export interface AdSenseConfig {
  enabled: boolean;
  publisherId: string;
  adSlotHtml: string;
  lastUpdated: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  channel: "in_app" | "email" | "both" | "sms" | "push";
  audience: string;
  audienceLabel?: string;
  recipientCount?: number;
  sentAt: string;
  status: "sent" | "scheduled" | "failed";
}
