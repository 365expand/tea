import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/StatusBadge";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createSupabaseAdminClient();

  const [
    { data: customer },
    { data: addresses },
    { data: orders },
  ] = await Promise.all([
    admin.from("customers").select("*").eq("id", id).single(),
    admin
      .from("customer_addresses")
      .select("*")
      .eq("user_id", id)
      .order("is_default", { ascending: false }),
    admin
      .from("orders")
      .select("id, order_number, grand_total, status, payment_status, payment_method, created_at")
      .or(`customer_id.eq.${id}`)
      .order("created_at", { ascending: false }),
  ]);

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/customers"
          className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 shadow-xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight font-sans">
            Customer Profile: {customer.full_name || customer.email}
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Registered customer ID: <span className="font-mono text-slate-700">{customer.id}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Details & Addresses */}
        <div className="space-y-5">
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Customer Details
            </h3>

            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono font-bold flex items-center justify-center text-sm shadow-xs">
                {(customer.full_name || customer.email)[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {customer.full_name || "Name not provided"}
                </p>
                <p className="text-xs text-slate-500 font-medium">Registered Account</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5 text-slate-700">
                <Mail className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-mono">{customer.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-mono">{customer.phone || "No phone added"}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <Calendar className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-mono">Member since {formatDate(customer.created_at)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <p className="text-[11px] font-medium text-slate-500">Total Orders</p>
                <p className="text-base font-bold text-slate-900 font-mono">{customer.total_orders}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <p className="text-[11px] font-medium text-slate-500">Total Spent</p>
                <p className="text-base font-bold text-emerald-600 font-mono">
                  {formatCurrency(customer.total_spent)}
                </p>
              </div>
            </div>
          </div>

          {/* Saved Addresses */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Saved Delivery Addresses
            </h3>

            {!addresses || addresses.length === 0 ? (
              <p className="text-xs text-slate-400">No saved addresses on file.</p>
            ) : (
              <div className="space-y-2.5">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 text-xs space-y-1 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{addr.full_name}</span>
                      {addr.is_default && (
                        <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-1.5 py-0.5 rounded font-medium">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600">{addr.line1}</p>
                    {addr.line2 && <p className="text-slate-600">{addr.line2}</p>}
                    <p className="text-slate-600 font-mono">
                      {addr.city}, {addr.state} - {addr.postal_code}
                    </p>
                    <p className="text-slate-500 font-mono text-[11px]">Phone: {addr.phone}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 2 Cols: Order History */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Order History
              </h3>
              <span className="text-xs font-mono text-slate-500">
                {orders?.length || 0} orders placed
              </span>
            </div>

            {!orders || orders.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                This customer has not placed any orders yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/75 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-4">Order #</th>
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Total</th>
                      <th className="py-2.5 px-4">Order Status</th>
                      <th className="py-2.5 px-4">Payment</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                          {o.order_number}
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">
                          {formatDate(o.created_at)}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                          {formatCurrency(o.grand_total)}
                        </td>
                        <td className="py-2.5 px-4">
                          <OrderStatusBadge status={o.status} />
                        </td>
                        <td className="py-2.5 px-4">
                          <PaymentStatusBadge status={o.payment_status} />
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <Link
                            href={`/admin/orders/${o.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

