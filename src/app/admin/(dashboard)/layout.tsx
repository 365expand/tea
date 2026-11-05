import { requireAdmin } from "@/lib/auth";
import { AdminLayoutShell } from "@/components/admin/AdminLayoutShell";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminContext = await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { data: generalSetting } = await admin
    .from("settings")
    .select("value")
    .eq("key", "general")
    .maybeSingle();

  const general = generalSetting?.value || {};

  return (
    <AdminLayoutShell
      adminName={adminContext.admin.full_name || "Admin"}
      adminEmail={adminContext.admin.email}
      roleName={adminContext.roleName}
      logoUrl={general.logo_url}
      websiteName={general.website_name}
    >
      {children}
    </AdminLayoutShell>
  );
}
