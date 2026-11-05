import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/StatusBadge";
import {
  TrendingUp,
  CreditCard,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle2,
  Package,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface DashboardProps {
  searchParams: Promise<{ range?: string }>;
}

export default async function AdminDashboardPage({ searchParams }: DashboardProps) {
  const { range = "30d" } = await searchParams;
  const admin = createSupabaseAdminClient();

  // Date filter logic
  const now = new Date();
  let startDate: Date | null = new Date();
  if (range === "today") {
    startDate.setHours(0, 0, 0, 0);
  } else if (range === "7d") {
    startDate.setDate(now.getDate() - 7);
  } else if (range === "30d") {
    startDate.setDate(now.getDate() - 30);
  } else if (range === "month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    startDate = null; // all time
  }

  // 1. Fetch orders in range
  let orderQuery = admin.from("orders").select("id, grand_total, status, payment_status, created_at");
  if (startDate) {
    orderQuery = orderQuery.gte("created_at", startDate.toISOString());
  }
  const { data: ordersInRange } = await orderQuery;
  const orders = ordersInRange || [];

  const totalSales = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.grand_total || 0), 0);

  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.status === "pending").length;
  const processingOrdersCount = orders.filter((o) => o.status === "processing").length;
  const deliveredOrdersCount = orders.filter((o) => o.status === "delivered").length;

  // 2. Verified Collected Revenue (from payments table where status = 'paid')
  let paymentQuery = admin
    .from("payments")
    .select("amount, created_at")
    .eq("status", "paid");
  if (startDate) {
    paymentQuery = paymentQuery.gte("created_at", startDate.toISOString());
  }
  const { data: payments } = await paymentQuery;
  const totalCollected = (payments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);

  // 3. Total Customers
  const { count: totalCustomersCount } = await admin
    .from("customers")
    .select("id", { count: "exact", head: true });

  // 4. Low stock products alert
  const { data: lowStockProducts } = await admin
    .from("products")
    .select("id, name, sku, stock_quantity, low_stock_threshold")
    .filter("stock_quantity", "lte", 5)
    .order("stock_quantity", { ascending: true })
    .limit(5);

  // 5. Recent 8 orders
  const { data: recentOrders } = await admin
    .from("orders")
    .select("id, order_number, customer_name, grand_total, status, payment_status, payment_method, created_at")
    .order("created_at", { ascending: false })
    .limit(8);

  const ranges = [
    { label: "Today", value: "today" },
    { label: "7 Days", value: "7d" },
    { label: "30 Days", value: "30d" },
    { label: "This Month", value: "month" },
    { label: "All Time", value: "all" },
  ];

  return (
    <div className="space-y-4">
      {/* Top Header & Range filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time metrics and operations status</p>
        </div>

        {/* Filter pills */}
        <div className="inline-flex items-center rounded-lg bg-white border border-slate-200 p-0.5 text-xs shadow-2xs">
          {ranges.map((r) => {
            const isActive = range === r.value;
            return (
              <Link
                key={r.value}
                href={`/admin?range=${r.value}`}
                className={`px-2.5 py-1 rounded-md font-mono text-xs transition font-medium ${
                  isActive
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {r.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Gross Sales</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-slate-900">{formatCurrency(totalSales)}</p>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">Excludes cancelled orders</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Settled Revenue</span>
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-slate-900">{formatCurrency(totalCollected)}</p>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">Verified settled payments</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Total Orders</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-slate-900">{totalOrdersCount}</p>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">In selected time range</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Customers</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-slate-900">{totalCustomersCount || 0}</p>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">Profiles in database</p>
        </div>
      </div>

      {/* Secondary Status Counts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Pending Orders</p>
              <p className="text-base font-bold font-mono text-slate-900">{pendingOrdersCount}</p>
            </div>
          </div>
          <Link
            href="/admin/orders?status=pending"
            className="text-xs text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1 transition"
          >
            Review <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Processing Orders</p>
              <p className="text-base font-bold font-mono text-slate-900">{processingOrdersCount}</p>
            </div>
          </div>
          <Link
            href="/admin/orders?status=processing"
            className="text-xs text-indigo-700 hover:text-indigo-800 font-medium flex items-center gap-1 transition"
          >
            Fulfill <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Delivered Orders</p>
              <p className="text-base font-bold font-mono text-slate-900">{deliveredOrdersCount}</p>
            </div>
          </div>
          <Link
            href="/admin/orders?status=delivered"
            className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1 transition"
          >
            View <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Two columns: Recent Orders & Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent orders table */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white">
            <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-800">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 transition"
            >
              All Orders <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {!recentOrders || recentOrders.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500">
              <ShoppingBag className="w-8 h-8 text-slate-400 mx-auto mb-2 stroke-1" />
              <p className="font-semibold text-slate-800">No orders recorded</p>
              <p className="text-slate-400 mt-0.5">Orders placed by customers will appear here in real-time.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-600 uppercase text-[10px] font-mono tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Order #</th>
                    <th className="py-2.5 px-4 font-semibold">Customer</th>
                    <th className="py-2.5 px-4 font-semibold">Date</th>
                    <th className="py-2.5 px-4 font-semibold">Total</th>
                    <th className="py-2.5 px-4 font-semibold">Status</th>
                    <th className="py-2.5 px-4 font-semibold">Payment</th>
                    <th className="py-2.5 px-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                        {o.order_number}
                      </td>
                      <td className="py-2.5 px-4 text-slate-800 font-medium">
                        {o.customer_name}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">
                        {formatDate(o.created_at)}
                      </td>
                      <td className="py-2.5 px-4 font-semibold font-mono text-slate-900">
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
                          className="px-2 py-0.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[11px] transition"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-1.5 text-slate-800">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <h2 className="text-xs font-bold font-mono uppercase tracking-wider">Inventory Alerts</h2>
            </div>
            <Link
              href="/admin/products?stock=low"
              className="text-xs text-amber-700 hover:text-amber-800 font-semibold transition"
            >
              Manage
            </Link>
          </div>

          <div className="p-3.5 flex-1">
            {!lowStockProducts || lowStockProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center text-xs text-slate-500">
                <CheckCircle2 className="w-7 h-7 text-emerald-600 mb-1.5" />
                <span className="text-slate-800 font-semibold">Healthy inventory levels</span>
                <span className="text-[11px] text-slate-400 mt-0.5">All products have stock above threshold.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/60 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{p.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">SKU: {p.sku || "N/A"}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                          p.stock_quantity === 0
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-amber-100 text-amber-800 border-amber-300"
                        }`}
                      >
                        {p.stock_quantity === 0 ? "Out of Stock" : `${p.stock_quantity} left`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
