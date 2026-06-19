import { prisma } from "@/lib/db";
import { KycStatus, UserNotificationType } from "@prisma/client";

export const KYC_DOC_TYPES = ["aadhaar", "pan"] as const;
export type KycDocType = (typeof KYC_DOC_TYPES)[number];

export async function getUserKycDocuments(userId: string) {
  const docs = await prisma.kycDocument.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const latestByType = new Map<string, (typeof docs)[0]>();
  for (const doc of docs) {
    if (!latestByType.has(doc.docType)) {
      latestByType.set(doc.docType, doc);
    }
  }

  return KYC_DOC_TYPES.map((type) => latestByType.get(type)).filter(Boolean) as typeof docs;
}

export async function hasRequiredKycDocuments(userId: string): Promise<boolean> {
  const docs = await getUserKycDocuments(userId);
  const types = new Set(docs.map((d) => d.docType));
  return KYC_DOC_TYPES.every((t) => types.has(t));
}

export async function resetKycOnReupload(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { kycStatus: true },
  });
  if (!user || user.kycStatus !== KycStatus.REJECTED) return;

  await prisma.user.update({
    where: { id: userId },
    data: { kycStatus: KycStatus.PENDING, kycRejectReason: null },
  });
}

export async function approveKyc(userId: string) {
  const hasBoth = await hasRequiredKycDocuments(userId);
  if (!hasBoth) {
    throw new Error("Both Aadhaar and PAN documents are required before approval");
  }

  await prisma.$transaction([
    prisma.kycDocument.updateMany({
      where: { userId },
      data: { status: KycStatus.VERIFIED },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { kycStatus: KycStatus.VERIFIED, kycRejectReason: null },
    }),
  ]);

  const { notifyUser } = await import("@/lib/notification-service");
  await notifyUser(userId, {
    title: "KYC Verified",
    message:
      "Your KYC documents have been approved. You can now request withdrawals.",
    type: UserNotificationType.KYC,
    sendEmail: true,
  });
}

export async function rejectKyc(userId: string, reason?: string) {
  const message =
    reason?.trim() ||
    "Your KYC documents were rejected. Please upload clear copies of Aadhaar and PAN.";

  await prisma.$transaction([
    prisma.kycDocument.updateMany({
      where: { userId },
      data: { status: KycStatus.REJECTED },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: KycStatus.REJECTED,
        kycRejectReason: message,
      },
    }),
  ]);

  const { notifyUser } = await import("@/lib/notification-service");
  await notifyUser(userId, {
    title: "KYC Rejected",
    message,
    type: UserNotificationType.KYC,
    sendEmail: true,
  });
}

export async function replaceKycDocument(
  userId: string,
  docType: KycDocType,
  s3Key: string
) {
  await prisma.kycDocument.deleteMany({
    where: { userId, docType },
  });

  return prisma.kycDocument.create({
    data: {
      userId,
      docType,
      s3Key,
      status: KycStatus.PENDING,
    },
  });
}

export async function getKycSummary(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { kycStatus: true, kycRejectReason: true },
  });
  if (!user) throw new Error("User not found");

  const documents = await getUserKycDocuments(userId);
  const bothUploaded = await hasRequiredKycDocuments(userId);
  const canUpload = user.kycStatus !== KycStatus.VERIFIED;

  return {
    status: user.kycStatus.toLowerCase(),
    rejectReason: user.kycRejectReason,
    documents: documents.map((d) => ({
      id: d.id,
      docType: d.docType,
      status: d.status.toLowerCase(),
      uploadedAt: d.createdAt.toISOString(),
    })),
    canUpload,
    bothUploaded,
    underReview: bothUploaded && user.kycStatus === KycStatus.PENDING,
  };
}
