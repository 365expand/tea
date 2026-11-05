import { Metadata } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { FaqManager, FaqItem } from "@/components/admin/FaqManager";

export const metadata: Metadata = {
  title: "FAQs Management | Pure Pour Co. Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminFaqsPage() {
  const supabase = createSupabaseAdminClient();
  const { data: faqs } = await supabase
    .from("faqs")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  return <FaqManager initialFaqs={(faqs as FaqItem[]) || []} />;
}

