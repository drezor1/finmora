import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, jsonError } from "@/lib/api-auth";
import { answerBuddyQuestion } from "@/lib/buddy-service";

const chatSchema = z.object({
  message: z.string().trim().min(1).max(500),
  locale: z.string().min(2).max(5).optional(),
});

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid request", 400);
  }

  try {
    const result = await answerBuddyQuestion(
      auth.userId,
      parsed.data.message,
      parsed.data.locale ?? "en"
    );
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to answer";
    return jsonError(message, 500);
  }
}
