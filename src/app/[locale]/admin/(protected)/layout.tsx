import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminAuthGuard } from "@/components/admin/admin-auth-guard";

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGuard>
      <AdminSidebar />
      <div className="lg:pl-64">{children}</div>
    </AdminAuthGuard>
  );
}
