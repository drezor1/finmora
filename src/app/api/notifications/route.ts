import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const items = await prisma.userNotification.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json(
    items.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      time: n.createdAt.toLocaleDateString("en-IN"),
      read: n.read,
      type: n.type.toLowerCase(),
    }))
  );
}

export async function PATCH() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  await prisma.userNotification.updateMany({
    where: { userId: auth.userId, read: false },
    data: { read: true },
  });

  return NextResponse.json({ ok: true });
}
