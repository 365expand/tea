import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/admin/StatusBadge";
import {
  Search,
  Truck,
  CheckCircle2,
  Package,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface TrackPageProps {
  searchParams: Promise<{
    num?: string;
    email?: string;
  }>;
}

export default async function TrackOrderPage({ searchParams }: TrackPageProps) {
  const sp = (await searchParams) || {};
  const { num = "", email = "" } = sp;
  const admin = createSupabaseAdminClient();

  let order: any = null;
  let items: any[] = [];
  let history: any[] = [];
  let requiresVerification = false;

  if (num.trim()) {
    if (!email.trim()) {
      requiresVerification = true;
    } else {
      const cleanEmail = email.trim();
      const query = admin
        .from("orders")
        .select("id, order_number, customer_name, customer_email, customer_phone, grand_total, status, payment_status, courier_name, tracking_number, tracking_url, created_at, confirmed_at, shipped_at, delivered_at")
        .ilike("order_number", num.trim())
        .or(`customer_email.ilike.%${cleanEmail}%,customer_phone.ilike.%${cleanEmail}%`);

      const { data: matchedOrder } = await query.maybeSingle();

      if (matchedOrder) {
        order = matchedOrder;
        const [{ data: orderItems }, { data: statusHistory }] = await Promise.all([
          admin.from("order_items").select("*").eq("order_id", order.id),
          admin
            .from("order_status_history")
            .select("*")
            .eq("order_id", order.id)
            .order("created_at", { ascending: true }),
        ]);
        items = orderItems || [];
        history = statusHistory || [];
      }
    }
  }

  const steps = [
    { key: "pending", label: "Order Received" },
    { key: "confirmed", label: "Confirmed" },
    { key: "processing", label: "Packing Fresh" },
    { key: "shipped", label: "Dispatched & In Transit" },
    { key: "delivered", label: "Delivered" },
  ];

  const currentIdx = order ? steps.findIndex((s) => s.key === order.status) : -1;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center mx-auto mb-2">
          <Truck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-serif">
          Track Your Tea Consignment
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Enter your order number and customer email or mobile number to track shipment progress.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs max-w-2xl mx-auto">
        <form method="GET" action="/track-order" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Order Number *
              </label>
              <input
                type="text"
                required
                name="num"
                defaultValue={num}
                placeholder="e.g. TEA-000001"
                className="w-full px-3 py-2 text-xs font-mono uppercase border border-stone-300 rounded-lg focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Email or Mobile Number
              </label>
              <input
                type="text"
                name="email"
                defaultValue={email}
                placeholder="you@example.com or phone"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-brand-700 hover:bg-brand-600 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            Track Consignment
          </button>
        </form>
      </div>

      {/* Result Display */}
      {requiresVerification && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 text-center text-xs text-amber-800 max-w-lg mx-auto">
          <ShieldCheck className="w-8 h-8 text-amber-600 mx-auto mb-2" />
          <p className="font-bold text-stone-900 text-sm">Security Verification Required</p>
          <p className="mt-1 text-stone-600">
            To protect customer privacy, please enter the email address or phone number used when placing order{" "}
            <span className="font-mono font-bold text-stone-900">{num}</span>.
          </p>
        </div>
      )}

      {num && !requiresVerification && !order && (
        <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center text-xs text-stone-500 max-w-lg mx-auto">
          <Package className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <p className="font-bold text-stone-800">No consignment found for "{num}"</p>
          <p className="mt-1 text-stone-400">
            Please check that the order number and email/phone match your confirmation details.
          </p>
        </div>
      )}

      {order && (
        <div className="space-y-6 animate-fade-in">
          {/* Order Header */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-lg sm:text-xl font-bold text-stone-900">
                  {order.order_number}
                </span>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="text-xs text-stone-400 mt-1">
                Recipient: <strong>{order.customer_name}</strong> • Placed on {formatDate(order.created_at, true)}
              </p>
            </div>

            <div className="text-right">
              <span className="text-sm font-extrabold text-stone-900">
                {formatCurrency(order.grand_total)}
              </span>
              <span className="block text-[11px] text-stone-400 uppercase font-mono">
                {order.payment_method}
              </span>
            </div>
          </div>

          {/* Stepper */}
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
                        className={`text-[11px] sm:text-xs text-center ${
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

          {/* Courier Details */}
          {order.tracking_number && (
            <div className="p-5 rounded-2xl bg-brand-50/70 border border-brand-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-700 text-white flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-stone-900">
                    Handed over to {order.courier_name || "Courier Partner"}
                  </p>
                  <p className="text-stone-600 font-mono">AWB Tracking Number: {order.tracking_number}</p>
                </div>
              </div>

              {order.tracking_url && (
                <a
                  href={order.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-700 text-white rounded-lg font-bold shadow-xs hover:bg-brand-600 transition"
                >
                  Live Courier Tracking <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

          {/* Package items */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Items in this Shipment
            </h3>
            <div className="divide-y divide-stone-100 text-xs">
              {items.map((i) => (
                <div key={i.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-stone-900">{i.product_name}</span>
                    <span className="text-stone-400 font-mono text-[11px] block">
                      Qty: {i.quantity} • {i.net_quantity}
                    </span>
                  </div>
                  <span className="font-bold text-stone-800">{formatCurrency(i.line_total)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

