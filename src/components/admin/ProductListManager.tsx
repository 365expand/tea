"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import {
  Plus,
  Search,
  Package,
  Edit2,
  Trash2,
  Star,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";

export type ProductRow = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  featured_image_url: string | null;
  regular_price: number;
  sale_price: number | null;
  stock_quantity: number;
  low_stock_threshold: number;
  status: string;
  is_featured: boolean;
  net_quantity: string | null;
  created_at: string;
  categories?: { name: string } | { name: string }[] | null;
  subcategories?: { name: string } | { name: string }[] | null;
};

interface ProductListManagerProps {
  initialProducts: ProductRow[];
  categories: { id: string; name: string }[];
  initialStockFilter?: string;
  initialStatusFilter?: string;
}

export function ProductListManager({
  initialProducts,
  categories,
  initialStockFilter = "all",
  initialStatusFilter = "all",
}: ProductListManagerProps) {
  const router = useRouter();
  const [products, setProducts] = useState<ProductRow[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState(initialStockFilter);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const filteredProducts = products.filter((p) => {
    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      if (!matchName && !matchSku) return false;
    }
    // Status
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    // Category
    const catName = Array.isArray(p.categories) ? (p.categories[0] as any)?.name : p.categories?.name;
    if (categoryFilter !== "all" && catName !== categoryFilter) return false;
    // Stock
    if (stockFilter === "low" && p.stock_quantity > p.low_stock_threshold) return false;
    if (stockFilter === "out" && p.stock_quantity > 0) return false;
    if (stockFilter === "in" && p.stock_quantity === 0) return false;

    return true;
  });

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    setActionLoadingId(id);
    const updated = !currentFeatured;
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_featured: updated } : p))
    );

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_featured: updated }),
      });
      if (!res.ok) throw new Error("Failed to update feature status");
      router.refresh();
    } catch (err: any) {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_featured: currentFeatured } : p))
      );
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setActionLoadingId(id);
    const oldStatus = products.find((p) => p.id === id)?.status;
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      router.refresh();
    } catch (err: any) {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: oldStatus || "active" } : p))
      );
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      setProducts((prev) => prev.filter((p) => p.id !== id));
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Products &amp; Inventory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage single-origin teas, packaged blends, pricing, and live stock levels
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Product
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name, SKU..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:bg-white placeholder:text-slate-400 font-mono transition"
          />
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto font-medium text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50 text-slate-700 text-xs"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50 text-slate-700 text-xs"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50 text-slate-700 text-xs"
          >
            <option value="all">All Inventory</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock (&le; 5)</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        {filteredProducts.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            <Package className="w-8 h-8 text-slate-400 mx-auto mb-2.5 stroke-1" />
            <h3 className="text-sm font-semibold text-slate-800">No products found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Adjust your search query or filters, or create your first tea harvest product.
            </p>
            <Link
              href="/admin/products/new"
              className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-lg transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 uppercase text-[10px] font-mono tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Product</th>
                  <th className="py-2.5 px-4 font-semibold">SKU</th>
                  <th className="py-2.5 px-4 font-semibold">Category</th>
                  <th className="py-2.5 px-4 font-semibold">Price</th>
                  <th className="py-2.5 px-4 font-semibold">Stock</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                  <th className="py-2.5 px-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const isLow = p.stock_quantity <= p.low_stock_threshold && p.stock_quantity > 0;
                  const isOut = p.stock_quantity === 0;
                  const isBusy = actionLoadingId === p.id;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {p.featured_image_url ? (
                              <img
                                src={p.featured_image_url}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-900">{p.name}</span>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleToggleFeatured(p.id, p.is_featured)}
                                title={p.is_featured ? "Featured on Home (Click to remove)" : "Click to feature on Home"}
                                className="p-0.5 rounded hover:bg-slate-100 transition"
                              >
                                {p.is_featured ? (
                                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                                ) : (
                                  <Star className="w-3.5 h-3.5 text-slate-300 hover:text-amber-500" />
                                )}
                              </button>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">
                              /{p.slug} • {p.net_quantity || "Standard"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-4 font-mono text-slate-600 font-semibold">
                        {p.sku}
                      </td>

                      <td className="py-2.5 px-4 text-slate-700">
                        {Array.isArray(p.categories) ? (p.categories[0] as any)?.name : p.categories?.name || "Uncategorized"}
                        {(Array.isArray(p.subcategories) ? (p.subcategories[0] as any)?.name : p.subcategories?.name) && (
                          <span className="block text-[10px] text-slate-400 font-mono">
                            &gt; {Array.isArray(p.subcategories) ? (p.subcategories[0] as any)?.name : p.subcategories?.name}
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-4 font-mono">
                        {p.sale_price ? (
                          <div>
                            <span className="font-bold text-slate-900">
                              {formatCurrency(p.sale_price)}
                            </span>
                            <span className="block text-[10px] text-slate-400 line-through">
                              {formatCurrency(p.regular_price)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-slate-900">
                            {formatCurrency(p.regular_price)}
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium border ${
                            isOut
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : isLow
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {isOut ? (
                            "0 in stock"
                          ) : isLow ? (
                            <>
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              {p.stock_quantity} left
                            </>
                          ) : (
                            `${p.stock_quantity} in stock`
                          )}
                        </span>
                      </td>

                      <td className="py-2.5 px-4">
                        <select
                          value={p.status}
                          disabled={isBusy}
                          onChange={(e) => handleStatusChange(p.id, e.target.value)}
                          className={`text-[11px] font-mono font-medium py-0.5 px-2 rounded-full border focus:outline-none cursor-pointer transition ${
                            p.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : p.status === "draft"
                              ? "bg-slate-100 text-slate-600 border-slate-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          <option value="active">Active</option>
                          <option value="draft">Draft</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>

                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={`/product/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition"
                            title="Preview on storefront"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <Link
                            href={`/admin/products/${p.id}`}
                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition"
                            title="Edit product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                            title="Delete product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
