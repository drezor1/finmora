import { FinmoraBuddy } from "@/components/dashboard/finmora-buddy";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardBottomNav } from "@/components/layout/dashboard-bottom-nav";
import { ToastProvider } from "@/components/app/toast-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-background">
        <DashboardSidebar />
        <div className="pb-24 lg:pb-0 lg:pl-64">{children}</div>
        <DashboardBottomNav />
        <FinmoraBuddy />
      </div>
    </ToastProvider>
  );
}
