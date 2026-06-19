import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "finmora_access_token";

export function getApiBaseUrl(): string {
  return process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
}

export async function getStoredToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setStoredToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearStoredToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const baseUrl = getApiBaseUrl();

  let res: Response;
  try {
    res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      `Cannot reach server at ${baseUrl}. Check EXPO_PUBLIC_API_URL in mobile/.env and your network.`
    );
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : `Request failed (${res.status})`
    );
  }

  return data as T;
}

export const apiGet = <T>(path: string) => apiFetch<T>(path);
export const apiPost = <T>(path: string, body: unknown) =>
  apiFetch<T>(path, { method: "POST", body: JSON.stringify(body) });
export const apiPatch = <T>(path: string, body: unknown) =>
  apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(body) });

export type LoginResponse = {
  accessToken: string;
  user: { id: string; name: string; email: string; role: string };
};

export type UserMeResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    mobile: string;
    referralCode: string;
    kycStatus: string;
    activePlan: string | null;
    planRoi: number | null;
    memberSince: string;
    referralCount: number;
  };
  stats: {
    totalInvestment: number;
    monthlyIncome: number;
    referralEarnings: number;
    referralBalance: number;
    monthlyIncomeBalance: number;
    daysUntilMonthlyWithdrawal: number;
    sipBalance: number;
  };
};

export type Investment = {
  id: string;
  plan: string;
  amount: number;
  roi: number;
  monthlyIncome: number;
  startDate: string;
  status: string;
  nextPayout: string | null;
};

export type CreateOrderResponse = {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
  planName: string;
  prefill: { name: string; email: string; contact: string };
};

export type ReferralsData = {
  referralCode: string;
  totalReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  availableBalance: number;
  network: Array<{
    id: string;
    name: string;
    joinDate: string;
    totalDeposit: number;
  }>;
  earnings: Array<{
    id: string;
    name: string;
    date: string;
    deposit: number;
    commission: number;
    status: "paid" | "pending";
  }>;
};

export type SipData = {
  active: boolean;
  status: string | null;
  lockYears: 1 | 3 | 5;
  percentOfIncome: number;
  monthlyContribution: number;
  totalContributed: number;
  startDate: string | null;
  endDate: string | null;
  projectedValue: number;
  daysRemaining: number;
  canEnroll: boolean;
  grossMonthlyIncome: number;
  history: Array<{ month: string; amount: number }>;
};

export type Withdrawal = {
  id: string;
  amount: number;
  type: "monthly_income" | "referral_income";
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  processedAt?: string;
};

export type WithdrawalLimits = {
  monthlyAvailable: number;
  referralAvailable: number;
  daysUntilMonthly: number;
  canWithdrawMonthly: boolean;
  canWithdrawReferral: boolean;
};

export type WithdrawalsResponse = {
  items: Withdrawal[];
  limits: WithdrawalLimits;
};

export type LeaderboardEntry = {
  rank: number;
  name: string;
  referrals: number;
  earnings: number;
  badge: "gold" | "silver" | "bronze" | "none";
  isYou?: boolean;
};

export type KycSummary = {
  status: string;
  rejectReason: string | null;
  documents: Array<{
    id: string;
    docType: string;
    status: string;
    uploadedAt: string;
  }>;
  canUpload: boolean;
  bothUploaded: boolean;
  underReview: boolean;
};

export async function fetchInvestments(): Promise<Investment[]> {
  return apiGet<Investment[]>("/api/investments");
}

export async function fetchReferrals(): Promise<ReferralsData> {
  return apiGet<ReferralsData>("/api/referrals");
}

export async function fetchSip(): Promise<SipData> {
  return apiGet<SipData>("/api/sip");
}

export async function fetchWithdrawals(): Promise<WithdrawalsResponse> {
  return apiGet<WithdrawalsResponse>("/api/withdrawals");
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  return apiGet<LeaderboardEntry[]>("/api/leaderboard");
}

export async function fetchKyc(): Promise<KycSummary> {
  return apiGet<KycSummary>("/api/kyc");
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  return apiPost<LoginResponse>("/api/mobile/auth/login", { email, password });
}

export async function fetchUserMe(): Promise<UserMeResponse> {
  return apiFetch<UserMeResponse>("/api/mobile/auth/me");
}

export function buildMobilePayUrl(order: CreateOrderResponse, token: string): string {
  const base = getApiBaseUrl();
  const params = new URLSearchParams({
    token,
    orderId: order.orderId,
    key: order.key,
    amount: String(order.amount),
    currency: order.currency,
    planName: order.planName,
    name: order.prefill.name,
    email: order.prefill.email,
    contact: order.prefill.contact,
  });
  return `${base}/mobile-pay?${params.toString()}`;
}
