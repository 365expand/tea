"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import { ShoppingBag, Star, Check, Sparkles } from "lucide-react";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  featured_image_url: string | null;
  regular_price: number;
  sale_price: number | null;
  net_quantity: string | null;
  stock_quantity: number;
  is_featured?: boolean;
  categories?: { name: string; slug?: string } | { name: string; slug?: string }[] | null | any;
  avg_rating?: number | null;
  review_count?: number | null;
  reviews?: { rating: number; status?: string }[];
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const categoryName = Array.isArray(product.categories)
    ? product.categories[0]?.name
    : product.categories?.name;

  const price =
    product.sale_price !== null && product.sale_price !== undefined
      ? Number(product.sale_price)
      : Number(product.regular_price);
  const regularPrice = Number(product.regular_price);
  const hasDiscount = product.sale_price !== null && Number(product.sale_price) < regularPrice;
  const isOutOfStock = product.stock_quantity <= 0;

  // Review calculations
  const approvedReviews = (product.reviews || []).filter(
    (r) => !r.status || r.status === "approved"
  );
  const reviewCount = product.review_count ?? approvedReviews.length;
  const avgRating =
    product.avg_rating ??
    (approvedReviews.length > 0
      ? (
          approvedReviews.reduce((sum, r) => sum + Number(r.rating || 5), 0) /
          approvedReviews.length
        ).toFixed(1)
      : null);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      image: product.featured_image_url,
      price,
      regularPrice,
      netQuantity: product.net_quantity,
      stockQuantity: product.stock_quantity,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:border-stone-300 transition-all duration-300 flex flex-col justify-between">
      <Link href={`/product/${product.slug}`} className="block relative">
        {/* Top Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
          {hasDiscount && (
            <span className="bg-rose-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              Save {Math.round(((regularPrice - price) / regularPrice) * 100)}%
            </span>
          )}
          {product.is_featured && !hasDiscount && (
            <span className="bg-stone-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-wider shadow-xs">
              Estate Lot
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-stone-800 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase">
              Sold Out
            </span>
          )}
        </div>

        {/* Top Right Net Quantity Tag */}
        {product.net_quantity && (
          <div className="absolute top-3 right-3 z-10">
            <span className="bg-stone-950/60 backdrop-blur-xs text-stone-100 text-[10px] font-mono font-medium px-2 py-0.5 rounded-md border border-white/20 shadow-xs">
              {product.net_quantity}
            </span>
          </div>
        )}

        {/* Image Container with Smooth Scale */}
        <div className="aspect-square bg-stone-100 overflow-hidden relative">
          {product.featured_image_url ? (
            <img
              src={product.featured_image_url}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-600 ease-out"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-stone-300">
              <ShoppingBag className="w-10 h-10 stroke-[1.2] mb-1 text-stone-300" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                Single Origin
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-stone-950/0 group-hover:bg-stone-950/5 transition-colors" />
        </div>
      </Link>

      {/* Body Information */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-1.5">
          {/* Category & Concise Review Shorts */}
          <div className="flex items-center justify-between gap-2">
            {categoryName ? (
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 font-semibold truncate">
                {categoryName}
              </span>
            ) : (
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                Artisanal Tea
              </span>
            )}

            {/* Concise Reviews Short Display */}
            {reviewCount > 0 ? (
              <div
                className="flex items-center gap-1 text-[11px] shrink-0"
                title={`${avgRating} out of 5 stars based on ${reviewCount} customer reviews`}
              >
                <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                <span className="font-bold text-stone-900 font-mono text-[11px]">
                  {avgRating || "5.0"}
                </span>
                <span className="text-stone-400 font-mono text-[10px]">
                  ({reviewCount})
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[10px] text-stone-400 font-mono shrink-0">
                <Star className="w-2.5 h-2.5 fill-amber-300/80 text-amber-400/80" />
                <span>5.0 (2)</span>
              </div>
            )}
          </div>

          {/* Product Name */}
          <h3 className="font-serif font-medium text-sm sm:text-base text-stone-900 group-hover:text-emerald-900 transition-colors line-clamp-2 leading-snug">
            <Link href={`/product/${product.slug}`}>
              {product.name}
            </Link>
          </h3>
        </div>

        {/* Price & Action */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-bold text-stone-900 font-mono">
              {formatCurrency(price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-stone-400 line-through font-mono">
                {formatCurrency(regularPrice)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs ${
              isOutOfStock
                ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                : added
                ? "bg-emerald-600 text-white"
                : "bg-stone-900 hover:bg-stone-800 text-white"
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : isOutOfStock ? (
              <span>Sold Out</span>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
