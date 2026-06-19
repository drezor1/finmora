"use client";

import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminToastProps {
  message: string | null;
  onDismiss: () => void;
}

export function AdminToast({ message, onDismiss }: AdminToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) return;
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, 3000);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-[60] flex items-center gap-2 rounded-xl border border-accent/30 bg-card px-4 py-3 shadow-lg transition-all",
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      )}
    >
      <CheckCircle className="h-5 w-5 text-accent" />
      <span className="text-sm font-medium text-primary">{message}</span>
    </div>
  );
}
