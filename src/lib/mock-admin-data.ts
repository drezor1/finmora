import type { KYCStatus, WithdrawalStatus } from "./types";

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
}

export interface AdminReferral {
  id: string;
  userName: string;
  referralCode: string;
  totalReferrals: number;
  totalEarnings: number;
  pendingPayout: number;
}

export interface AdminSIP {
  id: string;
  userName: string;
  amount: number;
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
  imageUrl?: string;
}

export interface AdminReferralPenalty {
  id: string;
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
  channel: "sms" | "email" | "push";
  audience: string;
  sentAt: string;
  status: "sent" | "scheduled" | "failed";
}

export const ADMIN_STATS = {
  totalUsers: 12580,
  pendingKyc: 342,
  totalInvested: 480000000,
  pendingWithdrawals: 28,
  pendingWithdrawalAmount: 485000,
  activeSipUsers: 4200,
  totalReferralPayouts: 21000000,
  activeAds: 12,
};

export const MOCK_USERS: AdminUser[] = [
  {
    id: "U001",
    name: "Rahul Sharma",
    email: "rahul@email.com",
    mobile: "+91 98765 43210",
    referralCode: "WP-RH8K2",
    referredBy: "WP-AK9M1",
    kycStatus: "verified",
    totalInvestment: 250000,
    plan: "Infinity Grow",
    createdAt: "2026-01-15",
    status: "active",
    referralCount: 24,
  },
  {
    id: "U002",
    name: "Priya Patel",
    email: "priya@email.com",
    mobile: "+91 87654 32109",
    referralCode: "WP-PR3N7",
    kycStatus: "pending",
    totalInvestment: 50000,
    plan: "Infinity Start",
    createdAt: "2026-02-20",
    status: "active",
    referralCount: 5,
  },
  {
    id: "U003",
    name: "Amit Kumar",
    email: "amit@email.com",
    mobile: "+91 76543 21098",
    referralCode: "WP-AM5L2",
    referredBy: "WP-RH8K2",
    kycStatus: "verified",
    totalInvestment: 1500000,
    plan: "Infinity Max",
    createdAt: "2025-11-08",
    status: "active",
    referralCount: 18,
  },
  {
    id: "U004",
    name: "Sneha Reddy",
    email: "sneha@email.com",
    mobile: "+91 65432 10987",
    referralCode: "WP-SN1Q4",
    kycStatus: "rejected",
    totalInvestment: 0,
    plan: "—",
    createdAt: "2026-03-01",
    status: "suspended",
    referralCount: 0,
  },
  {
    id: "U005",
    name: "Vikram Singh",
    email: "vikram@email.com",
    mobile: "+91 54321 09876",
    referralCode: "WP-VK7P9",
    referredBy: "WP-PR3N7",
    kycStatus: "verified",
    totalInvestment: 500000,
    plan: "Infinity Grow",
    createdAt: "2026-01-28",
    status: "active",
    referralCount: 12,
  },
];

export const MOCK_WITHDRAWALS: AdminWithdrawal[] = [
  {
    id: "W001",
    userName: "Rahul Sharma",
    amount: 25000,
    type: "monthly_income",
    status: "pending",
    requestedAt: "2026-06-18",
  },
  {
    id: "W002",
    userName: "Amit Kumar",
    amount: 150000,
    type: "monthly_income",
    status: "pending",
    requestedAt: "2026-06-17",
  },
  {
    id: "W003",
    userName: "Vikram Singh",
    amount: 5000,
    type: "referral_income",
    status: "pending",
    requestedAt: "2026-06-18",
  },
  {
    id: "W004",
    userName: "Priya Patel",
    amount: 4000,
    type: "monthly_income",
    status: "approved",
    requestedAt: "2026-06-01",
  },
  {
    id: "W005",
    userName: "Sneha Reddy",
    amount: 2000,
    type: "referral_income",
    status: "rejected",
    requestedAt: "2026-05-28",
  },
];

export const MOCK_REFERRALS: AdminReferral[] = [
  {
    id: "R001",
    userName: "Rahul Sharma",
    referralCode: "WP-RH8K2",
    totalReferrals: 24,
    totalEarnings: 85000,
    pendingPayout: 5000,
  },
  {
    id: "R002",
    userName: "Amit Kumar",
    referralCode: "WP-AM5L2",
    totalReferrals: 18,
    totalEarnings: 120000,
    pendingPayout: 0,
  },
  {
    id: "R003",
    userName: "Vikram Singh",
    referralCode: "WP-VK7P9",
    totalReferrals: 12,
    totalEarnings: 42000,
    pendingPayout: 5000,
  },
  {
    id: "R004",
    userName: "Priya Patel",
    referralCode: "WP-PR3N7",
    totalReferrals: 5,
    totalEarnings: 8500,
    pendingPayout: 0,
  },
];

