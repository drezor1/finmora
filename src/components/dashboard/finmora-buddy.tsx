"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Bot, Loader2, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiPost } from "@/lib/api-client";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "assistant"; text: string };

type BuddyChatResponse = {
  reply: string;
  quickReplies: string[];
  intent: string;
};

export function FinmoraBuddy() {
  const t = useTranslations("dashboard.buddy");
  const locale = useLocale();
  const quickReplies = t.raw("quickReplies") as string[];

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: t("greeting") },
  ]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const result = await apiPost<BuddyChatResponse>("/api/buddy/chat", {
        message: trimmed,
        locale,
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: result.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: t("errorReply") },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg shadow-accent/30 transition-transform hover:scale-105 sm:bottom-6 sm:right-6 lg:bottom-6"
        aria-label={t("title")}
      >
        <Bot className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card card-shadow-lg sm:w-96">
          <div className="flex items-center justify-between bg-primary px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-accent" />
              <span className="font-semibold">{t("title")}</span>
            </div>
            <button onClick={() => setOpen(false)}>
              <X className="h-5 w-5 opacity-70 hover:opacity-100" />
            </button>
          </div>

          <div className="flex max-h-72 flex-col gap-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                  m.role === "user"
                    ? "ml-auto bg-accent text-white"
                    : "bg-background text-foreground"
                )}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("thinking")}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 border-t border-border px-3 py-2">
            {quickReplies.map((label) => (
              <button
                key={label}
                onClick={() => sendMessage(label)}
                disabled={loading}
                className="rounded-full bg-background px-2.5 py-1 text-xs text-muted hover:text-accent disabled:opacity-50"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 border-t border-border p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder={t("placeholder")}
              disabled={loading}
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none disabled:opacity-50"
            />
            <Button
              variant="accent"
              size="sm"
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="shrink-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
