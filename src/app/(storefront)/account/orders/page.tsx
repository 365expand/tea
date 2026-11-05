import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/StatusBadge";
import { ArrowLeft, ShoppingBag, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerOrdersPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/account/orders");

  const admin = createSupabaseAdminClient();
  const { data: orders } = await admin
    .from("orders")
    .select("id, order_number, grand_total, status, payment_status, payment_method, created_at, order_items(product_name, quantity, product_image)")
    .or(`customer_id.eq.${user.id},customer_email.eq.${user.email}`)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-6">
      <div>
        <Link
          href="/account"
          className="text-xs font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Account
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-serif">
          Your Order History
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Review previous tea purchases, dispatch statuses &amp; invoices
        </p>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-3xl p-16 text-center text-xs text-stone-400">
          <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-stone-800">No orders placed yet</h3>
          <p className="mt-1">When you place an order, it will appear here with live updates.</p>
          <Link
            href="/products"
            className="mt-4 inline-block px-5 py-2 bg-brand-700 text-white font-bold rounded-xl shadow-xs"
          >
            Explore Teas
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-sm text-stone-900">{o.order_number}</span>
                  <OrderStatusBadge status={o.status} />
                  <PaymentStatusBadge status={o.payment_status} />
                </div>
                <p className="text-xs text-stone-400">
                  Placed on {formatDate(o.created_at, true)} • Payment:{" "}
                  <strong className="uppercase font-mono text-stone-700">{o.payment_method}</strong>
                </p>

                {/* Items preview */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-stone-600">
                  {o.order_items?.map((item: any, idx: number) => (
                    <span key={idx} className="bg-stone-50 px-2 py-0.5 rounded border border-stone-200">
                      {item.product_name} x {item.quantity}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 self-end sm:self-auto border-t sm:border-0 pt-3 sm:pt-0">
                <span className="text-base font-extrabold text-stone-900">
                  {formatCurrency(o.grand_total)}
                </span>
                <Link
                  href={`/account/orders/${o.id}`}
                  className="px-3.5 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-900 rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  Order Details
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

