import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/StatusBadge";
import {
  ArrowLeft,
  Printer,
  Truck,
  CheckCircle2,
  Package,
  MapPin,
  ExternalLink,
  Clock,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerOrderDetailPage({ params }: OrderPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/account/orders/${id}`);

  const admin = createSupabaseAdminClient();

  const [
    { data: order },
    { data: items },
    { data: addresses },
    { data: history },
  ] = await Promise.all([
    admin.from("orders").select("*").eq("id", id).single(),
    admin.from("order_items").select("*").eq("order_id", id),
    admin.from("order_addresses").select("*").eq("order_id", id),
    admin.from("order_status_history").select("*").eq("order_id", id).order("created_at", { ascending: true }),
  ]);

  if (!order) notFound();

  // Ensure security: verify order belongs to this customer
  if (order.customer_id !== user.id && order.customer_email !== user.email) {
    notFound();
  }

  const shippingAddr = addresses?.find((a) => a.type === "shipping");

  const steps = [
    { key: "pending", label: "Received" },
    { key: "confirmed", label: "Confirmed" },
    { key: "processing", label: "Packing" },
    { key: "shipped", label: "On The Way" },
    { key: "delivered", label: "Delivered" },
  ];

  const currentIdx = steps.findIndex((s) => s.key === order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/account/orders"
            className="text-xs font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Orders
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif">
              Order {order.order_number}
            </h1>
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.payment_status} />
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Placed on {formatDate(order.created_at, true)}
          </p>
        </div>

        <Link
          href={`/account/orders/${order.id}/invoice`}
          target="_blank"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold rounded-xl border border-stone-300 shadow-xs transition"
        >
          <Printer className="w-4 h-4" />
          Print GST Invoice
        </Link>
      </div>

      {/* Progress Stepper */}
      {order.status !== "cancelled" && order.status !== "returned" && (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-6 right-6 top-4 h-0.5 bg-stone-200 z-0" />
            {steps.map((st, idx) => {
              const isPast = currentIdx >= idx;
              const isCurrent = currentIdx === idx;
              return (
                <div key={st.key} className="flex flex-col items-center relative z-10 space-y-1.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      isPast
                        ? "bg-brand-700 text-white ring-4 ring-brand-100"
                        : "bg-stone-200 text-stone-500"
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span
                    className={`text-xs ${
                      isCurrent
                        ? "font-extrabold text-brand-900"
                        : isPast
                        ? "font-semibold text-stone-800"
                        : "text-stone-400"
                    }`}
                  >
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Courier Tracking info if available */}
      {order.tracking_number && (
        <div className="p-5 rounded-2xl bg-brand-50/60 border border-brand-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-stone-900">
                Dispatched with {order.courier_name || "Express Courier"}
              </p>
              <p className="text-stone-600 font-mono">AWB: {order.tracking_number}</p>
            </div>
          </div>

          {order.tracking_url && (
            <a
              href={order.tracking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-700 text-white rounded-lg font-bold shadow-xs hover:bg-brand-600 transition"
            >
              Track on Courier Site <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* Items Breakdown */}
      <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-stone-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Package Items ({items?.length})
          </h3>
        </div>

        <div className="divide-y divide-stone-100 text-xs">
          {items?.map((item) => (
            <div key={item.id} className="p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden flex-shrink-0">
                  {item.product_image ? (
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                      <Package className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">{item.product_name}</h4>
                  <p className="text-stone-400 font-mono mt-0.5">
                    {item.net_quantity} • Qty: <strong>{item.quantity}</strong>
                  </p>
                </div>
              </div>

              <span className="font-extrabold text-sm text-stone-900">
                {formatCurrency(item.line_total)}
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="p-5 bg-stone-50/70 border-t border-stone-200 flex justify-end">
          <div className="w-64 space-y-2 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal:</span>
              <span className="font-medium text-stone-900">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Shipping Fee:</span>
              <span className="font-medium text-stone-900">
                {Number(order.shipping_total) === 0 ? "FREE" : formatCurrency(order.shipping_total)}
              </span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Included GST:</span>
              <span className="font-medium text-stone-900">{formatCurrency(order.tax_total)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-stone-900 pt-2 border-t border-stone-200">
              <span>Total Paid / Due:</span>
              <span>{formatCurrency(order.grand_total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Address & Delivery */}
      {shippingAddr && (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs text-xs space-y-2">
          <h3 className="font-bold uppercase tracking-wider text-stone-500 mb-2 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-stone-400" />
            Consignee Delivery Address
          </h3>
          <p className="font-bold text-stone-900 text-sm">{shippingAddr.full_name}</p>
          <p className="text-stone-600">{shippingAddr.line1}</p>
          {shippingAddr.line2 && <p className="text-stone-600">{shippingAddr.line2}</p>}
          <p className="text-stone-600">
            {shippingAddr.city}, {shippingAddr.state} - {shippingAddr.postal_code}
          </p>
          <p className="text-stone-500 font-mono mt-1">Phone: {shippingAddr.phone}</p>
        </div>
      )}
    </div>
  );
}

