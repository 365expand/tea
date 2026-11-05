"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatCurrency } from "@/lib/utils";
import {
  ShieldCheck,
  CreditCard,
  Truck,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  Tag,
  Check,
  X,
} from "lucide-react";

export type CheckoutClientProps = {
  paymentSettings: {
    razorpay_enabled: boolean;
    razorpay_key_id: string;
    cod_enabled: boolean;
    payment_mode: string;
    cod_instructions?: string;
  };
  shippingSettings: {
    default_charge: number;
    free_threshold: number;
  };
  initialUser?: {
    email: string;
    fullName?: string;
    phone?: string;
  } | null;
  savedAddresses?: any[];
  businessSettings?: any;
};

export function CheckoutClient({
  paymentSettings,
  shippingSettings,
  businessSettings,
  initialUser,
  savedAddresses = [],
}: CheckoutClientProps) {
  const router = useRouter();
  const { items, subtotal, clearCart, appliedCoupon: cartCoupon, setAppliedCoupon: setCartCoupon } = useCart();

  const [fullName, setFullName] = useState(initialUser?.fullName || "");
  const [email, setEmail] = useState(initialUser?.email || "");
  const [phone, setPhone] = useState(initialUser?.phone || "");

  const [line1, setLine1] = useState(savedAddresses[0]?.line1 || "");
  const [line2, setLine2] = useState(savedAddresses[0]?.line2 || "");
  const [city, setCity] = useState(savedAddresses[0]?.city || "");
  const [state, setState] = useState(savedAddresses[0]?.state || "");
  const [postalCode, setPostalCode] = useState(savedAddresses[0]?.postal_code || "");
  const [customerNote, setCustomerNote] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<"cod" | "razorpay">(
    paymentSettings.cod_enabled !== false ? "cod" : "razorpay"
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Test modal for mock Razorpay simulation
  const [mockModalData, setMockModalData] = useState<{
    orderId: string;
    orderNumber: string;
    amount: number;
    razorpayOrderId: string;
  } | null>(null);

  // Coupon promo code state - prefilled from cart store if applied
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    description?: string;
  } | null>(cartCoupon || null);

  useEffect(() => {
    if (cartCoupon && !appliedCoupon) {
      setAppliedCoupon(cartCoupon);
    }
  }, [cartCoupon]);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const effectiveSubtotal = Math.max(0, subtotal - discountAmount);
  const freeThreshold = Number(shippingSettings.free_threshold) || 999;
  const defaultCharge = Number(shippingSettings.default_charge) || 60;
  const shippingCharge = effectiveSubtotal >= freeThreshold || effectiveSubtotal === 0 ? 0 : defaultCharge;
  const grandTotal = effectiveSubtotal + shippingCharge;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setValidatingCoupon(true);
    setCouponError(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), subtotal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid coupon code");
      const couponObj = {
        code: data.code,
        discountAmount: data.discountAmount,
        description: data.description,
      };
      setAppliedCoupon(couponObj);
      setCartCoupon(couponObj);
      setCouponInput("");
    } catch (err: any) {
      setCouponError(err.message);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCartCoupon(null);
    setCouponError(null);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-base font-bold text-stone-900">Your cart is empty</h2>
        <p className="text-xs text-stone-500">
          Please add teas to your cart before proceeding to checkout.
        </p>
        <Link
          href="/products"
          className="inline-block px-5 py-2.5 bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs"
        >
          Browse Catalog
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Create order in DB
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: fullName,
          customerEmail: email,
          customerPhone: phone,
          shippingAddress: {
            fullName,
            phone,
            line1,
            line2,
            city,
            state,
            postalCode,
            country: "India",
          },
          billingAddress: {
            fullName,
            phone,
            line1,
            line2,
            city,
            state,
            postalCode,
            country: "India",
          },
          paymentMethod,
          items,
          customerNote,
          couponCode: appliedCoupon?.code || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Order placement failed");
      }

      const order = data.order;

      // 2. COD flow
      if (paymentMethod === "cod") {
        clearCart();
        router.push(
          `/order-success?num=${order.order_number}&email=${encodeURIComponent(email)}&method=cod`
        );
        return;
      }

      // 3. Razorpay flow
      const rzpRes = await fetch("/api/checkout/razorpay/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const rzpData = await rzpRes.json();
      if (!rzpRes.ok) throw new Error(rzpData.error || "Failed to initiate Razorpay");

      if (rzpData.isTestMock) {
        // Show test mock verification dialog
        setMockModalData({
          orderId: order.id,
          orderNumber: order.order_number,
          amount: grandTotal,
          razorpayOrderId: rzpData.razorpayOrderId,
        });
        setLoading(false);
        return;
      }

      // Live Razorpay popup using Razorpay SDK
      const loadScript = () =>
        new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });

      await loadScript();

      const options = {
        key: rzpData.keyId,
        amount: rzpData.amount,
        currency: rzpData.currency,
        name: "Pure Pour Co.",
        description: `Order ${order.order_number}`,
        order_id: rzpData.razorpayOrderId,
        prefill: {
          name: fullName,
          email,
          contact: phone,
        },
        theme: {
          color: "#467139",
        },
        handler: async (response: any) => {
          const verifyRes = await fetch("/api/checkout/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: order.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            clearCart();
            router.push(
              `/order-success?num=${order.order_number}&email=${encodeURIComponent(email)}&method=razorpay`
            );
          } else {
            alert("Payment signature verification failed. Please check with support.");
          }
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.open();
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to complete checkout");
      setLoading(false);
    }
  };

  const handleSimulateMockPayment = async () => {
    if (!mockModalData) return;
    setLoading(true);

    try {
      const res = await fetch("/api/checkout/razorpay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: mockModalData.orderId,
          razorpay_order_id: mockModalData.razorpayOrderId,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: "mock_signature_verified",
          isTestMock: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment verification failed");

      clearCart();
      router.push(
        `/order-success?num=${mockModalData.orderNumber}&email=${encodeURIComponent(email)}&method=razorpay`
      );
    } catch (err: any) {
      alert(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-serif">
          Checkout &amp; Delivery
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Review your order details and choose your preferred delivery &amp; payment method
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Contact & Address & Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer contact */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2">
              1. Customer Contact Details
            </h2>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ramesh Kumar"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh@example.com"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2">
              2. Shipping Delivery Address
            </h2>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Flat / House / Street Address *
              </label>
              <input
                type="text"
                required
                value={line1}
                onChange={(e) => setLine1(e.target.value)}
                placeholder="Flat 302, Green Valley Apartments, MG Road"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Landmark / Apartment / Area (Optional)
              </label>
              <input
                type="text"
                value={line2}
                onChange={(e) => setLine2(e.target.value)}
                placeholder="Near Central Park"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Guwahati"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">State *</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Assam"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  PIN Code *
                </label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="781001"
                  className="w-full px-3 py-2 text-xs font-mono border border-stone-300 rounded-lg focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Order Delivery Notes (Optional)
              </label>
              <input
                type="text"
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="e.g. Leave parcel at front security gate if unavailable"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2">
              3. Payment Method
            </h2>

            <div className="space-y-3">
              {paymentSettings.cod_enabled !== false && (
                <label
                  className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                    paymentMethod === "cod"
                      ? "border-brand-600 bg-brand-50/30"
                      : "border-stone-200 hover:border-stone-300 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="mt-0.5 text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <span className="font-bold text-xs text-stone-900 block">
                      Cash on Delivery (COD)
                    </span>
                    <span className="text-xs text-stone-500 block mt-0.5">
                      Pay in cash to the courier representative when your parcel is delivered.
                    </span>
                  </div>
                </label>
              )}

              {paymentSettings.razorpay_enabled && (
                <label
                  className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                    paymentMethod === "razorpay"
                      ? "border-brand-600 bg-brand-50/30"
                      : "border-stone-200 hover:border-stone-300 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={paymentMethod === "razorpay"}
                    onChange={() => setPaymentMethod("razorpay")}
                    className="mt-0.5 text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <span className="font-bold text-xs text-stone-900 flex items-center gap-2">
                      <span>Online Payment via Razorpay</span>
                      <span className="text-[10px] bg-stone-100 px-1.5 py-0.5 rounded font-mono text-stone-600">
                        UPI, Cards, NetBanking
                      </span>
                    </span>
                    <span className="text-xs text-stone-500 block mt-0.5">
                      Instant and secure checkout via PhonePe, Google Pay, Cards or NetBanking.
                    </span>
                  </div>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Order Summary & Place button */}
        <div className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4 sticky top-20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 border-b border-stone-100 pb-3">
              Order Items ({items.length})
            </h3>

            {/* Items list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="font-bold text-stone-700 min-w-4 text-center">
                      {item.quantity}x
                    </span>
                    <span className="text-stone-800 font-medium truncate">{item.name}</span>
                  </div>
                  <span className="font-bold text-stone-900 whitespace-nowrap">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Promo / Coupon Code Section */}
            <div className="border-t border-stone-200 pt-3">
              {appliedCoupon ? (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <div>
                      <span className="font-mono font-bold text-xs text-emerald-950 block">
                        {appliedCoupon.code}
                      </span>
                      <span className="text-[11px] text-emerald-700">
                        {appliedCoupon.description || `Discount of ${formatCurrency(appliedCoupon.discountAmount)} applied!`}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="p-1 rounded-md text-emerald-700 hover:text-rose-600 hover:bg-emerald-100/60 transition"
                    title="Remove coupon"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Coupon: WELCOME10, PUREPOUR50"
                        className="w-full pl-8 pr-3 py-2 text-xs uppercase font-mono border border-stone-300 rounded-lg focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={validatingCoupon || !couponInput.trim()}
                      onClick={handleApplyCoupon}
                      className="px-3.5 py-2 bg-stone-900 hover:bg-brand-900 disabled:opacity-40 text-amber-100 text-xs font-bold rounded-lg transition"
                    >
                      {validatingCoupon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Apply"}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-rose-600 font-medium">{couponError}</p>
                  )}
                </div>
              )}
            </div>

            {/* Financial breakdown */}
            <div className="border-t border-stone-200 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-900">{formatCurrency(subtotal)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Coupon Discount ({appliedCoupon.code})
                  </span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-600">
                <span>Shipping Fee</span>
                <span className="font-semibold text-stone-900">
                  {shippingCharge === 0 ? (
                    <span className="text-emerald-700">FREE</span>
                  ) : (
                    formatCurrency(shippingCharge)
                  )}
                </span>
              </div>
              {businessSettings?.tax_enabled !== false ? (
                <div className="flex justify-between text-stone-600">
                  <span>GST (Tax)</span>
                  <span className="text-stone-500">Included in prices</span>
                </div>
              ) : null}
              <div className="flex justify-between text-base font-extrabold text-stone-900 pt-3 border-t border-stone-200">
                <span>Grand Total</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 bg-brand-700 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Place Order ({formatCurrency(grandTotal)})
                </>
              )}
            </button>

            <p className="text-[11px] text-stone-400 text-center">
              By placing your order you agree to our Terms &amp; Conditions and Refund Policy.
            </p>
          </div>
        </div>
      </form>

      {/* Mock Razorpay Test Modal */}
      {mockModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center mx-auto">
              <CreditCard className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-stone-900">Razorpay Test Gateway</h3>
              <p className="text-xs text-stone-500 mt-1">
                Order <span className="font-mono font-bold">{mockModalData.orderNumber}</span>
              </p>
              <p className="text-lg font-extrabold text-stone-900 mt-2">
                {formatCurrency(mockModalData.amount)}
              </p>
            </div>

            <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-600 text-left space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase">Test Mode:</span>
              <p>Simulating Razorpay UPI / Card payment verification server-side.</p>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleSimulateMockPayment}
              className="w-full py-3 bg-brand-700 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Complete Test Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

