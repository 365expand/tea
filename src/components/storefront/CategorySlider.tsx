"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Leaf } from "lucide-react";
import { motion } from "framer-motion";

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  image_url?: string | null;
  description_html?: string | null;
}

interface CategorySliderProps {
  categories: CategoryData[];
}

export function CategorySlider({ categories }: CategorySliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < maxScroll - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [categories]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.clientWidth / 3;
    el.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  if (!categories || categories.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Clean Editorial Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="text-xs font-semibold tracking-widest uppercase text-stone-500 block mb-1">
            Collections
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-stone-900 tracking-tight">
            Shop by Tea Terroir
          </h2>
        </div>

        {/* Minimal Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label="Previous categories"
            className="w-10 h-10 rounded-full border border-stone-200 bg-white hover:bg-stone-50 active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-stone-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label="Next categories"
            className="w-10 h-10 rounded-full border border-stone-200 bg-white hover:bg-stone-50 active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-stone-700 transition"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel (Scrollable, ~3.5 cards visible) */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 pt-1 no-scrollbar -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((cat, idx) => {
          const cleanDesc = cat.description_html
            ? cat.description_html.replace(/<[^>]+>/g, "").trim()
            : "Handcrafted leaves and seasonal single-origin flushes.";

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.06 }}
              className="snap-start shrink-0 w-[78vw] sm:w-[45vw] md:w-[35vw] lg:w-[calc((100%-48px)/3.3)] min-w-[260px]"
            >
              <Link
                href={`/category/${cat.slug}`}
                className="group flex flex-col h-full bg-white rounded-2xl border border-stone-200/90 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Full bleed image */}
                <div className="relative aspect-[16/11] w-full overflow-hidden bg-stone-100">
                  {cat.image_url ? (
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                      <Leaf className="w-10 h-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-transparent transition-colors" />
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold font-serif text-stone-900 group-hover:text-brand-800 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="mt-1 text-xs text-stone-500 line-clamp-2 leading-relaxed font-sans">
                      {cleanDesc}
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-brand-800">
                    <span>View Collection</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}

        {/* 4th Card: View All Products (Ensures ~3.5 cards visible and easy navigation) */}
        <motion.div
          key="view-all-products"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
          className="snap-start shrink-0 w-[78vw] sm:w-[45vw] md:w-[35vw] lg:w-[calc((100%-48px)/3.3)] min-w-[260px]"
        >
          <Link
            href="/products"
            className="group flex flex-col h-full bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden hover:shadow-xl transition-all duration-300 text-white"
          >
            {/* Full bleed image */}
            <div className="relative aspect-[16/11] w-full overflow-hidden bg-stone-800">
              <img
                src="/images/categories/estate-panorama.jpg"
                alt="All Single-Origin Teas"
                className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500 brightness-90"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-stone-950/40 group-hover:bg-stone-950/20 transition-colors" />
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold font-serif text-white group-hover:text-amber-200 transition-colors">
                  All Reserve Teas
                </h3>
                <p className="mt-1 text-xs text-stone-300 line-clamp-2 leading-relaxed font-sans">
                  Explore all single-estate orthodox black, green, white, and whole-spice blends.
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-stone-800 flex items-center justify-between text-xs font-semibold text-amber-300 group-hover:text-amber-200">
                <span>View All Teas &rarr;</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
