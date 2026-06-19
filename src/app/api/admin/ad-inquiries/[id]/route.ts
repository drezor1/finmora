import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, jsonError } from "@/lib/api-auth";
import { formatDate } from "@/lib/serializers";
import type { AdInquiryStatus } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const body = await request.json();
  const status = body.status as "pending" | "contacted" | "converted" | undefined;
  if (!status) return jsonError("Status required");

  const inquiry = await prisma.adInquiry.update({
    where: { id },
    data: { status: status.toUpperCase() as AdInquiryStatus },
  });

  return NextResponse.json({
    id: inquiry.id,
    name: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone,
    message: inquiry.message,
    package: inquiry.package,
    status: inquiry.status.toLowerCase(),
    createdAt: formatDate(inquiry.createdAt),
  });
}
