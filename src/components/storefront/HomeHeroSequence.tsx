"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Leaf, Sparkles, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TOTAL_FRAMES = 60;

export function HomeHeroSequence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const lastDrawnFrameRef = useRef<number>(1);
  const isUserInteractingRef = useRef<boolean>(false);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [activeScene, setActiveScene] = useState<1 | 2 | 3>(1);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // High-performance canvas paint
  const drawFrame = useCallback((targetIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const images = imagesRef.current;
    if (!images || images.length === 0) return;

    const bounded = Math.min(TOTAL_FRAMES, Math.max(1, Math.round(targetIndex)));
    let chosenImg: HTMLImageElement | null = null;

    if (images[bounded - 1]?.complete && images[bounded - 1]?.naturalWidth > 0) {
      chosenImg = images[bounded - 1];
    } else {
      for (let k = bounded - 1; k >= 0; k--) {
        if (images[k]?.complete && images[k]?.naturalWidth > 0) {
          chosenImg = images[k];
          break;
        }
      }
      if (!chosenImg) {
        for (let k = bounded; k < TOTAL_FRAMES; k++) {
          if (images[k]?.complete && images[k]?.naturalWidth > 0) {
            chosenImg = images[k];
            break;
          }
        }
      }
    }

    if (!chosenImg || chosenImg.naturalWidth === 0) return;
    lastDrawnFrameRef.current = bounded;

    const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
    const cw = canvas.width || Math.round((canvas.clientWidth || window.innerWidth) * dpr);
    const ch = canvas.height || Math.round((canvas.clientHeight || window.innerHeight) * dpr);

    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width = cw;
      canvas.height = ch;
    }

    const iw = chosenImg.naturalWidth;
    const ih = chosenImg.naturalHeight;

    const scale = Math.max(cw / iw, ch / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    const sx = (cw - sw) / 2;
    const sy = (ch - sh) / 2;

    ctx.drawImage(chosenImg, sx, sy, sw, sh);
  }, []);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    drawFrame(lastDrawnFrameRef.current);
  }, [drawFrame]);

  // Preload all 60 frames once
  useEffect(() => {
    let cancelled = false;
    const loadedImages: HTMLImageElement[] = [];
    let initialDrawn = false;

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const pad = String(i).padStart(3, "0");
      const img = new Image();
      img.src = `/images/home/webp/ezgif-frame-${pad}.webp`;
      img.onerror = () => {
        img.src = `/images/home/ezgif-frame-${pad}.png`;
      };
      img.onload = () => {
        if (cancelled) return;
        if (!initialDrawn && (i === 1 || i <= 3)) {
          initialDrawn = true;
          setIsLoaded(true);
          handleResize();
          drawFrame(1);
        }
      };
      loadedImages.push(img);
    }

    imagesRef.current = loadedImages;

    return () => {
      cancelled = true;
    };
  }, [drawFrame, handleResize]);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  // Gentle, calm auto-play when idle at top
  useEffect(() => {
    const interval = setInterval(() => {
      if (isUserInteractingRef.current) return;

      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        if (rect.top < -window.innerHeight * 0.25) return;
      }

      const next = (lastDrawnFrameRef.current % TOTAL_FRAMES) + 1;
      drawFrame(next);

      const nextScene = next <= 22 ? 1 : next <= 42 ? 2 : 3;
      setActiveScene((prev) => (prev !== nextScene ? nextScene : prev));
    }, 110); // Calm, gentle slow-steep pacing (~9 fps for soothing luxury movement)

    return () => clearInterval(interval);
  }, [drawFrame]);

  // Scroll driven animation
  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        ticking = false;
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const total = container.offsetHeight - window.innerHeight;
        if (total <= 0) return;

        const scrolled = -rect.top;

        if (scrolled >= 0 && scrolled <= total) {
          isUserInteractingRef.current = true;
          const progress = Math.min(1, Math.max(0, scrolled / total));

          let frame = 1;
          if (progress <= 0.35) {
            frame = Math.round(1 + (progress / 0.35) * 23);
          } else if (progress <= 0.65) {
            frame = Math.round(25 + ((progress - 0.35) / 0.3) * 19);
          } else {
            frame = Math.round(45 + ((progress - 0.65) / 0.35) * 15);
          }

          frame = Math.min(TOTAL_FRAMES, Math.max(1, frame));
          drawFrame(frame);

          const nextScene = frame <= 22 ? 1 : frame <= 42 ? 2 : 3;
          setActiveScene((prev) => (prev !== nextScene ? nextScene : prev));

          if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
          autoPlayTimerRef.current = setTimeout(() => {
            isUserInteractingRef.current = false;
          }, 1000);
        } else if (scrolled < 0) {
          isUserInteractingRef.current = false;
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    };
  }, [drawFrame]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[200vh] bg-stone-100 select-none"
    >
      {/* Sticky Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
        {/* Hardware-accelerated Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-700"
          style={{ opacity: isLoaded ? 1 : 0.3 }}
        />

        {/* Soft, natural gradient overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-stone-50/90 via-stone-50/50 to-transparent sm:from-stone-50/95 sm:via-stone-50/60" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-stone-100/40 via-transparent to-stone-100/20" />

        {/* Top spacer */}
        <div className="relative z-20 pt-20 sm:pt-24 pointer-events-none" />

        {/* Clean, editorial hero copy (Spacious & uncluttered) */}
        <div className="relative z-20 flex-1 flex items-center px-6 sm:px-12 lg:px-24 pointer-events-none">
          <AnimatePresence mode="wait">
            {activeScene === 1 && (
              <motion.div
                key="scene-1"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-xl text-left space-y-5 pointer-events-auto"
              >
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-stone-900 tracking-tight leading-[1.08]">
                  Pure Leaf.<br />
                  <span className="text-brand-800 font-normal italic">Uncompromised Origin.</span>
                </h1>

                <p className="text-sm sm:text-base text-stone-700 font-light leading-relaxed max-w-lg">
                  Hand-plucked orthodox leaves from Darjeeling mist and Upper Assam gardens. Directly sourced, small-batch packed, and 100% free from synthetic flavorings.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <Link
                    href="/products"
                    className="px-8 py-3.5 bg-stone-900 hover:bg-stone-800 active:scale-95 text-white text-xs sm:text-sm font-semibold tracking-wide rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group"
                  >
                    <span>Shop All Harvests</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    href="/categories"
                    className="text-xs sm:text-sm font-semibold text-stone-800 hover:text-brand-800 transition py-2 px-3 underline-offset-4 hover:underline"
                  >
                    Explore Collections &rarr;
                  </Link>
                </div>
              </motion.div>
            )}

            {activeScene === 2 && (
              <motion.div
                key="scene-2"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-lg ml-auto text-left space-y-5 pointer-events-auto"
              >
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
                  Whole Leaves.<br />
                  <span className="text-amber-900 font-normal italic">Deep Liquor.</span>
                </h2>

                <p className="text-sm sm:text-base text-stone-700 font-light leading-relaxed">
                  Natural volatile oils release notes of malty caramel, muscatel grape, and fresh crushed spices. Experience tea as nature intended.
                </p>

                <div className="pt-2">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 px-7 py-3 bg-stone-900 hover:bg-stone-800 active:scale-95 text-white text-xs sm:text-sm font-semibold tracking-wide rounded-full shadow-md transition"
                  >
                    <span>Browse High-Mountain Reserves</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            )}

            {activeScene === 3 && (
              <motion.div
                key="scene-3"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-xl text-left space-y-5 pointer-events-auto"
              >
                <h2 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-stone-900 tracking-tight leading-[1.08]">
                  Sip Pure.<br />
                  <span className="text-brand-800 italic font-normal">Live Inspired.</span>
                </h2>

                <p className="text-sm sm:text-base text-stone-700 font-light leading-relaxed max-w-lg">
                  Every tin tells you the elevation, pluck date, and estate garden. Packaged within 48 hours in multi-layer foil to guarantee peak morning freshness.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <Link
                    href="/products"
                    className="px-8 py-3.5 bg-stone-900 hover:bg-stone-800 active:scale-95 text-white text-xs sm:text-sm font-semibold tracking-wide rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group"
                  >
                    <span>Shop Reserve Teas</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Minimal, elegant bottom indicator */}
        <div className="relative z-20 pb-6 px-6 sm:px-12 flex items-center justify-between text-xs text-stone-500 font-mono pointer-events-none">
          <div className="flex items-center gap-2">
            <ChevronDown className="w-3.5 h-3.5 animate-bounce text-stone-600" />
            <span className="hidden sm:inline">Scroll to explore</span>
          </div>

          <div className="flex items-center gap-2">
            <span className={activeScene === 1 ? "text-stone-900 font-bold" : "text-stone-400"}>01</span>
            <span className="w-8 h-px bg-stone-300" />
            <span className={activeScene === 2 ? "text-stone-900 font-bold" : "text-stone-400"}>02</span>
            <span className="w-8 h-px bg-stone-300" />
            <span className={activeScene === 3 ? "text-stone-900 font-bold" : "text-stone-400"}>03</span>
          </div>

          <span className="hidden sm:inline">Darjeeling • Assam • Kashmir</span>
        </div>
      </div>
    </div>
  );
}
