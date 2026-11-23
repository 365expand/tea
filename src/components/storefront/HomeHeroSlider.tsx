"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";

export type HeroSlide = {
  id: string;
  desktop_image_url: string;
  mobile_image_url?: string;
  link_url?: string;
  alt_text?: string;
  is_active?: boolean;
};

interface HomeHeroSliderProps {
  slides?: HeroSlide[];
}

export function HomeHeroSlider({ slides = [] }: HomeHeroSliderProps) {
  const activeSlides = slides.filter((s) => s.is_active !== false && s.desktop_image_url);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Fallback defaults if no slides exist yet
  const displaySlides: HeroSlide[] =
    activeSlides.length > 0
      ? activeSlides
      : [
          {
            id: "default-1",
            desktop_image_url: "/images/categories/estate-panorama.jpg",
            mobile_image_url: "/images/categories/estate-panorama.jpg",
            link_url: "/products",
            alt_text: "Pure Pour Co. Single-Estate Teas",
            is_active: true,
          },
        ];

  const total = displaySlides.length;

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIdx((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIdx((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Autoplay timer (5 seconds)
  useEffect(() => {
    if (total <= 1 || isPaused) return;
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [total, isPaused, handleNext]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > 45) {
      handlePrev();
    } else if (deltaX < -45) {
      handleNext();
    }
    touchStartX.current = null;
  };

  const currentSlide = displaySlides[currentIdx];

  const slideVariants: Variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.35 },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 },
      },
    }),
  };

  const slideContent = (
    <picture className="block w-full h-full pointer-events-none select-none">
      {currentSlide.mobile_image_url && (
        <source
          media="(max-width: 640px)"
          srcSet={currentSlide.mobile_image_url}
        />
      )}
      <img
        src={currentSlide.desktop_image_url}
        alt={currentSlide.alt_text || "Pure Pour Co. artisanal tea banner"}
        className="w-full h-full object-cover object-center pointer-events-none select-none"
        loading="eager"
        draggable={false}
      />
    </picture>
  );

  return (
    <section
      className="w-full px-3 sm:px-6 lg:px-10 xl:px-14 py-3 sm:py-5"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Store hero promotions"
    >
      <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-900 shadow-md sm:shadow-lg aspect-[16/9] sm:aspect-[21/9] lg:aspect-[2.4/1] max-h-[620px]">
        {/* Animated Slide Frame */}
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentSlide.id + currentIdx}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full"
          >
            {currentSlide.link_url ? (
              <Link
                href={currentSlide.link_url}
                className="block w-full h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-inset"
                tabIndex={0}
              >
                {slideContent}
              </Link>
            ) : (
              slideContent
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows (Shown when more than 1 slide) */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous slide"
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/35 hover:bg-black/60 text-white backdrop-blur-xs flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 shadow-md z-20 focus:outline-none"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next slide"
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/35 hover:bg-black/60 text-white backdrop-blur-xs flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 shadow-md z-20 focus:outline-none"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Bottom Dots / Pill Pagination */}
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 z-20 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full">
              {displaySlides.map((slide, idx) => (
                <button
                  key={slide.id || idx}
                  type="button"
                  onClick={() => {
                    setDirection(idx > currentIdx ? 1 : -1);
                    setCurrentIdx(idx);
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentIdx
                      ? "w-6 bg-white shadow-xs"
                      : "w-2 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
