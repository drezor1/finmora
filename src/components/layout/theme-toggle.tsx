"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("finmora-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored === "dark" || (!stored && prefersDark);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("finmora-theme", next ? "dark" : "light");
  }

  if (!mounted) {
    return (
      <button
        type="button"
        className={cn(
          "rounded-xl border border-border p-2.5 text-muted",
          className
        )}
        aria-label="Toggle theme"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "rounded-xl border border-border p-2.5 text-muted transition-colors hover:bg-background hover:text-foreground",
        className
      )}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
