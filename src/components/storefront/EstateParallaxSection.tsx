"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Mountain, ShieldCheck, Clock } from "lucide-react";

export function EstateParallaxSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section
      ref={containerRef}
      className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16"
    >
      <div className="relative rounded-3xl overflow-hidden min-h-[520px] flex items-center shadow-xl border border-stone-200">
        {/* Parallax Background */}
        <motion.div
          style={{ y: bgY }}
          className="absolute inset-0 -top-[15%] -bottom-[15%] w-full h-[130%] pointer-events-none"
        >
          <img
            src="/images/categories/estate-panorama.jpg"
            alt="Misty Himalayan Tea Garden"
            className="w-full h-full object-cover filter brightness-[0.78]"
          />
        </motion.div>

        {/* Ambient Dark Gradient for clean contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/85 via-stone-950/60 to-transparent" />

        {/* Foreground Content */}
        <div className="relative z-10 max-w-xl px-6 sm:px-12 lg:px-16 py-12 text-white space-y-5">
          <span className="text-xs font-semibold tracking-widest uppercase text-amber-300 block">
            The Sourcing Standard
          </span>

          <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white leading-tight">
            Single Estates.<br />
            <span className="italic font-normal text-amber-100">Pure Terroir.</span>
          </h2>

          <p className="text-xs sm:text-sm text-stone-200 font-light leading-relaxed">
            We partner directly with certified single gardens in Kurseong, Darjeeling, and Upper Assam. Bypassing middlemen allows us to pack leaves within 48 hours of plucking, retaining the full spectrum of natural essential oils.
          </p>

          {/* Clean 3-pillar metrics */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/15">
            <div>
              <div className="text-lg font-bold font-serif text-white">6,800 Ft</div>
              <p className="text-[10px] text-stone-300">High mountain mist</p>
            </div>
            <div>
              <div className="text-lg font-bold font-serif text-white">&lt; 48h</div>
              <p className="text-[10px] text-stone-300">Plucking to pack</p>
            </div>
            <div>
              <div className="text-lg font-bold font-serif text-white">100% Pure</div>
              <p className="text-[10px] text-stone-300">Zero added oils</p>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/about-us"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-stone-100 text-stone-900 text-xs font-bold rounded-full transition shadow-sm"
            >
              <span>Our Sourcing Story</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
