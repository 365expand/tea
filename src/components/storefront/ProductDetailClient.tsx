"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/cart";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Star,
  Plus,
  Minus,
  Check,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Loader2,
  Flame,
  Clock,
  Droplets,
  Coffee,
  Share2,
  ZoomIn,
  X,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Info,
  SlidersHorizontal,
} from "lucide-react";

export type ProductDetailClientProps = {
  product: any;
  images: string[];
  features: { title: string; description: string }[];
  faqs: { question: string; answer: string }[];
  ingredients: { name: string; image_url?: string | null; short_description?: string | null; notes?: string | null }[];
  reviews: any[];
  relatedProducts?: any[];
};

export function ProductDetailClient({
  product,
  images,
  features,
  faqs,
  ingredients,
  reviews,
  relatedProducts = [],
}: ProductDetailClientProps) {
  const router = useRouter();
  const { addItem } = useCart();

  const [selectedImage, setSelectedImage] = useState(images[0] || product.featured_image_url || "");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"tasting" | "brewing" | "ingredients" | "faqs">("brewing");
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Steeping calculator state
  const [cups, setCups] = useState<number>(2);

  // Sticky bottom bar visibility
  const [showStickyBar, setShowStickyBar] = useState(false);
  const mainBuyRef = useRef<HTMLDivElement>(null);

  // Review submission state
  const [reviewName, setReviewName] = useState("");
  const [reviewEmail, setReviewEmail] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHeadline, setReviewHeadline] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Image zoom state
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isHoveringImage, setIsHoveringImage] = useState(false);

  const price = product.sale_price !== null && product.sale_price !== undefined
    ? Number(product.sale_price)
    : Number(product.regular_price);
  const regularPrice = Number(product.regular_price);
  const hasDiscount = product.sale_price !== null && Number(product.sale_price) < regularPrice;
  const discountPercent = hasDiscount ? Math.round(((regularPrice - price) / regularPrice) * 100) : 0;
  const isOutOfStock = product.stock_quantity <= 0;

  useEffect(() => {
    const handleScroll = () => {
      if (!mainBuyRef.current) return;
      const rect = mainBuyRef.current.getBoundingClientRect();
      // Show sticky bar once the main buy button scrolls out of view
      setShowStickyBar(rect.bottom < 80);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPos({ x, y });
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        image: product.featured_image_url || images[0],
        price,
        regularPrice,
        netQuantity: product.net_quantity,
        stockQuantity: product.stock_quantity,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2400);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        image: product.featured_image_url || images[0],
        price,
        regularPrice,
        netQuantity: product.net_quantity,
        stockQuantity: product.stock_quantity,
      },
      quantity
    );
    router.push("/checkout");
  };

  const handleShare = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          customerName: reviewName,
          customerEmail: reviewEmail,
          rating: reviewRating,
          title: reviewHeadline,
          body: reviewBody,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");

      setReviewSubmitted(true);
      setReviewName("");
      setReviewEmail("");
      setReviewHeadline("");
      setReviewBody("");
    } catch (err: any) {
      setReviewError(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "5.0";

  return (
    <div className="space-y-16 lg:space-y-24 text-stone-900">
      {/* 0. Elegant Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-stone-500 font-medium">
        <Link href="/" className="hover:text-brand-800 transition">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        {product.categories?.name ? (
          <>
            <Link href={`/category/${product.categories.slug || "tea"}`} className="hover:text-brand-800 transition">
              {product.categories.name}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          </>
        ) : null}
        <span className="text-stone-800 font-semibold truncate max-w-[200px] sm:max-w-none">
          {product.name}
        </span>
      </nav>

      {/* 1. Main Product Hero Section (Interactive Motion Gallery + Purchase Card) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
        {/* Left: Gallery (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div
            className="group relative aspect-[4/3] sm:aspect-square bg-gradient-to-br from-stone-100 to-stone-50 border border-stone-200/90 rounded-3xl overflow-hidden shadow-sm cursor-zoom-in"
            onMouseEnter={() => setIsHoveringImage(true)}
            onMouseLeave={() => setIsHoveringImage(false)}
            onMouseMove={handleMouseMove}
            onClick={() => setIsLightboxOpen(true)}
          >
            {/* Visual Badges Floating Over Image */}
            <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-white/90 backdrop-blur-md text-brand-900 border border-brand-200 shadow-xs">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Pure Pour Co. Estate Harvest
              </span>
              {hasDiscount && (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase bg-brand-800 text-amber-200 shadow-xs">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Quick Actions (Zoom / Lightbox indicator) */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare();
                }}
                className="p-2.5 rounded-full bg-white/90 hover:bg-white text-stone-700 shadow-sm transition border border-stone-200"
                title="Share link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setWishlisted(!wishlisted);
                }}
                className="p-2.5 rounded-full bg-white/90 hover:bg-white shadow-sm transition border border-stone-200"
                title="Save to Wishlist"
              >
                <Heart
                  className={`w-4 h-4 transition ${
                    wishlisted ? "fill-rose-500 text-rose-500" : "text-stone-700 hover:text-rose-500"
                  }`}
                />
              </button>
            </div>

            {/* Main Image with Framer Motion AnimatePresence crossfade */}
            <AnimatePresence mode="wait">
              {selectedImage ? (
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="w-full h-full relative"
                >
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-200 ease-out"
                    style={{
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      transform: isHoveringImage ? "scale(1.45)" : "scale(1)",
                    }}
                  />
                </motion.div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-300">
                  <ShoppingBag className="w-16 h-16" />
                </div>
              )}
            </AnimatePresence>

            {/* Subtle Zoom Hint Overlay */}
            <div className="absolute bottom-4 right-4 z-20 pointer-events-none px-3 py-1.5 rounded-full bg-stone-900/60 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition">
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Hover to inspect leaf &amp; click to expand</span>
            </div>
          </div>

          {/* Thumbnails Carousel */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none">
              {images.map((imgUrl, idx) => {
                const isSelected = selectedImage === imgUrl;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 group ${
                      isSelected
                        ? "border-brand-700 ring-2 ring-brand-200 shadow-md scale-102"
                        : "border-stone-200 opacity-70 hover:opacity-100 hover:border-stone-300"
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    {isSelected && (
                      <motion.div
                        layoutId="activeThumbRing"
                        className="absolute inset-0 border-2 border-brand-700 rounded-2xl pointer-events-none"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Product Purchase Info (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-brand-800 bg-brand-50 border border-brand-200/80 px-2.5 py-0.5 rounded-md">
                {product.categories?.name || "Single Estate Black Tea"}
              </span>
              <span className="text-xs text-stone-400 font-medium">• Fresh 2026 Batch</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight font-serif leading-tight">
              {product.name}
            </h1>

            {/* Rating summary */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(Number(averageRating))
                        ? "fill-amber-400 text-amber-400"
                        : "text-stone-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-stone-900">{averageRating} / 5.0</span>
              <a
                href="#reviews"
                className="text-xs text-stone-500 hover:text-brand-800 underline underline-offset-4 transition"
              >
                ({reviews.length} brew {reviews.length === 1 ? "review" : "reviews"})
              </a>
            </div>
          </div>

          {/* Price & Weight Card */}
          <div className="p-5 rounded-2xl bg-[#fbfaf6] border border-stone-200/90 shadow-xs space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
                  {formatCurrency(price)}
                </span>
                {hasDiscount && (
                  <span className="text-base text-stone-400 line-through font-medium">
                    {formatCurrency(regularPrice)}
                  </span>
                )}
                {hasDiscount && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs">
                    Save {formatCurrency(regularPrice - price)}
                  </span>
                )}
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-stone-700 block">
                  Net Weight
                </span>
                <span className="text-sm font-extrabold text-brand-900 font-mono">
                  {product.net_quantity || "250g"}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-stone-500 flex items-center justify-between border-t border-stone-200/60 pt-2">
              <span>Inclusive of all GST &amp; import taxes</span>
              <span className="text-brand-800 font-medium">Yields approx. 100-120 cups</span>
            </p>
          </div>

          {/* Short description */}
          {product.short_description && (
            <p className="text-sm text-stone-600 leading-relaxed font-sans">
              {product.short_description}
            </p>
          )}

          {/* Freshness & Stock Status */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isOutOfStock ? "bg-rose-400" : "bg-emerald-400"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  isOutOfStock ? "bg-rose-500" : "bg-emerald-600"
                }`}
              />
            </span>
            <div className="text-xs">
              <span className="font-bold text-stone-900 block">
                {isOutOfStock
                  ? "Sold Out for this harvest"
                  : product.stock_quantity <= 5
                  ? `Hurry, only ${product.stock_quantity} pouches left!`
                  : "Fresh Stock Available"}
              </span>
              <span className="text-stone-500 text-[11px]">
                {isOutOfStock
                  ? "Next harvest curing now — check back soon"
                  : "Hand-blended in small batches • Dispatched in 24 hrs"}
              </span>
            </div>
          </div>

          {/* Purchase Actions (Quantity + Add to Cart + Buy Now) */}
          <div ref={mainBuyRef} className="space-y-3 pt-1">
            <div className="flex items-center gap-3">
              {/* Quantity selector */}
              <div className="flex items-center border border-stone-300 rounded-xl bg-white p-1 shadow-2xs">
                <button
                  type="button"
                  disabled={quantity <= 1 || isOutOfStock}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 text-stone-600 hover:bg-stone-100 rounded-lg disabled:opacity-40 transition active:scale-95"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 text-sm font-bold text-stone-900 min-w-10 text-center font-mono">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={isOutOfStock || quantity >= product.stock_quantity}
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  className="p-2.5 text-stone-600 hover:bg-stone-100 rounded-lg disabled:opacity-40 transition active:scale-95"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3.5 px-6 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] ${
                  isOutOfStock
                    ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                    : added
                    ? "bg-emerald-700 text-white shadow-emerald-200/50"
                    : "bg-brand-50 hover:bg-brand-100 text-brand-950 border border-brand-300/80 hover:border-brand-400"
                }`}
              >
                {added ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Added to Cart!</span>
                  </motion.div>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-brand-800" />
                    <span>Add to Cart • {formatCurrency(price * quantity)}</span>
                  </>
                )}
              </button>
            </div>

            {/* Buy Now button */}
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="w-full py-4 px-6 bg-stone-900 hover:bg-brand-900 disabled:opacity-50 text-amber-100 text-xs sm:text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-center flex items-center justify-center gap-2 active:scale-[0.99] group"
            >
              <span>Buy It Now &mdash; Instant Checkout</span>
              <ArrowRight className="w-4 h-4 text-amber-300 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Brand Assurances Grid */}
          <div className="grid grid-cols-3 gap-2.5 pt-3 text-center">
            <div className="p-3 bg-white border border-stone-200/90 rounded-2xl shadow-2xs">
              <Truck className="w-5 h-5 text-brand-700 mx-auto mb-1.5" />
              <span className="text-[11px] font-bold text-stone-900 block">Free Shipping</span>
              <span className="text-[10px] text-stone-500">On all orders ₹999+</span>
            </div>
            <div className="p-3 bg-white border border-stone-200/90 rounded-2xl shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-brand-700 mx-auto mb-1.5" />
              <span className="text-[11px] font-bold text-stone-900 block">100% Unadulterated</span>
              <span className="text-[10px] text-stone-500">Direct garden source</span>
            </div>
            <div className="p-3 bg-white border border-stone-200/90 rounded-2xl shadow-2xs">
              <RotateCcw className="w-5 h-5 text-brand-700 mx-auto mb-1.5" />
              <span className="text-[11px] font-bold text-stone-900 block">Fresh Seal</span>
              <span className="text-[10px] text-stone-500">Resealable foil pouch</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Feature Highlights / Tasting Radar */}
      {features.length > 0 && (
        <section className="bg-gradient-to-br from-[#f8f7f2] to-white border border-stone-200 rounded-3xl p-6 sm:p-10 shadow-xs">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-700 block mb-1">
              Tea Master Attributes
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900">
              Harvest &amp; Flavor Profile
            </h2>
            <p className="text-xs text-stone-600 mt-1">
              Curated specifications verified for this specific batch of Pure Pour Co. tea.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -2 }}
                className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-1.5 transition-all"
              >
                <div className="flex items-center justify-between text-brand-700">
                  <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                    {feat.title}
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <p className="text-sm font-bold text-stone-900">{feat.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Deep-Dive Interactive Experience Tabs (Brewing Calculator, Terroir, Botanicals, FAQs) */}
      <section className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-2 border-b border-stone-200 pb-4 overflow-x-auto scrollbar-none">
          {[
            { id: "brewing", label: "Interactive Brewing Calculator", icon: Coffee },
            { id: "tasting", label: "About This Terroir", icon: Sparkles },
            ...(ingredients.length > 0 ? [{ id: "ingredients", label: "Ingredients & Botanicals", icon: Droplets }] : []),
            ...(faqs.length > 0 ? [{ id: "faqs", label: "Brewing FAQs", icon: Info }] : []),
          ].map((tab: any) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? "text-brand-950 bg-brand-50 border border-brand-200"
                    : "text-stone-500 hover:text-stone-900 hover:bg-stone-50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-brand-700" : "text-stone-400"}`} />
                <span>{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute -bottom-4 left-0 right-0 h-0.5 bg-brand-700"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Interactive Steeping Calculator */}
        {activeTab === "brewing" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#fbf9f5] border border-stone-200/90 rounded-2xl p-6">
              <div>
                <h3 className="text-base font-bold text-stone-900 font-serif">
                  Master Brewer's Chai Calculator
                </h3>
                <p className="text-xs text-stone-600 mt-1">
                  Select your desired yield to get the exact golden ratio of tea, water, and milk for authentic Kadak Chai.
                </p>
              </div>

              {/* Cup Selector Pills */}
              <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-xl p-1 shadow-2xs">
                {[1, 2, 4, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCups(num)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                      cups === num
                        ? "bg-brand-800 text-amber-100 shadow-xs"
                        : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                    }`}
                  >
                    {num} {num === 1 ? "Cup" : "Cups"}
                  </button>
                ))}
              </div>
            </div>

            {/* Calculated Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center">
                <Coffee className="w-5 h-5 text-brand-700 mx-auto mb-2" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  Tea Leaves
                </span>
                <span className="text-lg font-black text-stone-900 font-mono">
                  {(cups * 2.5).toFixed(1)}g
                </span>
                <span className="text-[11px] text-stone-500 block">
                  ~{cups} heaping tsp
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center">
                <Flame className="w-5 h-5 text-amber-600 mx-auto mb-2" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  Water &amp; Temp
                </span>
                <span className="text-lg font-black text-stone-900 font-mono">
                  {cups * 150} ml
                </span>
                <span className="text-[11px] text-stone-500 block">
                  100°C (Full boil)
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center">
                <Droplets className="w-5 h-5 text-sky-600 mx-auto mb-2" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  Whole Milk
                </span>
                <span className="text-lg font-black text-stone-900 font-mono">
                  {cups * 50} ml
                </span>
                <span className="text-[11px] text-stone-500 block">
                  Rich full cream
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center">
                <Clock className="w-5 h-5 text-brand-700 mx-auto mb-2" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  Simmer Time
                </span>
                <span className="text-lg font-black text-stone-900 font-mono">
                  3.5 mins
                </span>
                <span className="text-[11px] text-stone-500 block">
                  Double froth simmer
                </span>
              </div>
            </div>

            {/* Step-by-step Visual Recipe */}
            <div className="border border-stone-200 rounded-2xl p-5 bg-white space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                Brewing Method (The Pure Pour Ritual)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-stone-600">
                <div className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-900 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                    1
                  </span>
                  <p>
                    Bring <strong>{cups * 150}ml</strong> of fresh filtered water to a roaring 100°C boil in your chai saucepan.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-900 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                    2
                  </span>
                  <p>
                    Add <strong>{(cups * 2.5).toFixed(1)}g</strong> of Assam CTC leaves. Simmer on medium heat for 2 minutes until dark copper liquor emerges.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-900 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                    3
                  </span>
                  <p>
                    Pour <strong>{cups * 50}ml</strong> milk and sweeten to taste. Let the chai froth up to the rim twice, then strain hot.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Terroir & Story */}
        {activeTab === "tasting" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {product.description_html ? (
              <div
                className="text-sm text-stone-700 leading-relaxed prose prose-stone max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description_html }}
              />
            ) : (
              <p className="text-sm text-stone-600 leading-relaxed">
                {product.short_description || "Handpicked orthodox and CTC tea cultivated with care in the fertile plains of Assam."}
              </p>
            )}

            <div className="p-4 rounded-2xl bg-[#f8f7f2] border border-stone-200/90 text-xs text-stone-600 space-y-1">
              <strong className="text-stone-900 block font-serif text-sm">
                The Pure Pour Co. Purity Guarantee
              </strong>
              <p>
                Every pouch contains only natural tea leaves with zero artificial coloring agents, synthetic aromas, or sugar coatings. We seal immediately at the estate to retain delicate essential oils.
              </p>
            </div>
          </motion.div>
        )}

        {/* Tab 3: Ingredients & Botanicals */}
        {activeTab === "ingredients" && ingredients.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ingredients.map((ing, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3"
                >
                  {ing.image_url && (
                    <img
                      src={ing.image_url}
                      alt={ing.name}
                      className="w-14 h-14 rounded-xl object-cover border border-stone-200 flex-shrink-0"
                    />
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">{ing.name}</h4>
                    {ing.notes && (
                      <span className="text-[11px] font-mono text-brand-800 block mt-0.5">
                        {ing.notes}
                      </span>
                    )}
                    {ing.short_description && (
                      <p className="text-xs text-stone-600 mt-1 line-clamp-3">
                        {ing.short_description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tab 4: FAQs */}
        {activeTab === "faqs" && faqs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="divide-y divide-stone-100"
          >
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div key={idx} className="py-4">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left gap-4 font-bold text-sm text-stone-900 hover:text-brand-800 transition"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-brand-700" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-xs sm:text-sm text-stone-600 mt-2.5 leading-relaxed overflow-hidden"
                      >
                        {faq.answer}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        )}
      </section>

      {/* 4. Customer Brew Reviews Section */}
      <section id="reviews" className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-800 block mb-1">
              Tea Community Feedback
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif">
              Customer Brew Notes
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Verified reviews from daily chai drinkers and tea connoisseurs.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-stone-50 px-4 py-2.5 rounded-2xl border border-stone-200">
            <span className="text-3xl font-black text-stone-900 font-mono">{averageRating}</span>
            <div className="text-xs">
              <div className="flex text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.round(Number(averageRating))
                        ? "fill-amber-400 text-amber-400"
                        : "text-stone-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-stone-500 text-[11px] font-medium">
                {reviews.length} total {reviews.length === 1 ? "review" : "reviews"}
              </span>
            </div>
          </div>
        </div>

        {/* Existing approved reviews */}
        {reviews.length === 0 ? (
          <p className="text-xs text-stone-400 text-center py-8">
            Be the first tea lover to review this harvest!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-2xl bg-[#faf9f5] border border-stone-200/80 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? "fill-amber-400 text-amber-400" : "text-stone-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-stone-400 font-medium">
                    {formatDate(rev.created_at)}
                  </span>
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-stone-900">{rev.title}</h4>
                <p className="text-xs text-stone-600 leading-relaxed font-serif italic">
                  &ldquo;{rev.body}&rdquo;
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] text-stone-500 border-t border-stone-200/60">
                  <span className="font-semibold text-stone-800">{rev.customer_name}</span>
                  {rev.is_verified_purchase && (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                      <CheckCircle2 className="w-3 h-3" /> Verified Purchase
                    </span>
                  )}
                </div>
                {rev.admin_reply && (
                  <div className="mt-2 p-3 rounded-xl bg-white border border-stone-200 text-[11px] text-stone-700">
                    <strong className="text-brand-900 block font-semibold mb-0.5">
                      Pure Pour Co. Tea Master:
                    </strong>
                    {rev.admin_reply}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Review Form */}
        <div className="pt-8 border-t border-stone-200">
          <h3 className="text-sm sm:text-base font-bold text-stone-900 mb-1 font-serif">
            Leave a Brew Review
          </h3>
          <p className="text-xs text-stone-500 mb-5">
            Share how you steeped it, milk balance, sweetness, and overall aroma.
          </p>

          {reviewSubmitted ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-5 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-semibold flex items-center gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <strong className="block text-emerald-950">Thank you for your brew note!</strong>
                Your review has been submitted for moderation and will appear shortly.
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-4 max-w-xl">
              {reviewError && (
                <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-xl">
                  {reviewError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Rating *
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 focus:outline-none transition active:scale-90"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          star <= reviewRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-stone-300 hover:text-amber-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-stone-700 ml-2">
                    {reviewRating} of 5 Stars
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="e.g. Siddharth M."
                    className="w-full px-3.5 py-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Your Email (Kept confidential) *
                  </label>
                  <input
                    type="email"
                    required
                    value={reviewEmail}
                    onChange={(e) => setReviewEmail(e.target.value)}
                    placeholder="siddharth@example.com"
                    className="w-full px-3.5 py-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Headline *
                </label>
                <input
                  type="text"
                  required
                  value={reviewHeadline}
                  onChange={(e) => setReviewHeadline(e.target.value)}
                  placeholder="e.g. Malty, strong and unmatched aroma in morning milk chai"
                  className="w-full px-3.5 py-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 font-semibold bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Detailed Brew Review *
                </label>
                <textarea
                  rows={3}
                  required
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                  placeholder="Share details on liquor strength, pairing with spices, and flavor notes..."
                  className="w-full px-3.5 py-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="px-6 py-3 bg-brand-800 hover:bg-brand-900 disabled:opacity-50 text-amber-100 text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 active:scale-95"
              >
                {submittingReview && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Submit Brew Review
              </button>
            </form>
          )}
        </div>
      </section>

      {/* 5. Related Teas ("Curated Pairings & Other Harvests") */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-800 block mb-1">
                Explore The Cellar
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900">
                You May Also Savor
              </h2>
            </div>
            <Link
              href="/category/all"
              className="text-xs font-bold text-brand-800 hover:underline flex items-center gap-1"
            >
              <span>View all teas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((rel: any) => {
              const relPrice = rel.sale_price !== null ? Number(rel.sale_price) : Number(rel.regular_price);
              return (
                <Link
                  key={rel.id}
                  href={`/product/${rel.slug}`}
                  className="group bg-white border border-stone-200/90 rounded-3xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-stone-100 relative">
                    <img
                      src={rel.featured_image_url || "/images/placeholder.jpg"}
                      alt={rel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white/90 backdrop-blur-md text-stone-800 border border-stone-200">
                        {rel.net_quantity || "100g"}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-800">
                        {rel.categories?.name || "Single Estate"}
                      </span>
                      <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 mt-1 group-hover:text-brand-900 transition line-clamp-1">
                        {rel.name}
                      </h3>
                      {rel.short_description && (
                        <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                          {rel.short_description}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-sm font-extrabold text-stone-900">
                        {formatCurrency(relPrice)}
                      </span>
                      <span className="text-xs font-bold text-brand-800 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                        View Blend &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 6. Mobile Sticky Bottom Quick-Buy Bar */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 py-3 px-4 shadow-xl"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={product.featured_image_url || images[0]}
                  alt={product.name}
                  className="w-11 h-11 rounded-xl object-cover border border-stone-200 flex-shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-stone-900 truncate font-serif">
                    {product.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-extrabold text-stone-900">{formatCurrency(price)}</span>
                    <span className="text-[11px] text-stone-500">({product.net_quantity || "250g"})</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${
                    isOutOfStock
                      ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                      : added
                      ? "bg-emerald-700 text-white"
                      : "bg-brand-900 text-amber-100 hover:bg-brand-800"
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Added
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. Image Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsLightboxOpen(false)}
            className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          >
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white transition"
              aria-label="Close image modal"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedImage}
              alt={product.name}
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
