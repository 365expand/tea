"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Percent,
  ReceiptIndianRupee,
  X,
  Loader2,
} from "lucide-react";

export interface CouponItem {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

export function CouponManager({ initialCoupons }: { initialCoupons: CouponItem[] }) {
  const [coupons, setCoupons] = useState<CouponItem[]>(initialCoupons);
  const [search, setSearch] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showBanner = (type: "success" | "error", message: string) => {
    setBanner({ type, message });
    setTimeout(() => {
      setBanner((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  };

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: "",
    min_order_amount: "0",
    max_discount_amount: "",
    usage_limit: "",
    end_date: "",
  });

  const filtered = coupons.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return c.code.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q));
  });

  const handleToggleStatus = async (coupon: CouponItem) => {
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !coupon.is_active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update coupon");

      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, is_active: !c.is_active } : c))
      );
      showBanner("success", `Coupon ${coupon.code} is now ${!coupon.is_active ? "Active" : "Inactive"}`);
    } catch (err: any) {
      showBanner("error", err.message || "Failed to toggle status");
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to permanently delete coupon "${code}"?`)) return;

    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete coupon");

      setCoupons((prev) => prev.filter((c) => c.id !== id));
      showBanner("success", `Coupon "${code}" deleted.`);
    } catch (err: any) {
      showBanner("error", err.message || "Failed to delete coupon");
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      showBanner("error", "Please provide a promo code name.");
      return;
    }
    const val = Number(formData.discount_value);
    if (isNaN(val) || val <= 0) {
      showBanner("error", "Discount value must be greater than 0.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.code,
          description: formData.description,
          discount_type: formData.discount_type,
          discount_value: val,
          min_order_amount: Number(formData.min_order_amount) || 0,
          max_discount_amount: formData.max_discount_amount ? Number(formData.max_discount_amount) : null,
          usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
          end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
          is_active: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create coupon");

      setCoupons((prev) => [data.coupon, ...prev]);
      showBanner("success", `Coupon "${data.coupon.code}" created successfully!`);
      setIsDrawerOpen(false);
      setFormData({
        code: "",
        description: "",
        discount_type: "percentage",
        discount_value: "",
        min_order_amount: "0",
        max_discount_amount: "",
        usage_limit: "",
        end_date: "",
      });
    } catch (err: any) {
      showBanner("error", err.message || "Failed to create coupon");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Banner */}
      {banner && (
        <div
          className={`p-3 rounded-lg text-xs font-mono font-medium flex items-center justify-between border shadow-xs transition ${
            banner.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <span>{banner.message}</span>
          <button
            onClick={() => setBanner(null)}
            className="text-slate-500 hover:text-slate-800 font-bold ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Coupons &amp; Discounts</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure promo discount codes, percentage / flat savings, limits, and expiration rules
          </p>
        </div>

        <button
          onClick={() => setIsDrawerOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Create Coupon
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code (e.g. WELCOME10) or description..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:bg-white text-slate-800 placeholder:text-slate-400 font-mono transition"
          />
        </div>
        <span className="text-xs font-mono text-slate-500">
          {coupons.length} coupon{coupons.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Coupon List Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            <Tag className="w-8 h-8 text-slate-400 mx-auto mb-2.5 stroke-1" />
            <h3 className="text-sm font-semibold text-slate-800">No coupons found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Create promotional discount coupon codes to incentivize buyers during checkout.
            </p>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-lg hover:bg-emerald-100 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Coupon
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 uppercase text-[10px] font-mono tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Coupon Code</th>
                  <th className="py-2.5 px-4 font-semibold">Discount</th>
                  <th className="py-2.5 px-4 font-semibold">Min Spend</th>
                  <th className="py-2.5 px-4 font-semibold">Usage</th>
                  <th className="py-2.5 px-4 font-semibold">Expires</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                  <th className="py-2.5 px-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => {
                  const isExpired = c.end_date && new Date(c.end_date) < new Date();
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-xs">
                            {c.code}
                          </span>
                        </div>
                        {c.description && (
                          <p className="text-[11px] text-slate-500 mt-0.5">{c.description}</p>
                        )}
                      </td>

                      <td className="py-2.5 px-4">
                        <span className="font-bold font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-xs inline-flex items-center gap-1">
                          {c.discount_type === "percentage" ? (
                            <>
                              <Percent className="w-3 h-3" />
                              {c.discount_value}% OFF
                            </>
                          ) : (
                            <>
                              <ReceiptIndianRupee className="w-3 h-3" />
                              {formatCurrency(c.discount_value)} OFF
                            </>
                          )}
                        </span>
                        {c.max_discount_amount && (
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Max: {formatCurrency(c.max_discount_amount)}
                          </p>
                        )}
                      </td>

                      <td className="py-2.5 px-4 text-slate-600 font-mono">
                        {c.min_order_amount > 0 ? formatCurrency(c.min_order_amount) : "No min"}
                      </td>

                      <td className="py-2.5 px-4">
                        <div className="text-slate-700 font-mono text-xs">
                          {c.used_count || 0} {c.usage_limit ? `/ ${c.usage_limit}` : "used"}
                        </div>
                        {c.usage_limit && (
                          <div className="w-20 bg-slate-100 rounded-full h-1 mt-1 overflow-hidden border border-slate-200">
                            <div
                              className="bg-emerald-600 h-1 rounded-full"
                              style={{
                                width: `${Math.min(100, ((c.used_count || 0) / c.usage_limit) * 100)}%`,
                              }}
                            />
                          </div>
                        )}
                      </td>

                      <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">
                        {c.end_date ? (
                          <span className={isExpired ? "text-rose-600 font-medium" : ""}>
                            {formatDate(c.end_date)}
                            {isExpired && " (Expired)"}
                          </span>
                        ) : (
                          <span className="text-slate-400">Never expires</span>
                        )}
                      </td>

                      <td className="py-2.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(c)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium border transition ${
                            c.is_active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          {c.is_active ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-slate-400" /> Inactive
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id, c.code)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                          title="Delete coupon"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Coupon Slide-over Drawer (Right to Left) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out animate-in slide-in-from-right">
            <div className="px-5 py-3.5 border-b border-slate-200/80 bg-slate-50/75 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Create New Coupon</h3>
                <p className="text-xs text-slate-500">Add a promotional discount code for customers</p>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="flex-1 flex flex-col overflow-hidden text-xs">
              <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MONSOON20"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono uppercase font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Description (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 20% off during flash harvest sale"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Discount Type *</label>
                    <select
                      value={formData.discount_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discount_type: e.target.value as "percentage" | "fixed",
                        })
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 text-xs"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {formData.discount_type === "percentage" ? "Value (%) *" : "Value (₹) *"}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder={formData.discount_type === "percentage" ? "10" : "100"}
                      value={formData.discount_value}
                      onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Min Order (₹)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={formData.min_order_amount}
                      onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Max Cap (₹)</label>
                    <input
                      type="number"
                      placeholder="Uncapped"
                      value={formData.max_discount_amount}
                      onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Usage Limit</label>
                    <input
                      type="number"
                      placeholder="Unlimited"
                      value={formData.usage_limit}
                      onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Expiration Date</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/75 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs disabled:opacity-50 transition flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {submitting ? "Creating..." : "Save Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
