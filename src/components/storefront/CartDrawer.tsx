"use client";

import { useCart } from "@/lib/cart";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Truck } from "lucide-react";

export function CartDrawer({ freeShippingThreshold = 999 }: { freeShippingThreshold?: number }) {
  const { items, updateQuantity, removeItem, subtotal, isDrawerOpen, setIsDrawerOpen } = useCart();

  if (!isDrawerOpen) return null;

  const progress = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-brand-700" />
              <h2 className="text-sm font-bold text-stone-900 tracking-tight">Your Cart</h2>
              <span className="text-xs text-stone-500 font-medium">({items.length} items)</span>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free shipping threshold progress bar */}
          <div className="bg-stone-50 p-3.5 border-b border-stone-200 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-stone-800 mb-1.5">
              <Truck className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
              {remainingForFreeShipping > 0 ? (
                <span>
                  Add <strong>{formatCurrency(remainingForFreeShipping)}</strong> more for{" "}
                  <strong className="text-emerald-700">FREE delivery</strong>!
                </span>
              ) : (
                <span className="text-emerald-700 font-bold">
                  You have unlocked FREE shipping across India!
                </span>
              )}
            </div>
            <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Cart items list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-stone-800">Your cart is empty</h3>
                <p className="text-xs text-stone-400 mt-1 max-w-xs">
                  Discover single-origin teas, spiced chai blends and fresh harvests.
                </p>
                <Link
                  href="/products"
                  onClick={() => setIsDrawerOpen(false)}
                  className="mt-4 px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-lg shadow-xs"
                >
                  Browse Teas
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-3 pb-4 border-b border-stone-100 text-xs"
                >
                  <div className="w-16 h-16 rounded-lg bg-stone-100 border border-stone-200 overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={() => setIsDrawerOpen(false)}
                      className="font-bold text-stone-900 hover:text-brand-700 truncate block"
                    >
                      {item.name}
                    </Link>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      {item.netQuantity || "Pack"} • {formatCurrency(item.price)}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-stone-200 rounded-md bg-stone-50">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-1 hover:bg-stone-200 text-stone-600 transition rounded-l"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-1 hover:bg-stone-200 text-stone-600 transition rounded-r"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="p-1 text-stone-400 hover:text-red-600 rounded"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-stone-200 bg-stone-50 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600">Subtotal</span>
                <span className="font-bold text-sm text-stone-900">{formatCurrency(subtotal)}</span>
              </div>
              <p className="text-[11px] text-stone-400">
                Taxes and shipping calculated at checkout
              </p>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/cart"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full py-2.5 px-3 bg-white hover:bg-stone-100 text-stone-800 text-xs font-bold rounded-lg border border-stone-300 text-center transition"
                >
                  View Full Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full py-2.5 px-3 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-lg text-center flex items-center justify-center gap-1 shadow-sm transition"
                >
                  Checkout
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

