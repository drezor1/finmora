"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/routing";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.replace("/admin/login");
      return;
    }
    if (session.user.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [session, status, router]);

  if (status === "loading" || !session?.user || session.user.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
