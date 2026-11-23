import React from "react";
import Link from "next/link";
import {
  Leaf,
  ShieldCheck,
  Clock,
  Sparkles,
  Mountain,
  HeartHandshake,
  Check,
  X,
  ArrowRight,
} from "lucide-react";

export function WhyUsSection() {
  const pillars = [
    {
      icon: Mountain,
      title: "100% Single-Estate Sourced",
      badge: "Pure Terroir",
      description:
        "We never blend with cheap filler dust. Every batch is harvested from renowned high-altitude gardens across Darjeeling, Upper Assam, and the Nilgiri Blue Mountains.",
    },
    {
      icon: Leaf,
      title: "Whole Leaf Orthodox Craft",
      badge: "Uncrushed Leaves",
      description:
        "Our artisanal whole leaves undergo delicate hand-rolling and solar withering, releasing authentic volatile terpenes, honeyed muscatel, and brisk malt notes.",
    },
    {
      icon: Clock,
      title: "Direct Garden Freshness",
      badge: "Peak Aroma",
      description:
        "Commercial teas sit in open auction warehouses for up to 18 months. Pure Pour Co. packages fresh harvests directly from estate drying rooms within weeks.",
    },
    {
      icon: Sparkles,
      title: "Zero Artificial Additives",
      badge: "100% Clean",
      description:
        "No artificial flavoring oils, chemical essences, or hidden sugars. What you taste is pure Camellia sinensis and sun-dried botanical spices.",
    },
    {
      icon: ShieldCheck,
      title: "Multi-Barrier Nitrogen Pack",
      badge: "Cellar Fresh",
      description:
        "Our high-grade UV-protective tins and hermetic pouches seal out oxygen and humidity, preserving the tea garden's pristine mountain aroma until steep time.",
    },
    {
      icon: HeartHandshake,
      title: "Ethical Mountain Partnerships",
      badge: "Grower Equity",
      description:
        "We partner directly with heritage tea estates, ensuring fair compensation and supporting regenerative agriculture across Indian mountain communities.",
    },
  ];

  const comparison = [
    {
      aspect: "Leaf Quality",
      purePour: "100% Handcrafted Whole Orthodox Leaf & Buds",
      commercial: "Crushed CTC dust, fannings & machine sweepings",
    },
    {
      aspect: "Origin & Sourcing",
      purePour: "Single-origin micro-lots with transparent estate provenance",
      commercial: "Anonymous multi-country bulk blends of indeterminate age",
    },
    {
      aspect: "Aroma & Flavor",
      purePour: "Nuanced, multi-layered notes (muscatel, cocoa, floral stone-fruit)",
      commercial: "Flat, overwhelmingly bitter, often requires milk and heavy sugar",
    },
    {
      aspect: "Harvest Freshness",
      purePour: "Hermetically sealed within weeks of seasonal flush",
      commercial: "Aged in intermediate auction storage for 9 to 18 months",
    },
    {
      aspect: "Clean Ingredients",
      purePour: "Zero synthetic aroma oils, zero preservatives, 100% natural",
      commercial: "Frequently sprayed with artificial fruit scents and flavor enhancers",
    },
  ];

  return (
    <section className="w-full py-16 sm:py-24 bg-stone-50/60 border-y border-stone-200/80">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 max-w-7xl mx-auto space-y-16 sm:space-y-20">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/70 text-brand-900 text-[11px] font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-brand-700" />
            The Terroir Distinction
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
            Why Discerning Tea Drinkers Choose Pure Pour Co.
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
            We bridge the chasm between Himalayan mountain estates and your morning teacup. Here is what makes our single-origin harvests fundamentally exceptional.
          </p>
        </div>

        {/* 6 Luxury Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/90 shadow-xs hover:border-brand-300 hover:shadow-md transition-all duration-300 group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-stone-100 group-hover:bg-brand-50 text-stone-800 group-hover:text-brand-800 flex items-center justify-center transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200/70">
                      {pillar.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-stone-900 font-sans tracking-tight mb-2">
                      {pillar.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
                      {pillar.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 mt-5 flex items-center gap-1 text-[11px] font-semibold text-brand-800">
                  <span>Explore harvest</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison Matrix: Pure Pour Co. vs Commercial Blends */}
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
          <div className="p-6 sm:p-8 bg-brand-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-amber-300 font-semibold block mb-1">
                Transparency Benchmark
              </span>
              <h3 className="text-lg sm:text-2xl font-serif font-bold tracking-tight">
                Pure Pour Co. vs Standard Commercial Teas
              </h3>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold transition shadow-sm"
            >
              <span>Taste The Difference</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-100/70 text-stone-700">
                  <th className="py-3.5 px-4 sm:px-6 font-semibold w-1/4">Aspect</th>
                  <th className="py-3.5 px-4 sm:px-6 font-bold text-brand-900 bg-brand-50/60 w-3/8">
                    Pure Pour Co. Standard
                  </th>
                  <th className="py-3.5 px-4 sm:px-6 font-semibold text-stone-500 w-3/8">
                    Typical Mass-Market Teas
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/80">
                {comparison.map((item, i) => (
                  <tr key={i} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-semibold text-stone-900">
                      {item.aspect}
                    </td>
                    <td className="py-4 px-4 sm:px-6 bg-brand-50/30 text-stone-800 font-medium">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item.purePour}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-stone-500 font-light">
                      <div className="flex items-start gap-2">
                        <X className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                        <span>{item.commercial}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
