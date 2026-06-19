"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppToast } from "@/components/app/toast-provider";

export function CopyCodeButton({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useAppToast();

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    showToast("Referral code copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className={cn("gap-2", className)}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-accent" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          Copy
        </>
      )}
    </Button>
  );
}
