"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";
import {
  Mail,
  Phone,
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  Archive,
  Reply,
  Trash2,
  X,
  ExternalLink,
  Loader2,
  AlertCircle,
  Eye,
} from "lucide-react";

export interface InquiryItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: "unread" | "read" | "replied" | "archived";
  admin_notes: string | null;
  created_at: string;
  updated_at?: string;
}

export function InquiryManager({ initialInquiries }: { initialInquiries: InquiryItem[] }) {
  const [inquiries, setInquiries] = useState<InquiryItem[]>(initialInquiries);
  const [statusTab, setStatusTab] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showBanner = (type: "success" | "error", message: string) => {
    setBanner({ type, message });
    setTimeout(() => {
      setBanner((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  };

  const handleOpenDetails = async (item: InquiryItem) => {
    setSelectedInquiry(item);
    setAdminNotes(item.admin_notes || "");
    setIsDrawerOpen(true);

    // If unread, automatically mark as read
    if (item.status === "unread") {
      try {
        const res = await fetch(`/api/admin/inquiries/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "read" }),
        });
        const data = await res.json();
        if (res.ok && data.inquiry) {
          setInquiries((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, status: "read" } : i))
          );
          setSelectedInquiry((curr) => (curr ? { ...curr, status: "read" } : null));
        }
      } catch {
        // Silent failure on read mark
      }
    }
  };

  const handleUpdateStatus = async (newStatus: "unread" | "read" | "replied" | "archived") => {
    if (!selectedInquiry) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/inquiries/${selectedInquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, admin_notes: adminNotes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      setInquiries((prev) =>
        prev.map((i) => (i.id === selectedInquiry.id ? data.inquiry : i))
      );
      setSelectedInquiry(data.inquiry);
      showBanner("success", `Message status updated to "${newStatus}".`);
    } catch (err: any) {
      showBanner("error", err.message || "Failed to update status");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/inquiries/${selectedInquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_notes: adminNotes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save note");

      setInquiries((prev) =>
        prev.map((i) => (i.id === selectedInquiry.id ? data.inquiry : i))
      );
      setSelectedInquiry(data.inquiry);
      showBanner("success", "Admin notes saved.");
    } catch (err: any) {
      showBanner("error", err.message || "Failed to save note");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete the inquiry from "${name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete inquiry");

      setInquiries((prev) => prev.filter((i) => i.id !== id));
      if (selectedInquiry?.id === id) {
        setIsDrawerOpen(false);
        setSelectedInquiry(null);
      }
      showBanner("success", "Inquiry deleted.");
    } catch (err: any) {
      showBanner("error", err.message || "Failed to delete inquiry");
    }
  };

  const filtered = inquiries.filter((item) => {
    if (statusTab !== "all" && item.status !== statusTab) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q) ||
      (item.phone && item.phone.toLowerCase().includes(q)) ||
      (item.subject && item.subject.toLowerCase().includes(q)) ||
      item.message.toLowerCase().includes(q)
    );
  });

  const unreadCount = inquiries.filter((i) => i.status === "unread").length;

  const getStatusBadge = (status: InquiryItem["status"]) => {
    switch (status) {
      case "unread":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            Unread
          </span>
        );
      case "read":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Read
          </span>
        );
      case "replied":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Replied
          </span>
        );
      case "archived":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <Archive className="w-3 h-3 text-slate-500" />
            Archived
          </span>
        );
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

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center relative">
            <Mail className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight font-sans">
              Customer Inquiries &amp; Messages
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              {inquiries.length} total • {unreadCount} awaiting response
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search sender, subject, message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white w-56 transition"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
        {[
          { key: "all", label: "All Messages", count: inquiries.length },
          { key: "unread", label: "Unread", count: unreadCount },
          {
            key: "read",
            label: "Read",
            count: inquiries.filter((i) => i.status === "read").length,
          },
          {
            key: "replied",
            label: "Replied",
            count: inquiries.filter((i) => i.status === "replied").length,
          },
          {
            key: "archived",
            label: "Archived",
            count: inquiries.filter((i) => i.status === "archived").length,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusTab(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              statusTab === tab.key
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                statusTab === tab.key
                  ? "bg-emerald-200/70 text-emerald-900"
                  : "bg-slate-200/70 text-slate-600"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Messages Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-2.5 px-4 w-44">Sender</th>
                <th className="py-2.5 px-4">Subject &amp; Message Preview</th>
                <th className="py-2.5 px-4 w-32">Date</th>
                <th className="py-2.5 px-3 w-28 text-center">Status</th>
                <th className="py-2.5 px-4 w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                    {search ? `No inquiries match "${search}"` : "No inquiries in this tab."}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => handleOpenDetails(item)}
                    className={`hover:bg-slate-50/70 transition cursor-pointer group ${
                      item.status === "unread" ? "bg-emerald-50/30 font-medium" : ""
                    }`}
                  >
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900 text-xs">{item.name}</p>
                      <p className="text-slate-500 font-mono text-[11px] truncate max-w-[160px]">
                        {item.email}
                      </p>
                      {item.phone && (
                        <p className="text-slate-400 font-mono text-[10px] mt-0.5">{item.phone}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 space-y-0.5">
                      <p className="font-semibold text-slate-900 text-xs line-clamp-1">
                        {item.subject || "General Inquiry"}
                      </p>
                      <p className="text-slate-500 text-xs line-clamp-1 max-w-xl">
                        {item.message}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {getStatusBadge(item.status)}
                    </td>
                    <td
                      className="py-3 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenDetails(item)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition"
                          title="View message"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                          title="Delete message"
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

      {/* Right-to-Left Slide-over Drawer for Inquiry Detail */}
      {isDrawerOpen && selectedInquiry && (
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
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 font-sans tracking-tight">
                    Inquiry Details
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Received {formatDate(selectedInquiry.created_at)}
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
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Customer Info Card */}
              <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{selectedInquiry.name}</span>
                  {getStatusBadge(selectedInquiry.status)}
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <a
                      href={`mailto:${selectedInquiry.email}`}
                      className="font-mono text-emerald-700 hover:underline"
                    >
                      {selectedInquiry.email}
                    </a>
                  </div>
                  {selectedInquiry.phone && (
                    <div className="flex items-center gap-2 text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <a
                        href={`tel:${selectedInquiry.phone}`}
                        className="font-mono text-slate-800 hover:underline"
                      >
                        {selectedInquiry.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                  Topic / Subject
                </span>
                <p className="text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-lg p-2.5">
                  {selectedInquiry.subject || "General Inquiry"}
                </p>
              </div>

              {/* Message Content */}
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                  Customer Message
                </span>
                <div className="text-xs text-slate-800 bg-white border border-slate-200 rounded-lg p-3.5 leading-relaxed whitespace-pre-wrap select-text">
                  {selectedInquiry.message}
                </div>
              </div>

              {/* Status Update Actions */}
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Update Inquiry Status
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus("replied")}
                    disabled={submitting || selectedInquiry.status === "replied"}
                    className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold transition disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Replied</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus("read")}
                    disabled={submitting || selectedInquiry.status === "read"}
                    className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-lg text-xs font-semibold transition disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>Mark Read</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus("archived")}
                    disabled={submitting || selectedInquiry.status === "archived"}
                    className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    <Archive className="w-3 h-3 text-slate-500" />
                    <span>Archive</span>
                  </button>
                </div>
              </div>

              {/* Internal Admin Notes */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Internal Admin Notes
                  </span>
                  <button
                    onClick={handleSaveNotes}
                    disabled={submitting}
                    className="text-[11px] font-semibold text-emerald-700 hover:underline disabled:opacity-50"
                  >
                    Save Note
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Private internal notes regarding customer phone call, order status, or wholesale quote..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/75 flex items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleDelete(selectedInquiry.id, selectedInquiry.name)}
                className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedInquiry.email}?subject=${encodeURIComponent(
                    `Re: ${selectedInquiry.subject || "Your Inquiry at Pure Pour Co."}`
                  )}&body=${encodeURIComponent(
                    `Dear ${selectedInquiry.name},\n\nThank you for reaching out to Pure Pour Co.\n\nRegarding your inquiry:\n"${selectedInquiry.message}"\n\n`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleUpdateStatus("replied")}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                >
                  <Reply className="w-3.5 h-3.5" />
                  <span>Reply via Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

