"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Leaf, Mountain, Sparkles, Compass, ShieldCheck } from "lucide-react";

export interface SubcategoryItem {
  id: string;
  name: string;
  slug: string;
  description_html?: string | null;
  display_order: number;
  is_active?: boolean;
}

export interface ProductRelationItem {
  id: string;
  status?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description_html?: string | null;
  image_url?: string | null;
  display_order: number;
  is_active: boolean;
  subcategories?: SubcategoryItem[];
  products?: ProductRelationItem[];
}

export function CategoriesClient({
  categories,
  tagline,
}: {
  categories: CategoryItem[];
  tagline?: string;
}) {
  return (
    <div className="bg-stone-50 min-h-screen py-16 sm:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">
        {/* Clean, Simple Editorial Header (No Tab Pills) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl space-y-3"
        >
          <p className="text-xs font-semibold tracking-widest text-emerald-800 uppercase">
            Pure Pour Co. &bull; Harvest Compendium
          </p>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif text-stone-900 tracking-tight leading-tight">
            Artisanal Tea Collections
          </h1>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-2xl pt-1">
            {tagline ||
              "Explore single-origin flushes, handcrafted masala chais, and rare whole-leaf botanicals honestly sourced from certified mountain estates."}
          </p>
        </motion.div>

        {/* Categories Grid (Pure DB Driven with Smooth Motion) */}
        {categories.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-16 text-center space-y-3">
            <p className="text-sm text-stone-600">No active categories found in the database.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {categories.map((cat, idx) => {
              // Real DB product count
              const activeProducts = (cat.products || []).filter(
                (p) => !p.status || p.status === "active"
              );
              const productCount = activeProducts.length;

              // Real DB subcategories sorted by display_order
              const activeSubcategories = (cat.subcategories || [])
                .filter((s) => s.is_active !== false)
                .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

              return (
                <motion.article
                  key={cat.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    duration: 0.6,
                    delay: idx * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="group bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Category Image from DB with Smooth Hover Scale */}
                    <div className="relative aspect-[4/3] w-full bg-stone-100 overflow-hidden">
                      {cat.image_url ? (
                        <img
                          src={cat.image_url}
                          alt={cat.name}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                          loading={idx === 0 ? "eager" : "lazy"}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 bg-stone-100">
                          <Leaf className="w-10 h-10 stroke-[1.2] text-stone-300 mb-2" />
                          <span className="text-xs font-mono">{cat.name}</span>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/45 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />

                      {/* Live DB Product Count Badge */}
                      <div className="absolute top-3.5 right-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-medium backdrop-blur-md bg-stone-950/65 text-stone-100 border border-white/20 shadow-xs">
                          {productCount} {productCount === 1 ? "Product" : "Products"}
                        </span>
                      </div>
                    </div>

                    {/* Category Details from DB */}
                    <div className="p-6 sm:p-7 space-y-4">
                      <div className="space-y-2">
                        <h2 className="text-xl sm:text-2xl font-serif font-medium text-stone-900 group-hover:text-emerald-900 transition-colors">
                          <Link href={`/category/${cat.slug}`} className="hover:underline underline-offset-4">
                            {cat.name}
                          </Link>
                        </h2>

                        {/* DB Description HTML */}
                        {cat.description_html && (
                          <div
                            className="text-xs sm:text-sm text-stone-600 leading-relaxed line-clamp-3 prose prose-sm prose-stone max-w-none"
                            dangerouslySetInnerHTML={{ __html: cat.description_html }}
                          />
                        )}
                      </div>

                      {/* DB Subcategories if present */}
                      {activeSubcategories.length > 0 && (
                        <div className="pt-2 border-t border-stone-100">
                          <div className="flex flex-wrap gap-1.5">
                            {activeSubcategories.map((sub) => (
                              <Link
                                key={sub.id}
                                href={`/category/${cat.slug}?sub=${sub.slug}`}
                                className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-stone-100 text-stone-700 hover:bg-stone-200 hover:text-stone-900 transition"
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Action Link */}
                  <div className="px-6 sm:px-7 pb-6 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <Link
                      href={`/category/${cat.slug}`}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-stone-900 hover:text-emerald-800 transition group/link"
                    >
                      <span>Explore {cat.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

        {/* Relevant Motion & Responsive Sourcing Feature Section with Image & CTA */}
        <motion.section
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl bg-stone-900 text-stone-100 overflow-hidden border border-stone-800 shadow-2xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Left Narrative Column */}
            <div className="lg:col-span-6 p-8 sm:p-12 lg:p-16 flex flex-col justify-between space-y-8 z-10">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono font-medium">
                  <Compass className="w-3.5 h-3.5" />
                  <span>The Sourcing Philosophy</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-serif text-white tracking-tight leading-snug">
                  Every batch begins high in the Himalayan morning mist.
                </h2>

                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  Unlike commercial supermarket brands that blend remnants from industrial auctions, Pure Pour Co. works exclusively with single-estate gardens. Our leaves are sorted, processed, and sealed in multi-barrier pouches within 48 hours of harvest to capture volatile aromatics at their peak.
                </p>
              </div>

              {/* Three Pillars Metric Grid */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-stone-800 text-center sm:text-left">
                <div className="space-y-1">
                  <span className="text-lg sm:text-2xl font-serif font-bold text-white block">
                    1,850m
                  </span>
                  <span className="text-[11px] text-stone-400 font-mono block">
                    Peak Elevation
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-lg sm:text-2xl font-serif font-bold text-emerald-400 block">
                    48 Hours
                  </span>
                  <span className="text-[11px] text-stone-400 font-mono block">
                    Garden to Pack
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-lg sm:text-2xl font-serif font-bold text-white block">
                    100%
                  </span>
                  <span className="text-[11px] text-stone-400 font-mono block">
                    Single-Origin
                  </span>
                </div>
              </div>

              {/* Action CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link
                  href="/products"
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition shadow-md group"
                >
                  <span>Explore All Teas</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/about-us"
                  className="px-5 py-3 rounded-xl bg-stone-800/80 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700 text-xs font-semibold tracking-wider uppercase flex items-center justify-center transition"
                >
                  Our Sourcing Story
                </Link>
              </div>
            </div>

            {/* Right Panoramic Visual Column with Motion Parallax */}
            <div className="lg:col-span-6 relative min-h-[320px] lg:min-h-full overflow-hidden bg-stone-950">
              <motion.img
                initial={{ scale: 1.1 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                src="/images/categories/estate-panorama.jpg"
                alt="High-altitude Himalayan tea estate harvest at sunrise"
                className="w-full h-full object-cover object-center absolute inset-0"
              />

              {/* Subtle Atmospheric Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent lg:bg-gradient-to-r lg:from-stone-950 lg:via-transparent lg:to-transparent" />

              {/* Floating Terroir Tag */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="absolute bottom-6 right-6 left-6 sm:left-auto sm:max-w-xs p-4 rounded-2xl backdrop-blur-md bg-stone-950/75 border border-white/10 text-xs shadow-lg space-y-1"
              >
                <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[10px] uppercase font-bold tracking-wider">
                  <Mountain className="w-3 h-3" />
                  <span>Upper Brahmaputra &amp; Darjeeling Ridges</span>
                </div>
                <p className="text-stone-300 text-[11px] leading-relaxed">
                  Handcrafted by multi-generation estate pluckers in harmony with mountain seasons.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
