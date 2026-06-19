import { NextResponse } from "next/server";
import { processScheduledNotifications } from "@/lib/notification-service";

export async function GET(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const processed = await processScheduledNotifications();
  return NextResponse.json({ ok: true, processed });
}
