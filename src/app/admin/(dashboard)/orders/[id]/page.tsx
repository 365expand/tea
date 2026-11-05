import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { OrderDetailManager } from "@/components/admin/OrderDetailManager";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createSupabaseAdminClient();

  const [
    { data: order },
    { data: items },
    { data: addresses },
    { data: history },
    { data: notes },
    { data: payments },
    { data: refunds },
  ] = await Promise.all([
    admin.from("orders").select("*").eq("id", id).single(),
    admin.from("order_items").select("*").eq("order_id", id).order("created_at", { ascending: true }),
    admin.from("order_addresses").select("*").eq("order_id", id),
    admin.from("order_status_history").select("*").eq("order_id", id).order("created_at", { ascending: true }),
    admin.from("order_notes").select("*").eq("order_id", id).order("created_at", { ascending: false }),
    admin.from("payments").select("*").eq("order_id", id).order("created_at", { ascending: false }),
    admin.from("refunds").select("*").eq("order_id", id).order("created_at", { ascending: false }),
  ]);

  if (!order) {
    notFound();
  }

  return (
    <OrderDetailManager
      order={order}
      items={items || []}
      addresses={addresses || []}
      history={history || []}
      notes={notes || []}
      payments={payments || []}
      refunds={refunds || []}
    />
  );
}

