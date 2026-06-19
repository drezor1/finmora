import { NextResponse } from "next/server";
import { requireAdmin, jsonError } from "@/lib/api-auth";
import { adImageUploadSchema } from "@/lib/validators/auth";
import {
  adStoragePath,
  createAdUploadUrl,
  isSupabaseStorageConfigured,
} from "@/lib/supabase-storage";

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const parsed = adImageUploadSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid upload data");

  if (!isSupabaseStorageConfigured()) {
    return NextResponse.json({
      mock: true,
      path: `local/mock/${parsed.data.adId}-${parsed.data.fileName}`,
      message: "Storage not configured — use path as imageKey after mock upload",
    });
  }

  const path = adStoragePath(parsed.data.adId, parsed.data.fileName);
  const upload = await createAdUploadUrl(path);
  if (!upload) return jsonError("Failed to create upload URL", 500);

  return NextResponse.json({
    signedUrl: upload.signedUrl,
    token: upload.token,
    path: upload.path,
  });
}
