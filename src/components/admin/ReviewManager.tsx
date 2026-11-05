"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ReviewStatusBadge } from "./StatusBadge";
import { formatDate } from "@/lib/utils";
import {
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  MessageSquare,
  Sparkles,
  Plus,
  Loader2,
  X,
  Reply,
  ShieldCheck,
} from "lucide-react";

export type ReviewItem = {
  id: string;
  product_id: string;
  customer_name: string;
  customer_email: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  images: any;
  status: "pending" | "approved" | "rejected";
  is_featured: boolean;
  is_verified_purchase: boolean;
  admin_reply: string | null;
  created_at: string;
  products?: { id: string; name: string; slug: string } | null;
};

export function ReviewManager({
  initialReviews,
  products,
}: {
  initialReviews: ReviewItem[];
  products: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [statusFilter, setStatusFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");

  // Manual review drawer
  const [isReviewDrawerOpen, setIsReviewDrawerOpen] = useState(false);
  const [selectedProdId, setSelectedProdId] = useState(products[0]?.id || "");
  const [custName, setCustName] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [reviewStatus, setReviewStatus] = useState<"approved" | "pending">("approved");
  const [isFeatured, setIsFeatured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Admin reply drawer
  const [replyingReview, setReplyingReview] = useState<ReviewItem | null>(null);
  const [replyText, setReplyText] = useState("");

  const filteredReviews = reviews.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (productFilter !== "all" && r.product_id !== productFilter) return false;
    return true;
  });

  const updateReview = async (id: string, updates: Partial<ReviewItem>) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update review");

      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
      );
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;

    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete review");

      setReviews((prev) => prev.filter((r) => r.id !== id));
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingReview) return;

    await updateReview(replyingReview.id, { admin_reply: replyText });
    setReplyingReview(null);
  };

  const handleCreateManualReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !reviewBody.trim()) {
      setError("Please fill in reviewer name and review text");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: selectedProdId,
          customer_name: custName,
          customer_email: custEmail || null,
          rating,
          title: reviewTitle || null,
          body: reviewBody,
          status: reviewStatus,
          is_featured: isFeatured,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save review");

      setReviews((prev) => [data.review, ...prev]);
      setIsReviewDrawerOpen(false);
      setCustName("");
      setCustEmail("");
      setReviewTitle("");
      setReviewBody("");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Customer Reviews</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Moderate incoming tea reviews, feature tasting feedback, and publish verified replies
          </p>
        </div>

        <button
          onClick={() => {
            setError(null);
            setIsReviewDrawerOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Review
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs">
          <label className="text-slate-500 font-medium">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50 text-slate-800 text-xs"
          >
            <option value="all">All ({reviews.length})</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <label className="text-slate-500 font-medium">Product:</label>
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="px-2.5 py-1 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-slate-50 text-slate-800 text-xs"
          >
            <option value="all">All Teas</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {filteredReviews.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-xl p-10 text-center text-slate-500 shadow-xs">
            <MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-2.5 stroke-1" />
            <h3 className="text-sm font-semibold text-slate-800">No reviews found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Reviews submitted by buyers on product pages will appear here for moderation.
            </p>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-2.5 hover:border-slate-300 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {/* Stars */}
                  <div className="flex items-center text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                        }`}
                      />
                    ))}
                  </div>

                  <span className="text-xs font-semibold text-slate-900">
                    {rev.title || "Untitled Review"}
                  </span>

                  <ReviewStatusBadge status={rev.status} />

                  {rev.is_verified_purchase && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                  )}

                  {rev.is_featured && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Featured
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 font-mono">
                  {formatDate(rev.created_at, true)}
                </div>
              </div>

              {/* Body */}
              <p className="text-xs text-slate-700 leading-relaxed">{rev.body}</p>

              {/* Product and author info */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2 text-slate-500">
                  <span>
                    By <strong className="text-slate-800">{rev.customer_name}</strong>
                    {rev.customer_email && ` (${rev.customer_email})`}
                  </span>
                  <span>•</span>
                  <span>
                    Product:{" "}
                    <strong className="text-emerald-700 font-medium">
                      {rev.products?.name || "Tea Product"}
                    </strong>
                  </span>
                </div>

                {/* Moderation Actions */}
                <div className="flex items-center gap-1.5 text-xs">
                  {rev.status !== "approved" && (
                    <button
                      type="button"
                      onClick={() => updateReview(rev.id, { status: "approved" })}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition font-medium"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approve
                    </button>
                  )}

                  {rev.status !== "rejected" && (
                    <button
                      type="button"
                      onClick={() => updateReview(rev.id, { status: "rejected" })}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition font-medium"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => updateReview(rev.id, { is_featured: !rev.is_featured })}
                    className={`px-2 py-0.5 rounded-md border text-xs font-medium transition ${
                      rev.is_featured
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900"
                    }`}
                  >
                    {rev.is_featured ? "Unfeature" : "Feature"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setReplyingReview(rev);
                      setReplyText(rev.admin_reply || "");
                    }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-md transition font-medium"
                  >
                    <Reply className="w-3.5 h-3.5 text-slate-500" />
                    Reply
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteReview(rev.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                    title="Delete review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Admin reply display */}
              {rev.admin_reply && (
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-0.5">
                  <span className="font-semibold text-emerald-800 block text-[11px]">Store Owner Reply:</span>
                  <p>{rev.admin_reply}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Reply Slide-over Drawer (Right to Left) */}
      {replyingReview && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setReplyingReview(null)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out animate-in slide-in-from-right">
            <div className="px-5 py-3.5 border-b border-slate-200/80 bg-slate-50/75 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Reply to Review</h2>
                <p className="text-xs text-slate-500">Publish verified merchant response</p>
              </div>
              <button
                type="button"
                onClick={() => setReplyingReview(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveReply} className="flex-1 flex flex-col overflow-hidden text-xs">
              <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
                <div>
                  <p className="text-xs text-slate-500 mb-1.5 font-medium">
                    Review by <strong>{replyingReview.customer_name}</strong>:
                  </p>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 italic">
                    &ldquo;{replyingReview.body}&rdquo;
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Store Reply
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Thank you for your feedback! We are glad you enjoyed our first flush tea..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/75 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setReplyingReview(null)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
                >
                  Publish Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Review Slide-over Drawer (Right to Left) */}
      {isReviewDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsReviewDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out animate-in slide-in-from-right">
            <div className="px-5 py-3.5 border-b border-slate-200/80 bg-slate-50/75 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Add Customer Review</h2>
                <p className="text-xs text-slate-500">Record customer feedback manually</p>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateManualReview} className="flex-1 flex flex-col overflow-hidden text-xs">
              <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
                {error && (
                  <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-mono">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tea Product *
                  </label>
                  <select
                    value={selectedProdId}
                    onChange={(e) => setSelectedProdId(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      placeholder="e.g. S. Sen"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={custEmail}
                      onChange={(e) => setCustEmail(e.target.value)}
                      placeholder="customer@domain.com"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Star Rating (1-5) *
                    </label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(parseInt(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                      <option value={3}>⭐⭐⭐ (3 Stars)</option>
                      <option value={2}>⭐⭐ (2 Stars)</option>
                      <option value={1}>⭐ (1 Star)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Status *
                    </label>
                    <select
                      value={reviewStatus}
                      onChange={(e) => setReviewStatus(e.target.value as any)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                    >
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Review Headline
                  </label>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="e.g. Bold liquor and muscatel notes!"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Review Content *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={reviewBody}
                    onChange={(e) => setReviewBody(e.target.value)}
                    placeholder="Share details of the steep, aroma, and tasting notes..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    Feature prominently on Home / Landing page
                  </label>
                </div>
              </div>

              <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/75 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsReviewDrawerOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 disabled:opacity-50 transition shadow-xs"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
