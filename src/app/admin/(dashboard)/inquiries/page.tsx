import { Metadata } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { InquiryManager, InquiryItem } from "@/components/admin/InquiryManager";

export const metadata: Metadata = {
  title: "Customer Inquiries | Pure Pour Co. Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  const supabase = createSupabaseAdminClient();
  const { data: inquiries } = await supabase
    .from("contact_inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  return <InquiryManager initialInquiries={(inquiries as InquiryItem[]) || []} />;
}

