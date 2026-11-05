import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { OrderListManager, OrderSummary } from "@/components/admin/OrderListManager";

export const dynamic = "force-dynamic";

interface OrdersPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const sp = (await searchParams) || {};
  const admin = createSupabaseAdminClient();

  const { data: orders } = await admin
    .from("orders")
    .select("id, order_number, customer_name, customer_email, grand_total, payment_method, payment_status, status, courier_name, tracking_number, created_at, order_items(id)")
    .order("created_at", { ascending: false });

  return (
    <OrderListManager
      initialOrders={(orders || []) as OrderSummary[]}
      initialStatusFilter={sp.status || "all"}
    />
  );
}

