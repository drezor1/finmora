"use client";

import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
}

export function AdminHeader({
  title,
  subtitle,
  showSearch,
  searchPlaceholder = "Search...",
  onSearch,
}: AdminHeaderProps) {
  return (
    <header className="border-b border-border bg-card px-6 py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="w-full pl-9 sm:w-64"
                placeholder={searchPlaceholder}
                onChange={(e) => onSearch?.(e.target.value)}
              />
            </div>
          )}
          <button className="relative rounded-xl border border-border p-2.5 transition-colors hover:bg-background">
            <Bell className="h-5 w-5 text-muted" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-gold" />
          </button>
        </div>
      </div>
    </header>
  );
}
