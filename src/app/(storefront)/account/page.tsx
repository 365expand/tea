import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/StatusBadge";
import {
  User,
  ShoppingBag,
  MapPin,
  ExternalLink,
  LogOut,
  ArrowRight,
  Clock,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerAccountPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  const admin = createSupabaseAdminClient();

  const [
    { data: customer },
    { data: recentOrders },
    { data: addresses },
  ] = await Promise.all([
    admin.from("customers").select("*").eq("id", user.id).maybeSingle(),
    admin
      .from("orders")
      .select("id, order_number, grand_total, status, payment_status, created_at")
      .or(`customer_id.eq.${user.id},customer_email.eq.${user.email}`)
      .order("created_at", { ascending: false })
      .limit(5),
    admin
      .from("customer_addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .limit(2),
  ]);

  const fullName = customer?.full_name || user.user_metadata?.full_name || "Tea Lover";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Top Banner */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-900 font-bold flex items-center justify-center text-lg shadow-xs">
            {fullName[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif">
              Welcome back, {fullName}!
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Account: {user.email} • Member since {formatDate(user.created_at)}
            </p>
          </div>
        </div>

        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:text-red-700 bg-stone-100 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Orders */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Recent Orders
              </h2>
              <Link
                href="/account/orders"
                className="text-xs font-semibold text-brand-700 hover:underline flex items-center gap-1"
              >
                All Orders <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {!recentOrders || recentOrders.length === 0 ? (
              <div className="p-12 text-center text-xs text-stone-400">
                You haven't placed any orders yet. Discover our harvest fresh teas!
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {recentOrders.map((o) => (
                  <div
                    key={o.id}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-stone-50/80 transition text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-stone-900">{o.order_number}</span>
                        <OrderStatusBadge status={o.status} />
                      </div>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        Placed {formatDate(o.created_at)} • Total:{" "}
                        <strong className="text-stone-800">{formatCurrency(o.grand_total)}</strong>
                      </p>
                    </div>

                    <Link
                      href={`/account/orders/${o.id}`}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-semibold transition"
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Saved Addresses & Track Order */}
        <div className="space-y-6">
          {/* Addresses */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-stone-400" />
                Delivery Address Book
              </h3>
              <Link
                href="/account/addresses"
                className="text-xs font-semibold text-brand-700 hover:underline"
              >
                Manage
              </Link>
            </div>

            {!addresses || addresses.length === 0 ? (
              <p className="text-xs text-stone-400">No delivery address saved yet.</p>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-0.5"
                  >
                    <span className="font-bold text-stone-900 block">{addr.full_name}</span>
                    <p className="text-stone-600">{addr.line1}</p>
                    <p className="text-stone-600">
                      {addr.city}, {addr.state} - {addr.postal_code}
                    </p>
                    <p className="text-stone-400 text-[11px]">Phone: {addr.phone}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Track Tool */}
          <div className="p-6 rounded-2xl bg-brand-900 text-white shadow-xs space-y-3">
            <h4 className="text-sm font-bold font-serif">Have a consignment to track?</h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              Check live dispatch, courier AWB tracking and delivery status instantly.
            </p>
            <Link
              href="/track-order"
              className="inline-block px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-lg transition"
            >
              Open Live Tracker &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

