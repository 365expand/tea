"use client";

import { useState } from "react";
import {
  HelpCircle,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  XCircle,
  X,
  Loader2,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export function FaqManager({ initialFaqs }: { initialFaqs: FaqItem[] }) {
  const [faqs, setFaqs] = useState<FaqItem[]>(initialFaqs);
  const [search, setSearch] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    display_order: "0",
    is_active: true,
  });

  const showBanner = (type: "success" | "error", message: string) => {
    setBanner({ type, message });
    setTimeout(() => {
      setBanner((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  };

  const handleOpenCreate = () => {
    setEditingFaq(null);
    setFormData({
      question: "",
      answer: "",
      display_order: String(faqs.length + 1),
      is_active: true,
    });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (item: FaqItem) => {
    setEditingFaq(item);
    setFormData({
      question: item.question,
      answer: item.answer,
      display_order: String(item.display_order ?? 0),
      is_active: item.is_active,
    });
    setIsDrawerOpen(true);
  };

  const handleToggleStatus = async (item: FaqItem) => {
    try {
      const res = await fetch(`/api/admin/faqs/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !item.is_active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update FAQ");

      setFaqs((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, is_active: !f.is_active } : f))
      );
      showBanner("success", `FAQ status updated to ${!item.is_active ? "Active" : "Inactive"}`);
    } catch (err: any) {
      showBanner("error", err.message || "Failed to toggle status");
    }
  };

  const handleDelete = async (id: string, question: string) => {
    if (!confirm(`Are you sure you want to permanently delete this FAQ?\n\n"${question}"`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete FAQ");

      setFaqs((prev) => prev.filter((f) => f.id !== id));
      showBanner("success", "FAQ deleted successfully.");
    } catch (err: any) {
      showBanner("error", err.message || "Failed to delete FAQ");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim()) {
      showBanner("error", "Please provide a question.");
      return;
    }
    if (!formData.answer.trim()) {
      showBanner("error", "Please provide an answer.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingFaq) {
        // Update existing
        const res = await fetch(`/api/admin/faqs/${editingFaq.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: formData.question.trim(),
            answer: formData.answer.trim(),
            display_order: Number(formData.display_order) || 0,
            is_active: formData.is_active,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update FAQ");

        setFaqs((prev) =>
          prev
            .map((f) => (f.id === editingFaq.id ? data.faq : f))
            .sort((a, b) => a.display_order - b.display_order)
        );
        showBanner("success", "FAQ updated successfully!");
      } else {
        // Create new
        const res = await fetch("/api/admin/faqs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: formData.question.trim(),
            answer: formData.answer.trim(),
            display_order: Number(formData.display_order) || 0,
            is_active: formData.is_active,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create FAQ");

        setFaqs((prev) =>
          [...prev, data.faq].sort((a, b) => a.display_order - b.display_order)
        );
        showBanner("success", "New FAQ added successfully!");
      }

      setIsDrawerOpen(false);
      setEditingFaq(null);
    } catch (err: any) {
      showBanner("error", err.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = faqs.filter((f) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
  });

  const activeCount = faqs.filter((f) => f.is_active).length;

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

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight font-sans">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              {faqs.length} total • {activeCount} published live to /faqs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white w-48 transition"
            />
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add FAQ</span>
          </button>
        </div>
      </div>

      {/* FAQ Table / Card List */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-2.5 px-3 w-16 text-center">Order</th>
                <th className="py-2.5 px-4">Question &amp; Answer</th>
                <th className="py-2.5 px-3 w-28 text-center">Status</th>
                <th className="py-2.5 px-4 w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 text-xs">
                    {search ? `No FAQs match "${search}"` : "No FAQs created yet."}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition group">
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-6 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px] font-bold">
                        {item.display_order}
                      </span>
                    </td>
                    <td className="py-3 px-4 space-y-1">
                      <p className="font-semibold text-slate-900 text-xs sm:text-[13px] leading-snug">
                        {item.question}
                      </p>
                      <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 max-w-3xl">
                        {item.answer}
                      </p>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition cursor-pointer border ${
                          item.is_active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                        }`}
                        title="Click to toggle live status"
                      >
                        {item.is_active ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-slate-400" />
                            <span>Hidden</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition"
                          title="Edit FAQ"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.question)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                          title="Delete FAQ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right-to-Left Slide-over Drawer for Add/Edit FAQ */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out animate-in slide-in-from-right">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-slate-200/80 bg-slate-50/75 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 font-sans tracking-tight">
                    {editingFaq ? "Edit FAQ" : "Add New FAQ"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Live dynamic answer on /faqs
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <form id="faq-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Question <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How should I store whole leaf tea?"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Detailed Answer <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Provide a clear, detailed answer for your customers..."
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Display Sequence / Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Lower numbers appear first</p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Visibility Status
                  </label>
                  <select
                    value={formData.is_active ? "true" : "false"}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.value === "true" })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                  >
                    <option value="true">Active (Published)</option>
                    <option value="false">Hidden (Draft)</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">Toggle live display on /faqs</p>
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/75 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="faq-form"
                disabled={submitting}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{editingFaq ? "Update FAQ" : "Save FAQ"}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

