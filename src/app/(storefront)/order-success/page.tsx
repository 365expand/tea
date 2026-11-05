import Link from "next/link";
import { CheckCircle2, ShoppingBag, ArrowRight, Truck } from "lucide-react";

export const dynamic = "force-dynamic";

interface SuccessPageProps {
  searchParams: Promise<{
    num?: string;
    email?: string;
    method?: string;
  }>;
}

export default async function OrderSuccessPage({ searchParams }: SuccessPageProps) {
  const sp = (await searchParams) || {};
  const { num = "TEA-000001", email = "", method = "cod" } = sp;

  return (
    <div className="max-w-xl mx-auto px-4 py-16 sm:py-24 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
          Order Confirmed
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-serif">
          Thank you for choosing fresh tea!
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
          Your order has been received and our blending team will begin preparing your freshly packed batch shortly.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-3 max-w-sm mx-auto text-xs text-left">
        <div className="flex justify-between items-center pb-2 border-b border-stone-100">
          <span className="text-stone-500">Order Number:</span>
          <span className="font-mono font-bold text-stone-900">{num}</span>
        </div>
        <div className="flex justify-between items-center pb-2 border-b border-stone-100">
          <span className="text-stone-500">Payment:</span>
          <span className="font-bold uppercase text-stone-900">
            {method === "cod" ? "Cash on Delivery" : "Online Payment (Verified)"}
          </span>
        </div>
        {email && (
          <div className="flex justify-between items-center">
            <span className="text-stone-500">Updates Sent To:</span>
            <span className="font-medium text-stone-900 truncate max-w-[180px]">{email}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <Link
          href={`/track-order?num=${num}${email ? `&email=${encodeURIComponent(email)}` : ""}`}
          className="w-full sm:w-auto px-6 py-3 bg-brand-700 hover:bg-brand-600 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2"
        >
          <Truck className="w-4 h-4" />
          Track Order Status
        </Link>
        <Link
          href="/products"
          className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold rounded-xl border border-stone-300 transition"
        >
          Explore More Teas
        </Link>
      </div>
    </div>
  );
}

