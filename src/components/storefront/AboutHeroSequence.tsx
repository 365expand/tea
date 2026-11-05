"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Leaf, ArrowDown, ArrowRight, Sparkles, Compass } from "lucide-react";

const TOTAL_FRAMES = 50;

export function AboutHeroSequence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const lastDrawnFrameRef = useRef<number>(1);

  // Discrete scene state to prevent 60fps React re-renders!
  // Scene 1: Frames 1-16 (Misty mountain terraces)
  // Scene 2: Frames 17-34 (Artisanal rolling in estate factory)
  // Scene 3: Frames 35-50 (White studio pouch reveal - slowed end)
  const [activeScene, setActiveScene] = useState<1 | 2 | 3>(1);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // 1. Preload frames (WebP primary with PNG fallback)
  useEffect(() => {
    let cancelled = false;
    const loadedImages: HTMLImageElement[] = [];
    let readyCount = 0;

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const pad = String(i).padStart(3, "0");
      const img = new Image();
      img.src = `/images/about/webp/ezgif-frame-${pad}.webp`;
      img.onerror = () => {
        img.src = `/images/about/ezgif-frame-${pad}.png`;
      };
      img.onload = () => {
        if (cancelled) return;
        readyCount++;
        // As soon as first 3 frames are ready, paint immediately!
        if (readyCount >= 3 && !isLoaded) {
          setIsLoaded(true);
        }
      };
      loadedImages.push(img);
    }

    imagesRef.current = loadedImages;

    return () => {
      cancelled = true;
    };
  }, [isLoaded]);

  // 2. High-performance canvas paint with aspect-ratio cover & nearest-frame fallback
  const drawFrame = useCallback((targetIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const images = imagesRef.current;
    if (!images.length) return;

    // Find requested frame or nearest already loaded frame
    let chosenImg: HTMLImageElement | null = null;
    const bounded = Math.min(TOTAL_FRAMES, Math.max(1, targetIndex));

    if (images[bounded - 1]?.complete && images[bounded - 1]?.naturalWidth > 0) {
      chosenImg = images[bounded - 1];
    } else {
      // Search backwards for closest loaded frame
      for (let k = bounded - 1; k >= 0; k--) {
        if (images[k]?.complete && images[k]?.naturalWidth > 0) {
          chosenImg = images[k];
          break;
        }
      }
      // Or search forwards if backwards not found
      if (!chosenImg) {
        for (let k = bounded; k < TOTAL_FRAMES; k++) {
          if (images[k]?.complete && images[k]?.naturalWidth > 0) {
            chosenImg = images[k];
            break;
          }
        }
      }
    }

    if (!chosenImg) return;
    lastDrawnFrameRef.current = bounded;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = chosenImg.naturalWidth;
    const ih = chosenImg.naturalHeight;

    const scale = Math.max(cw / iw, ch / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    const sx = (cw - sw) / 2;
    const sy = (ch - sh) / 2;

    ctx.drawImage(chosenImg, sx, sy, sw, sw > 0 ? sh : ch);
  }, []);

  // 3. Resize canvas to display size * DPR
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    drawFrame(lastDrawnFrameRef.current);
  }, [drawFrame]);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  // Initial paint as soon as loaded
  useEffect(() => {
    if (isLoaded) {
      drawFrame(1);
    }
  }, [isLoaded, drawFrame]);

  // 4. Scroll driven animation (Zero React state overhead on 60fps frame steps)
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
        const progress = Math.min(1, Math.max(0, scrolled / total));

        // Smooth non-linear curve:
        // 0.00 to 0.35 -> frames 1 to 18 (hills)
        // 0.35 to 0.60 -> frames 19 to 34 (factory rolling)
        // 0.60 to 1.00 -> frames 35 to 50 (slower end for finished product reveal)
        let frame = 1;
        if (progress <= 0.35) {
          const t = progress / 0.35;
          frame = Math.round(1 + t * 17);
        } else if (progress <= 0.60) {
          const t = (progress - 0.35) / 0.25;
          frame = Math.round(18 + t * 16);
        } else {
          const t = (progress - 0.60) / 0.40;
          frame = Math.round(35 + t * 15);
        }

        frame = Math.min(TOTAL_FRAMES, Math.max(1, frame));

        // Synchronous canvas render (no React re-render lag)
        drawFrame(frame);

        // Update active scene ONLY when scene boundary is crossed
        const nextScene = frame <= 16 ? 1 : frame <= 34 ? 2 : 3;
        setActiveScene((prev) => (prev !== nextScene ? nextScene : prev));
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [drawFrame]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[220vh] bg-stone-950 select-none"
    >
      {/* Sticky Screen Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
        {/* Hardware-accelerated Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-500"
          style={{ opacity: isLoaded ? 1 : 0.2 }}
        />

        {/* Clean, Subtle Gradient Overlays for Pure Contrast (No heavy boxes!) */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
            activeScene === 3
              ? "bg-gradient-to-t from-white/70 via-transparent to-black/20"
              : "bg-gradient-to-t from-black/60 via-transparent to-black/40"
          }`}
        />

        {/* Top Header Clearance Spacer */}
        <div className="relative z-20 pt-20 sm:pt-24 pointer-events-none" />

        {/* ============================================================ */}
        {/* SCENE 1 (Frames 1-16): TEXT ON LEFT SIDE                     */}
        {/* High-elevation mist gardens. Clean airy typography.          */}
        {/* ============================================================ */}
        <div
          className={`relative z-20 flex-1 flex items-center px-6 sm:px-12 lg:px-20 transition-all duration-700 pointer-events-none ${
            activeScene === 1
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-6 pointer-events-none"
          }`}
        >
          <div className="max-w-xl text-left space-y-3.5">
            <span className="text-xs font-mono font-medium tracking-widest uppercase text-emerald-400 drop-shadow-sm flex items-center gap-2">
              <Compass className="w-3.5 h-3.5" /> High Alpine Terraces &bull; Assam &amp; Darjeeling
            </span>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-[1.12] drop-shadow-lg">
              Born from Mist.<br />
              <span className="text-emerald-300 font-normal italic">Nurtured by Sunlight.</span>
            </h1>

            <p className="text-xs sm:text-base text-stone-200 leading-relaxed font-sans max-w-lg drop-shadow-md">
              High up on Himalayan mountain slopes, tea is nurtured by morning dew and ancient living soil. Hand-plucked at daybreak when the leaves hold their highest natural aromatic volatile oils.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-stone-300 font-mono drop-shadow-sm">
              <ArrowDown className="w-3.5 h-3.5 animate-bounce text-emerald-400" />
              Scroll to witness the garden craft
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SCENE 2 (Frames 17-34): TEXT IN THE MIDDLE / CENTER          */}
        {/* Artisanal factory rolling & withering on bamboo racks.       */}
        {/* ============================================================ */}
        <div
          className={`relative z-20 flex-1 flex items-center justify-center px-6 sm:px-12 transition-all duration-700 pointer-events-none ${
            activeScene === 2
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95 pointer-events-none"
          }`}
        >
          <div className="max-w-2xl text-center space-y-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono tracking-widest uppercase text-amber-300 drop-shadow-sm">
              <Sparkles className="w-3.5 h-3.5" /> Hand-Crafted Sorting &amp; Withering
            </span>

            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight leading-tight drop-shadow-xl">
              Gentle Cellular Rolling.<br />
              <span className="text-amber-200 font-normal italic">Zero Artificial Additives.</span>
            </h2>

            <p className="text-xs sm:text-base text-stone-200 leading-relaxed max-w-xl mx-auto drop-shadow-md">
              Fresh green leaves tumble gently across sorting rollers and elevated bamboo troughs. No spray essences, no synthetic flavors—only pure plant leaves awakening rich amber depths.
            </p>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SCENE 3 (Frames 35-50): TEXT ON LEFT & RIGHT SIDES           */}
        {/* Finished product reveal on clean white studio table.         */}
        {/* Clean, minimalist luxury typography (Clean dark vibe).       */}
        {/* ============================================================ */}
        <div
          className={`relative z-20 flex-1 flex items-center px-6 sm:px-12 lg:px-20 transition-all duration-700 pointer-events-none ${
            activeScene === 3
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6 pointer-events-none"
          }`}
        >
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Side: Product Heritage */}
            <div className="space-y-3 text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono tracking-widest uppercase text-brand-700 font-semibold">
                <Leaf className="w-3.5 h-3.5 text-brand-600" />
                Pure Pour Co. &bull; Premium Green Tea
              </span>

              <h3 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
                Goodness in Every Sip.
              </h3>

              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed max-w-md">
                Hermetically sealed in multi-layer airtight craft pouches within 48 hours of harvest. Pure whole leaves, rich in antioxidants, delivered fresh from the mountain gardens.
              </p>
            </div>

            {/* Right Side: Conscious Harvest & Action */}
            <div className="space-y-3 text-left md:text-right flex flex-col md:items-end">
              <span className="text-xs font-mono tracking-widest uppercase text-stone-500">
                Estate Direct &bull; Fair Trade
              </span>

              <h4 className="text-xl sm:text-3xl font-serif font-bold text-stone-900">
                Single-Origin Purity.
              </h4>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-sm">
                Transparent trade paying 35% above auction minimums to mountain grower families.
              </p>

              <div className="pt-2 pointer-events-auto">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-700 hover:bg-brand-600 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg transition active:scale-95"
                >
                  <span>Explore Harvests</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Bottom Scroll Track Indicator */}
        <div className="relative z-20 pb-4 px-6 sm:px-12 flex items-center justify-between text-[11px] font-mono text-stone-400 pointer-events-none">
          <span className="hidden sm:inline">Scroll to navigate the harvest</span>
          <div className="w-32 h-1 bg-stone-300/40 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                activeScene === 3 ? "bg-brand-600" : "bg-emerald-400"
              }`}
              style={{
                width: activeScene === 1 ? "33%" : activeScene === 2 ? "66%" : "100%",
              }}
            />
          </div>
          <span>Pure Pour Co.</span>
        </div>
      </div>
    </div>
  );
}
