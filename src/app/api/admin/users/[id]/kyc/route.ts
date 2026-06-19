import { NextResponse } from "next/server";
import { requireAdmin, jsonError } from "@/lib/api-auth";
import { getUserKycDocuments, hasRequiredKycDocuments } from "@/lib/kyc-service";
import {
  createKycViewUrl,
  isSupabaseStorageConfigured,
} from "@/lib/supabase-storage";
import { formatDate } from "@/lib/serializers";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const documents = await getUserKycDocuments(id);
  const bothUploaded = await hasRequiredKycDocuments(id);
  const storageConfigured = isSupabaseStorageConfigured();

  const withUrls = await Promise.all(
    documents.map(async (doc) => {
      let viewUrl: string | null = null;
      let mock = false;

      if (doc.s3Key.startsWith("local/")) {
        mock = true;
      } else if (storageConfigured) {
        try {
          viewUrl = await createKycViewUrl(doc.s3Key);
        } catch {
          viewUrl = null;
        }
      }

      return {
        id: doc.id,
        docType: doc.docType,
        status: doc.status.toLowerCase(),
        uploadedAt: formatDate(doc.createdAt),
        viewUrl,
        mock,
      };
    })
  );

  return NextResponse.json({
    documents: withUrls,
    bothUploaded,
  });
}