export const MOCK_SIPS: AdminSIP[] = [
  {
    id: "S001",
    userName: "Rahul Sharma",
    amount: 7500,
    lockYears: 3,
    percentOfIncome: 30,
    startDate: "2026-01-15",
    endDate: "2029-01-15",
    status: "active",
  },
  {
    id: "S002",
    userName: "Amit Kumar",
    amount: 45000,
    lockYears: 5,
    percentOfIncome: 30,
    startDate: "2025-11-08",
    endDate: "2030-11-08",
    status: "active",
  },
  {
    id: "S003",
    userName: "Vikram Singh",
    amount: 12500,
    lockYears: 1,
    percentOfIncome: 25,
    startDate: "2026-01-28",
    endDate: "2027-01-28",
    status: "active",
  },
  {
    id: "S004",
    userName: "Priya Patel",
    amount: 1200,
    lockYears: 1,
    percentOfIncome: 30,
    startDate: "2026-02-20",
    endDate: "2027-02-20",
    status: "active",
  },
];

export const MOCK_ADS: AdminAd[] = [
  {
    id: "A001",
    title: "HDFC Life Insurance",
    type: "company",
    advertiser: "HDFC Life",
    status: "active",
    impressions: 45200,
    clicks: 1280,
    startDate: "2026-04-01",
    targetUrl: "https://hdfclife.com",
    imageUrl: "/ads/hdfc.jpg",
  },
  {
    id: "A002",
    title: "Zerodha Trading Platform",
    type: "company",
    advertiser: "Zerodha",
    status: "active",
    impressions: 38500,
    clicks: 980,
    startDate: "2026-03-15",
    targetUrl: "https://zerodha.com",
  },
  {
    id: "A003",
    title: "Google AdSense Banner",
    type: "third_party",
    advertiser: "Google AdSense",
    status: "active",
    impressions: 128000,
    clicks: 4200,
    startDate: "2026-01-01",
  },
  {
    id: "A004",
    title: "Real Estate — Prestige Group",
    type: "company",
    advertiser: "Prestige Estates",
    status: "pending",
    impressions: 0,
    clicks: 0,
    startDate: "2026-06-20",
    targetUrl: "https://prestigeestates.com",
  },
  {
    id: "A005",
    title: "Media.net Display Ads",
    type: "third_party",
    advertiser: "Media.net",
    status: "paused",
    impressions: 22000,
    clicks: 540,
    startDate: "2025-12-01",
  },
];

export const MOCK_NOTIFICATIONS: AdminNotification[] = [
  {
    id: "N001",
    title: "Monthly ROI Credited",
    channel: "sms",
    audience: "All Active Investors",
    sentAt: "2026-06-01 09:00",
    status: "sent",
  },
  {
    id: "N002",
    title: "KYC Verification Reminder",
    channel: "email",
    audience: "Pending KYC Users",
    sentAt: "2026-06-15 10:30",
    status: "sent",
  },
  {
    id: "N003",
    title: "New Infinity Max Plan Launch",
    channel: "push",
    audience: "All Users",
    sentAt: "2026-06-20 08:00",
    status: "scheduled",
  },
  {
    id: "N004",
    title: "Withdrawal Approved",
    channel: "sms",
    audience: "Individual — Rahul Sharma",
    sentAt: "2026-06-10 14:22",
    status: "sent",
  },
];

export const MOCK_REFERRAL_PENALTIES: AdminReferralPenalty[] = [
  {
    id: "P001",
    userName: "Sneha Reddy",
    reason: "fraud",
    amount: 5000,
    appliedAt: "2026-05-15",
    status: "active",
  },
  {
    id: "P002",
    userName: "Unknown User",
    reason: "self_referral",
    amount: 2500,
    appliedAt: "2026-04-22",
    status: "active",
  },
  {
    id: "P003",
    userName: "Spam Account",
    reason: "spam",
    amount: 1000,
    appliedAt: "2026-03-10",
    status: "reversed",
  },
];

export const DEFAULT_ADSENSE_CONFIG: AdSenseConfig = {
  enabled: true,
  publisherId: "ca-pub-1234567890123456",
  adSlotHtml:
    '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>\n<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-1234567890123456" data-ad-slot="9876543210"></ins>',
  lastUpdated: "2026-06-01",
};
