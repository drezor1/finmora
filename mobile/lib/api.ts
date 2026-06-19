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

  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : `Request failed (${res.status})`
    );
  }

  return data as T;
}

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

export async function login(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/api/mobile/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchUserMe(): Promise<UserMeResponse> {
  return apiFetch<UserMeResponse>("/api/mobile/auth/me");
}
