import { NextResponse } from "next/server";
import { requireUser, jsonError } from "@/lib/api-auth";
import { kycUploadSchema } from "@/lib/validators/auth";
import {
  createKycUploadUrl,
  isSupabaseStorageConfigured,
  kycStoragePath,
} from "@/lib/supabase-storage";
import { replaceKycDocument, resetKycOnReupload } from "@/lib/kyc-service";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const user = await prisma.user.findUnique({ where: { id: auth.userId } });
  if (!user) return jsonError("User not found", 404);
  if (user.kycStatus === "VERIFIED") {
    return jsonError("KYC is already verified", 400);
  }

  const body = await request.json();
  const parsed = kycUploadSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid upload. Use JPG, PNG, or PDF up to 5 MB.");
  }

  const { docType, fileName } = parsed.data;
  const storagePath = kycStoragePath(auth.userId, fileName);

  await resetKycOnReupload(auth.userId);

  if (!isSupabaseStorageConfigured()) {
    const doc = await replaceKycDocument(auth.userId, docType, `local/${storagePath}`);
    await prisma.user.update({
      where: { id: auth.userId },
      data: { kycStatus: "PENDING" },
    });
    return NextResponse.json({
      documentId: doc.id,
      uploadUrl: null,
      mock: true,
    });
  }

  const signed = await createKycUploadUrl(storagePath);
  const doc = await replaceKycDocument(auth.userId, docType, storagePath);

  await prisma.user.update({
    where: { id: auth.userId },
    data: { kycStatus: "PENDING" },
  });

  return NextResponse.json({
    documentId: doc.id,
    uploadUrl: signed?.signedUrl ?? null,
    storagePath,
  });
}
