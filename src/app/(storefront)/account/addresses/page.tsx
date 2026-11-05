import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { CustomerAddressManager, AddressItem } from "@/components/storefront/CustomerAddressManager";

export const dynamic = "force-dynamic";

export default async function CustomerAddressesPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/account/addresses");
  }

  const admin = createSupabaseAdminClient();
  const { data: addresses } = await admin
    .from("customer_addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <CustomerAddressManager initialAddresses={(addresses || []) as AddressItem[]} />
    </div>
  );
}

