import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAdminContext } from "@/lib/auth";
import { secretIsConfigured, getSettingsMap } from "@/lib/settings";
import { SettingsManager, SettingsMap } from "@/components/admin/SettingsManager";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const admin = createSupabaseAdminClient();

  const [
    settingsMap,
    hasRazorpaySecret,
    hasSmtpPassword,
    { data: emailTemplates },
    adminContext,
  ] = await Promise.all([
    getSettingsMap(),
    secretIsConfigured("razorpay_secret"),
    secretIsConfigured("smtp_password"),
    admin.from("email_templates").select("*").order("name", { ascending: true }),
    getAdminContext(),
  ]);

  const initialData: SettingsMap = {
    general: settingsMap.general || {},
    seo: settingsMap.seo || {},
    social: settingsMap.social || {},
    contact: settingsMap.contact || {},
    business: settingsMap.business || {},
    payment: settingsMap.payment || {},
    smtp: settingsMap.smtp || {},
    shipping: settingsMap.shipping || {},
    email_templates: emailTemplates || [],
    secretStatus: {
      hasRazorpaySecret,
      hasSmtpPassword,
    },
    currentAdmin: adminContext
      ? {
          fullName: adminContext.admin.full_name || "",
          email: adminContext.admin.email || adminContext.user.email || "",
          roleName: adminContext.roleName || "Super Admin",
        }
      : null,
  };

  return <SettingsManager initialData={initialData} />;
}
