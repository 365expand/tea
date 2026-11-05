"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Users, Search, Eye, ChevronLeft, ChevronRight } from "lucide-react";

export type CustomerRow = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  total_orders: number;
  total_spent: number;
  created_at: string;
};

export function CustomerList({
  initialCustomers,
}: {
  initialCustomers: CustomerRow[];
}) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const filtered = initialCustomers.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.email.toLowerCase().includes(q) ||
      (c.full_name && c.full_name.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q))
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Customers</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered buyers, address profiles, and lifetime purchasing history
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs">
          <span className="text-emerald-700 font-bold">{initialCustomers.length}</span> total profiles
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by customer name, email address, phone..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:bg-white placeholder:text-slate-400 font-mono transition"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            <Users className="w-8 h-8 text-slate-400 mx-auto mb-2.5 stroke-1" />
            <h3 className="text-sm font-semibold text-slate-800">No customers found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Customer profiles are automatically created when users register or checkout on the storefront.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 uppercase text-[10px] font-mono tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Customer</th>
                  <th className="py-2.5 px-4 font-semibold">Contact</th>
                  <th className="py-2.5 px-4 font-semibold">Registered</th>
                  <th className="py-2.5 px-4 font-semibold">Orders</th>
                  <th className="py-2.5 px-4 font-semibold">Lifetime Spent</th>
                  <th className="py-2.5 px-4 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center justify-center text-xs font-mono shrink-0">
                          {(c.full_name || c.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {c.full_name || "Guest / Anonymous"}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">{c.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-4 text-slate-600 font-mono text-xs">
                      {c.phone || "—"}
                    </td>

                    <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">
                      {formatDate(c.created_at)}
                    </td>

                    <td className="py-2.5 px-4">
                      <span className="font-semibold font-mono text-slate-800">{c.total_orders}</span>
                    </td>

                    <td className="py-2.5 px-4 font-bold font-mono text-slate-900">
                      {formatCurrency(c.total_spent)}
                    </td>

                    <td className="py-2.5 px-4 text-right">
                      <Link
                        href={`/admin/customers/${c.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filtered.length > pageSize && (
          <div className="px-4 py-2.5 border-t border-slate-200/80 bg-slate-50/80 flex items-center justify-between text-xs text-slate-600 font-mono">
            <div>
              Showing <span className="font-semibold text-slate-800">{(currentPage - 1) * pageSize + 1}</span> to{" "}
              <span className="font-semibold text-slate-800">
                {Math.min(currentPage * pageSize, filtered.length)}
              </span>{" "}
              of <span className="font-semibold text-slate-800">{filtered.length}</span> customers
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
