"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OrderStatusBadge, PaymentStatusBadge } from "./StatusBadge";
import { Search, ShoppingCart, Eye, ChevronLeft, ChevronRight } from "lucide-react";

export type OrderSummary = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  grand_total: number;
  payment_method: string;
  payment_status: string;
  status: string;
  courier_name: string | null;
  tracking_number: string | null;
  created_at: string;
  order_items?: { id: string }[];
};

export function OrderListManager({
  initialOrders,
  initialStatusFilter = "all",
}: {
  initialOrders: OrderSummary[];
  initialStatusFilter?: string;
}) {
  const [orders, setOrders] = useState<OrderSummary[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const statuses = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Processing", value: "processing" },
    { label: "Shipped", value: "shipped" },
    { label: "Delivered", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const filtered = orders.filter((o) => {
    // Status filter
    if (statusFilter !== "all" && o.status !== statusFilter) return false;

    // Payment status filter
    if (paymentFilter !== "all" && o.payment_status !== paymentFilter) return false;

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNum = o.order_number.toLowerCase().includes(q);
      const matchName = o.customer_name?.toLowerCase().includes(q);
      const matchEmail = o.customer_email?.toLowerCase().includes(q);
      const matchTracking = o.tracking_number?.toLowerCase().includes(q);
      if (!matchNum && !matchName && !matchEmail && !matchTracking) return false;
    }

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Orders</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage live orders, verify payments, and generate fulfillment documents
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs">
          <span className="text-emerald-700 font-bold">{filtered.length}</span> orders
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {statuses.map((s) => {
          const isActive = statusFilter === s.value;
          const count =
            s.value === "all"
              ? orders.length
              : orders.filter((o) => o.status === s.value).length;

          return (
            <button
              key={s.value}
              type="button"
              onClick={() => {
                setStatusFilter(s.value);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition flex items-center gap-1.5 font-medium border ${
                isActive
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold shadow-xs"
                  : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-slate-200"
              }`}
            >
              <span>{s.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? "bg-emerald-100 text-emerald-800 font-bold" : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by order # (e.g. TEA-000001), customer name, email, tracking..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:bg-white placeholder:text-slate-400 font-mono transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50 text-slate-700 font-medium"
          >
            <option value="all">All Payment Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            <ShoppingCart className="w-8 h-8 text-slate-400 mx-auto mb-2.5 stroke-1" />
            <h3 className="text-sm font-semibold text-slate-800">No orders found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No orders matched your active filter or search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 uppercase text-[10px] font-mono tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Order #</th>
                  <th className="py-2.5 px-4 font-semibold">Customer</th>
                  <th className="py-2.5 px-4 font-semibold">Date</th>
                  <th className="py-2.5 px-4 font-semibold">Grand Total</th>
                  <th className="py-2.5 px-4 font-semibold">Payment</th>
                  <th className="py-2.5 px-4 font-semibold">Fulfillment</th>
                  <th className="py-2.5 px-4 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                      {o.order_number}
                    </td>

                    <td className="py-2.5 px-4">
                      <p className="font-semibold text-slate-900">{o.customer_name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{o.customer_email}</p>
                    </td>

                    <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">
                      {formatDate(o.created_at, true)}
                    </td>

                    <td className="py-2.5 px-4">
                      <span className="font-bold font-mono text-slate-900">
                        {formatCurrency(o.grand_total)}
                      </span>
                      <span className="block text-[10px] text-slate-400 uppercase font-mono">
                        {o.payment_method}
                      </span>
                    </td>

                    <td className="py-2.5 px-4">
                      <PaymentStatusBadge status={o.payment_status} />
                    </td>

                    <td className="py-2.5 px-4">
                      <OrderStatusBadge status={o.status} />
                      {o.tracking_number && (
                        <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                          {o.courier_name || "Courier"}: {o.tracking_number}
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-4 text-right">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {filtered.length > pageSize && (
          <div className="px-4 py-2.5 border-t border-slate-200/80 bg-slate-50/80 flex items-center justify-between text-xs text-slate-600 font-mono">
            <div>
              Showing <span className="font-semibold text-slate-800">{(currentPage - 1) * pageSize + 1}</span> to{" "}
              <span className="font-semibold text-slate-800">
                {Math.min(currentPage * pageSize, filtered.length)}
              </span>{" "}
              of <span className="font-semibold text-slate-800">{filtered.length}</span> orders
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-mono text-xs flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </button>
              <span className="text-slate-500">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-mono text-xs flex items-center gap-1"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
