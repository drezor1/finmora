import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-auth";
import { adInquirySchema } from "@/lib/validators/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = adInquirySchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid inquiry data");

  const inquiry = await prisma.adInquiry.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      message: parsed.data.message,
      package: parsed.data.package || null,
    },
  });

  return NextResponse.json({
    id: inquiry.id,
    message: "Inquiry submitted successfully",
  });
}
