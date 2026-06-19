import { createClient, SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!adminClient) {
    adminClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminClient;
}

export function isSupabaseStorageConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function kycStoragePath(userId: string, fileName: string): string {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${userId}/${Date.now()}-${safe}`;
}

export async function createKycUploadUrl(
  path: string
): Promise<{ signedUrl: string; token: string; path: string } | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const bucket = process.env.SUPABASE_KYC_BUCKET ?? "kyc";
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(path);

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create upload URL");
  }

  return {
    signedUrl: data.signedUrl,
    token: data.token,
    path: data.path,
  };
}

export async function createKycViewUrl(
  path: string,
  expiresInSeconds = 900
): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const bucket = process.env.SUPABASE_KYC_BUCKET ?? "kyc";
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "Failed to create view URL");
  }

  return data.signedUrl;
}

export function adStoragePath(adId: string, fileName: string): string {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `ads/${adId}/${Date.now()}-${safe}`;
}

export async function createAdUploadUrl(
  path: string
): Promise<{ signedUrl: string; token: string; path: string } | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const bucket = process.env.SUPABASE_ADS_BUCKET ?? process.env.SUPABASE_KYC_BUCKET ?? "kyc";
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(path);

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create upload URL");
  }

  return {
    signedUrl: data.signedUrl,
    token: data.token,
    path: data.path,
  };
}

export async function createAdViewUrl(
  path: string,
  expiresInSeconds = 3600
): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const bucket = process.env.SUPABASE_ADS_BUCKET ?? process.env.SUPABASE_KYC_BUCKET ?? "kyc";
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "Failed to create view URL");
  }

  return data.signedUrl;
}
