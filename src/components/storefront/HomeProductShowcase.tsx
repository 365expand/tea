"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Filter, Leaf, Star } from "lucide-react";
import { ProductCard, ProductCardData } from "@/components/storefront/ProductCard";

interface HomeProductShowcaseProps {
  products: ProductCardData[];
  categories: { id: string; name: string; slug: string }[];
}

export function HomeProductShowcase({ products, categories }: HomeProductShowcaseProps) {
  const [activeTab, setActiveTab] = useState<string>("all");

  const tabOptions = useMemo(() => {
    const list = [{ id: "all", name: "All Harvests", count: products.length }];

    categories.forEach((cat) => {
      const count = products.filter((p: any) => {
        const catName = p.categories?.name;
        const catId = p.category_id;
        return catName === cat.name || catId === cat.id;
      }).length;

      list.push({
        id: cat.id,
        name: cat.name,
        count,
      });
    });

    return list;
  }, [categories, products]);

  const filteredProducts = useMemo(() => {
    if (activeTab === "all") return products;
    return products.filter((p: any) => {
      const catName = p.categories?.name;
      const catId = p.category_id;
      const currentCat = categories.find((c) => c.id === activeTab);
      return catId === activeTab || (currentCat && catName === currentCat.name);
    });
  }, [activeTab, products, categories]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-semibold tracking-widest uppercase text-stone-500 block mb-1">
            Current Harvests
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-stone-900 tracking-tight">
            Estate Reserves &amp; Blends
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl font-light">
            High-mountain whole leaf orthodox flushes, heritage whole-spice chais, and rare silver buds. Freshness guaranteed directly from garden to your teacup.
          </p>
        </div>

        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-900 hover:text-brand-800 group self-start md:self-auto px-5 py-2.5 rounded-full border border-stone-300 hover:border-stone-400 bg-white shadow-2xs transition"
        >
          <span>View All Teas ({products.length})</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar scroll-smooth">
        {tabOptions.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2 rounded-full text-xs sm:text-sm font-medium tracking-tight transition-all duration-200 shrink-0 flex items-center gap-2 ${
                isActive
                  ? "text-white shadow-sm"
                  : "text-stone-600 bg-white border border-stone-200 hover:bg-stone-50 hover:text-stone-900"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="homeProductTab"
                  className="absolute inset-0 bg-stone-900 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-10">{tab.name}</span>
              <span
                className={`relative z-10 text-[10px] font-mono px-1.5 py-0.5 rounded-full transition-colors ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-stone-100 text-stone-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Product Cards Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
        >
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center bg-stone-50 border border-stone-200/80 rounded-3xl">
              <Leaf className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-stone-700">No teas found in this collection currently.</p>
              <p className="text-xs text-stone-500 mt-1">Check back soon for seasonal first-flush releases.</p>
              <button
                onClick={() => setActiveTab("all")}
                className="mt-4 px-4 py-2 bg-brand-800 text-white text-xs font-bold rounded-xl hover:bg-brand-700 transition"
              >
                Show All Teas
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

