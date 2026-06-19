"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function AdminModal({
  open,
  onClose,
  title,
  children,
  className,
}: AdminModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl",
          className
        )}
        role="dialog"
        aria-modal
        aria-labelledby="admin-modal-title"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="admin-modal-title" className="text-lg font-semibold text-primary">
            {title}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
