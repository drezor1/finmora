"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastContextValue = {
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useAppToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useAppToast must be used within ToastProvider");
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const showToast = useCallback((msg: string) => {
    setMessage(msg);
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => setMessage(null), 200);
    }, 3000);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message && (
        <div
          className={cn(
            "fixed bottom-24 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-xl border border-accent/30 bg-card px-4 py-3 shadow-lg transition-all lg:bottom-6",
            visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          )}
        >
          <CheckCircle className="h-5 w-5 shrink-0 text-accent" />
          <span className="text-sm font-medium text-primary">{message}</span>
        </div>
      )}
    </ToastContext.Provider>
  );
}
