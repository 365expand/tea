import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSetting } from "@/lib/settings";
import { CheckoutClient } from "@/components/storefront/CheckoutClient";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();

  const [
    { data: { user } },
    paymentSettings,
    shippingSettings,
    businessSettings,
  ] = await Promise.all([
    supabase.auth.getUser(),
    getSetting("payment", {
      razorpay_enabled: false,
      razorpay_key_id: "",
      cod_enabled: true,
      payment_mode: "test",
    }),
    getSetting("shipping", {
      default_charge: 60,
      free_threshold: 999,
    }),
    getSetting("business", {
      tax_enabled: true,
      default_tax_rate: 5,
    }),
  ]);

  let initialUser = null;
  let savedAddresses: any[] = [];

  if (user) {
    initialUser = {
      email: user.email || "",
      fullName: user.user_metadata?.full_name || "",
      phone: user.user_metadata?.phone || "",
    };

    const { data: addrs } = await admin
      .from("customer_addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false });

    savedAddresses = addrs || [];
  }

  return (
    <CheckoutClient
      paymentSettings={paymentSettings}
      shippingSettings={shippingSettings}
      businessSettings={businessSettings}
      initialUser={initialUser}
      savedAddresses={savedAddresses}
    />
  );
}

