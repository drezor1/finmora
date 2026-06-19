import type { KYCStatus, WithdrawalStatus } from "./types";

export const MOCK_USER = {
  id: "U001",
  name: "Rahul Sharma",
  email: "rahul@email.com",
  mobile: "+91 98765 43210",
  referralCode: "FM-A8K2M9",
  referredBy: "FM-X7P2K1",
  kycStatus: "verified" as KYCStatus,
  activePlan: "Infinity Grow",
  planRoi: 10,
  memberSince: "Jan 2026",
};

export const MOCK_INVESTMENTS = [
  {
    id: "INV001",
    plan: "Infinity Grow",
    amount: 250000,
    roi: 10,
    monthlyIncome: 25000,
    startDate: "2026-01-15",
    status: "active" as const,
    nextPayout: "2026-07-01",
  },
  {
    id: "INV002",
    plan: "Infinity Start",
    amount: 50000,
    roi: 8,
    monthlyIncome: 4000,
    startDate: "2025-11-01",
    status: "active" as const,
    nextPayout: "2026-07-01",
  },
];

export const MOCK_REFERRALS = [
  { id: "R1", name: "Priya Patel", date: "2026-05-12", deposit: 100000, commission: 5000, status: "paid" as const },
  { id: "R2", name: "Amit Kumar", date: "2026-04-28", deposit: 50000, commission: 2500, status: "paid" as const },
  { id: "R3", name: "Sneha Reddy", date: "2026-06-01", deposit: 250000, commission: 12500, status: "pending" as const },
  { id: "R4", name: "Vikram Singh", date: "2026-03-15", deposit: 10000, commission: 500, status: "paid" as const },
  { id: "R5", name: "Anita Das", date: "2026-02-20", deposit: 75000, commission: 3750, status: "paid" as const },
];

export const MOCK_SIP = {
  active: true,
  lockYears: 3 as const,
  percentOfIncome: 35,
  monthlyContribution: 8750,
  totalContributed: 52500,
  startDate: "2026-01-15",
  endDate: "2029-01-15",
  projectedValue: 385000,
  history: [
    { month: "Jun 2026", amount: 8750 },
    { month: "May 2026", amount: 8750 },
    { month: "Apr 2026", amount: 8750 },
    { month: "Mar 2026", amount: 8750 },
    { month: "Feb 2026", amount: 8750 },
    { month: "Jan 2026", amount: 8750 },
  ],
};

export const MOCK_USER_WITHDRAWALS = [
  { id: "W001", amount: 15000, type: "monthly_income" as const, status: "pending" as WithdrawalStatus, requestedAt: "2026-06-15" },
  { id: "W002", amount: 5000, type: "referral_income" as const, status: "approved" as WithdrawalStatus, requestedAt: "2026-06-01", processedAt: "2026-06-02" },
  { id: "W003", amount: 25000, type: "monthly_income" as const, status: "approved" as WithdrawalStatus, requestedAt: "2026-05-01", processedAt: "2026-05-03" },
  { id: "W004", amount: 2500, type: "referral_income" as const, status: "rejected" as WithdrawalStatus, requestedAt: "2026-04-20", processedAt: "2026-04-21" },
];

export const MOCK_INVOICES = [
  { id: "INV-2026-006", type: "Monthly ROI", amount: 25000, date: "2026-06-01", status: "paid" as const },
  { id: "INV-2026-005", type: "Referral Commission", amount: 5000, date: "2026-05-28", status: "paid" as const },
  { id: "INV-2026-004", type: "SIP Contribution", amount: 8750, date: "2026-05-15", status: "paid" as const },
  { id: "INV-2026-003", type: "Monthly ROI", amount: 25000, date: "2026-05-01", status: "paid" as const },
  { id: "INV-2026-002", type: "Referral Commission", amount: 2500, date: "2026-04-28", status: "paid" as const },
  { id: "INV-2026-001", type: "Investment Receipt", amount: 250000, date: "2026-01-15", status: "paid" as const },
];

export const MOCK_LEADERBOARD = [
  { rank: 1, name: "Rajesh M.", referrals: 48, earnings: 240000, badge: "gold" as const },
  { rank: 2, name: "Priya S.", referrals: 35, earnings: 175000, badge: "silver" as const },
  { rank: 3, name: "Amit K.", referrals: 28, earnings: 140000, badge: "bronze" as const },
  { rank: 4, name: "Rahul Sharma", referrals: 12, earnings: 22250, badge: "none" as const, isYou: true },
  { rank: 5, name: "Sneha R.", referrals: 11, earnings: 55000, badge: "none" as const },
  { rank: 6, name: "Vikram S.", referrals: 9, earnings: 45000, badge: "none" as const },
  { rank: 7, name: "Anita D.", referrals: 7, earnings: 35000, badge: "none" as const },
];

export const MOCK_NOTIFICATIONS = [
  { id: "N1", title: "ROI Credited", message: "₹25,000 monthly income credited to your account.", time: "2 hours ago", read: false, type: "income" as const },
  { id: "N2", title: "Referral Joined", message: "Sneha Reddy joined using your referral code.", time: "1 day ago", read: false, type: "referral" as const },
  { id: "N3", title: "Withdrawal Pending", message: "Your ₹15,000 withdrawal is under review.", time: "2 days ago", read: true, type: "withdrawal" as const },
  { id: "N4", title: "KYC Verified", message: "Your KYC documents have been approved.", time: "1 week ago", read: true, type: "kyc" as const },
  { id: "N5", title: "SIP Contribution", message: "₹8,750 SIP contribution processed.", time: "2 weeks ago", read: true, type: "sip" as const },
];

export const MOCK_ACTIVITY = [
  { type: "ROI Credit", amount: 25000, date: "Jun 1, 2026", status: "completed" as const },
  { type: "Referral Bonus", amount: 5000, date: "May 28, 2026", status: "completed" as const },
  { type: "SIP Contribution", amount: 8750, date: "May 25, 2026", status: "completed" as const },
  { type: "Withdrawal Request", amount: 15000, date: "May 20, 2026", status: "pending" as const },
];

export const MOCK_DASHBOARD_STATS = {
  totalInvestment: 300000,
  monthlyIncome: 29000,
  referralEarnings: 22250,
  sipBalance: 52500,
};

