"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Clock, Droplets, Sparkles, Check, ArrowRight } from "lucide-react";

const STEPS = [
  {
    step: 1,
    title: "Crush Whole Spices & Rolling Boil",
    badge: "100°C Spring Water",
    time: "1 Minute Simmer",
    description:
      "Bring 150ml of fresh filtered water to a rolling boil. Gently crack whole green cardamom pods, cinnamon bark, and fresh sliced ginger in a mortar to liberate their essential oils before introducing them to the hot water.",
    tips: "Always crack spices fresh — pre-ground spices lose volatile top-notes within minutes.",
    image: "/images/categories/chai-spices.jpg",
  },
  {
    step: 2,
    title: "Introduce Whole Leaf Orthodox / CTC",
    badge: "2.5g Pure Leaf",
    time: "2.5 to 3.5 Minutes",
    description:
      "Measure 1 heaped teaspoon (2.5g) of whole orthodox leaf or brisk golden CTC. Reduce flame to a gentle simmer so the leaves unfurl naturally without releasing bitter polyphenols. Watch the liquor turn to rich mahogany amber.",
    tips: "Never over-boil orthodox leaves. Gentle steeping extracts natural malty sweetness.",
    image: "/images/categories/black-teas.jpg",
  },
  {
    step: 3,
    title: "Velvet Milk Simmer & 45s Rest",
    badge: "60-80ml Fresh Milk",
    time: "45 Seconds Rest",
    description:
      "Pour in fresh creamy whole milk or rich oat milk. Allow the chai to rise to a rich, billowing froth twice. Strain through a fine mesh strainer into a warmed porcelain or terracotta cup, and let rest 45 seconds to settle.",
    tips: "Resting the brewed tea allows volatile aroma notes to integrate with the milk fats.",
    image: "/images/categories/green-white-teas.jpg",
  },
];

export function BrewingRitualSection() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="bg-stone-100/70 border border-stone-200/90 rounded-3xl sm:rounded-[36px] p-6 sm:p-12 lg:p-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-200/80 text-stone-800 text-[11px] font-semibold tracking-wider uppercase mb-2">
            <Flame className="w-3 h-3 text-amber-700" />
            The Artisanal Ritual
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight font-serif">
            How to Brew the Perfect Pour
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
            From cracked cardamom pods to uncurling single-estate leaves — follow our time-honored artisanal proportion for pure briskness, comforting warmth, and balanced malt.
          </p>
        </div>

        {/* Step Tabs / Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {STEPS.map((s, idx) => {
            const isActive = activeStep === idx;
            return (
              <button
                key={s.step}
                onClick={() => setActiveStep(idx)}
                className={`relative p-4 sm:p-5 rounded-2xl text-left border transition-all duration-300 ${
                  isActive
                    ? "bg-white border-brand-400 shadow-md ring-2 ring-brand-700/10"
                    : "bg-white/60 border-stone-200 hover:bg-white hover:border-stone-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isActive
                        ? "bg-brand-800 text-white"
                        : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    0{s.step}
                  </span>
                  <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wide">
                    {s.time}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-xs sm:text-sm text-stone-900 line-clamp-1">
                  {s.title}
                </h3>
              </button>
            );
          })}
        </div>

        {/* Active Step Showcase */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/90 shadow-sm"
          >
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100/70 text-amber-900 text-[11px] font-bold">
                  <Droplets className="w-3 h-3 text-amber-700" />
                  {STEPS[activeStep].badge}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 text-[11px] font-mono">
                  <Clock className="w-3 h-3 text-stone-500" />
                  {STEPS[activeStep].time}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                {STEPS[activeStep].title}
              </h3>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {STEPS[activeStep].description}
              </p>

              {/* Master Sommelier Tip */}
              <div className="p-3.5 rounded-xl bg-brand-50/70 border border-brand-200/60 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
                <p className="text-xs text-brand-950 leading-relaxed font-sans">
                  <strong className="font-semibold text-brand-900">Sommelier Note: </strong>
                  {STEPS[activeStep].tips}
                </p>
              </div>

              {/* Next Step / Action */}
              <div className="pt-2 flex items-center gap-3">
                {activeStep < STEPS.length - 1 ? (
                  <button
                    onClick={() => setActiveStep(activeStep + 1)}
                    className="px-5 py-2.5 rounded-xl bg-brand-800 hover:bg-brand-700 text-white text-xs font-bold transition flex items-center gap-2"
                  >
                    <span>Next Step ({activeStep + 2} of 3)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <Link
                    href="/products"
                    className="px-5 py-2.5 rounded-xl bg-brand-800 hover:bg-brand-700 text-white text-xs font-bold transition flex items-center gap-2"
                  >
                    <span>Explore Harvests to Brew</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>

            {/* Right Image Feature */}
            <div className="lg:col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 shadow-md">
              <img
                src={STEPS[activeStep].image}
                alt={STEPS[activeStep].title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-stone-900/10" />
              <div className="absolute bottom-3 right-3 backdrop-blur-md bg-stone-900/70 text-white text-[10px] font-mono px-2.5 py-1 rounded-full border border-white/20">
                Step 0{STEPS[activeStep].step} of 03
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

