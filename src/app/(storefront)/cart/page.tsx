"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatCurrency } from "@/lib/utils";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Truck,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  Tag,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, addItem, appliedCoupon, setAppliedCoupon } = useCart();
  const [validating, setValidating] = useState(false);
  const [stockIssues, setStockIssues] = useState<any[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMsg, setCouponMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const effectiveSubtotal = Math.max(0, subtotal - discountAmount);
  const freeThreshold = 999;
  const defaultShipping = 60;
  const isFreeShipping = effectiveSubtotal >= freeThreshold;
  const shippingCharge = isFreeShipping || subtotal === 0 ? 0 : defaultShipping;
  const grandTotal = effectiveSubtotal + shippingCharge;
  const progress = Math.min(100, (effectiveSubtotal / freeThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeThreshold - effectiveSubtotal);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponMsg(null);

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), subtotal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid coupon code");

      setAppliedCoupon({
        code: data.code,
        discountAmount: data.discountAmount,
        discountType: data.discountType,
        discountValue: data.discountValue,
        description: data.description,
      });
      setCouponMsg({ type: "success", text: `Coupon ${data.code} applied! Saved ₹${data.discountAmount}` });
      setCouponCode("");
    } catch (err: any) {
      setCouponMsg({ type: "error", text: err.message || "Failed to apply coupon" });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponMsg(null);
  };

  // Validate cart items live against inventory and current pricing
  useEffect(() => {
    if (items.length === 0) {
      setStockIssues([]);
      return;
    }

    const validate = async () => {
      setValidating(true);
      try {
        const res = await fetch("/api/cart/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items }),
        });
        const data = await res.json();
        if (data.updates) {
          setStockIssues(data.updates);
        }
      } catch (err) {
        console.error("Cart validation failed:", err);
      } finally {
        setValidating(false);
      }
    };

    validate();
  }, [items]);

  const hasBlockingIssues = stockIssues.some(
    (issue) => !issue.available || (issue.stockQuantity !== undefined && issue.stockQuantity <= 0)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <div>
        <Link
          href="/products"
          className="text-xs font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Continue Shopping
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-serif">
          Your Shopping Cart
        </h1>
      </div>

      {stockIssues.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <AlertCircle className="w-4 h-4 text-amber-700" />
            <span>Cart Attention Notice:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px]">
            {stockIssues.map((issue, idx) => (
              <li key={idx}>
                {issue.issue} &mdash; please adjust quantity or remove unavailable items to proceed.
              </li>
            ))}
          </ul>
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-3xl p-16 text-center max-w-md mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-base font-bold text-stone-900">Your cart is currently empty</h2>
          <p className="text-xs text-stone-400 mt-1 mb-6">
            Explore our harvest-fresh single origin teas and authentic masala chai blends.
          </p>
          <Link
            href="/products"
            className="px-6 py-2.5 bg-brand-700 hover:bg-brand-600 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            Explore Teas
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Cart Table */}
          <div className="lg:col-span-2 space-y-4">
            {/* Free shipping banner */}
            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-800">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-brand-600" />
                  {isFreeShipping ? (
                    <strong className="text-emerald-700">Congratulations! You get FREE shipping.</strong>
                  ) : (
                    <span>
                      Add <strong>{formatCurrency(remainingForFreeShipping)}</strong> more to get{" "}
                      <strong className="text-emerald-700">FREE shipping</strong>
                    </span>
                  )}
                </span>
                <span className="text-[11px] text-stone-400">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-600 transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Cart Table */}
            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Cart Items ({items.length})
                </span>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-stone-400 hover:text-red-600 transition"
                >
                  Clear Cart
                </button>
              </div>

              <div className="divide-y divide-stone-100">
                {items.map((item) => {
                  const issue = stockIssues.find((si) => si.productId === item.productId);
                  return (
                    <div
                      key={item.productId}
                      className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition ${
                        issue && !issue.available ? "bg-rose-50/50" : ""
                      }`}
                    >
                      {/* Product Thumbnail & Details */}
                      <div className="flex items-center gap-4 min-w-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 rounded-xl object-cover border border-stone-200 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-300 flex-shrink-0">
                            <ShoppingBag className="w-6 h-6" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link
                            href={`/product/${item.slug}`}
                            className="text-sm font-bold text-stone-900 hover:text-brand-700 transition font-serif line-clamp-1"
                          >
                            {item.name}
                          </Link>
                          <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5">
                            {item.netQuantity && <span>{item.netQuantity}</span>}
                            <span>•</span>
                            <span className="font-semibold text-stone-700">
                              {formatCurrency(item.price)} each
                            </span>
                          </div>
                          {issue && (
                            <span className="text-[11px] font-bold text-rose-600 mt-1 block">
                              {issue.issue}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Controls: Quantity Stepper & Line Price & Remove */}
                      <div className="flex items-center justify-between w-full sm:w-auto gap-4 self-end sm:self-center">
                        {/* Stepper */}
                        <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50">
                          <button
                            type="button"
                            disabled={item.quantity <= 1}
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="p-1.5 hover:bg-stone-200 text-stone-600 rounded-l disabled:opacity-30 transition"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-bold text-stone-900 min-w-8 text-center font-mono">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="p-1.5 hover:bg-stone-200 text-stone-600 rounded-r transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Line Total */}
                        <span className="font-extrabold text-sm text-stone-900 min-w-[70px] text-right font-mono">
                          {formatCurrency(item.price * item.quantity)}
                        </span>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="p-1.5 text-stone-400 hover:text-red-600 rounded"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right 1 Col: Summary & Checkout button */}
          <div className="space-y-4">
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 border-b border-stone-100 pb-3">
                Order Summary
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900 font-mono">{formatCurrency(subtotal)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-brand-700 bg-brand-50/70 p-2 rounded-lg border border-brand-200/60">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-brand-600" />
                      <span className="font-bold">{appliedCoupon.code}</span>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-stone-400 hover:text-rose-600 ml-1 p-0.5 rounded"
                        title="Remove coupon"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="font-bold font-mono">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-600">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-stone-900">
                    {shippingCharge === 0 ? (
                      <span className="text-emerald-700 font-bold">FREE</span>
                    ) : (
                      formatCurrency(shippingCharge)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>GST (Tax)</span>
                  <span className="text-stone-500">Included in price</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-stone-900 pt-3 border-t border-stone-200">
                  <span>Total Amount</span>
                  <span className="font-mono">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {/* Promo Code Input in Cart */}
              <div className="pt-2 border-t border-stone-100">
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Promo code (e.g. WELCOME10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="w-full pl-8 pr-2 py-1.5 text-xs font-mono uppercase border border-stone-300 rounded-lg focus:outline-none focus:border-brand-600"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-3 py-1.5 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white rounded-lg disabled:opacity-40 transition flex items-center gap-1"
                  >
                    {couponLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Apply"}
                  </button>
                </form>

                {couponMsg && (
                  <p
                    className={`text-[11px] mt-1.5 font-medium ${
                      couponMsg.type === "success" ? "text-emerald-700" : "text-rose-600"
                    }`}
                  >
                    {couponMsg.text}
                  </p>
                )}
              </div>

              {hasBlockingIssues ? (
                <button
                  type="button"
                  disabled
                  className="w-full py-3.5 px-6 bg-stone-300 text-stone-500 text-xs font-bold rounded-xl cursor-not-allowed text-center"
                >
                  Adjust Items to Checkout
                </button>
              ) : (
                <Link
                  href="/checkout"
                  className="w-full py-3.5 px-6 bg-brand-800 hover:bg-brand-900 text-amber-100 text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
