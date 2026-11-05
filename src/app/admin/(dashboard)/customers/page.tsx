import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { CustomerList, CustomerRow } from "@/components/admin/CustomerList";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const admin = createSupabaseAdminClient();

  const { data: customers } = await admin
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <CustomerList
      initialCustomers={(customers || []) as CustomerRow[]}
    />
  );
}

