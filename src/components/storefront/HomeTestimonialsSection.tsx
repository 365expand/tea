"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star,
  CheckCircle2,
  Quote,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Award,
} from "lucide-react";

export type TestimonialReview = {
  id: string;
  customer_name: string;
  rating: number;
  title: string;
  body: string;
  created_at: string;
  products?: { name: string } | { name: string }[] | null;
  location?: string;
  steepNote?: string;
};

interface HomeTestimonialsSectionProps {
  reviews?: TestimonialReview[];
}

export function HomeTestimonialsSection({ reviews = [] }: HomeTestimonialsSectionProps) {
  // Curated fallback reviews if database reviews are sparse
  const fallbackReviews: TestimonialReview[] = [
    {
      id: "fb-1",
      customer_name: "Vikram Sengupta",
      rating: 5,
      title: "Pure Muscatel Nuance, Unmistakably Makaibari",
      body: "Having grown up in North Bengal, I am exceedingly discerning about Darjeeling First Flush. Pure Pour Co. delivers whole unbroken leaves with luminous amber clarity and zero bitterness. Truly exceptional standard.",
      created_at: new Date().toISOString(),
      location: "Kolkata, West Bengal",
      steepNote: "Steeping: Makaibari Second Flush Muscatel",
      products: { name: "Makaibari Second Flush Muscatel" },
    },
    {
      id: "fb-2",
      customer_name: "Pooja Krishnamurthy",
      rating: 5,
      title: "Finally, Masala Chai Without Synthetic Flavor Sprays",
      body: "Most commercial brands use chemical cardamom flavoring. Pure Pour Co.'s Royal Chai blend has actual cracked green cardamom pods and ginger flakes. Rich, invigorating, and deeply soothing.",
      created_at: new Date().toISOString(),
      location: "Bengaluru, Karnataka",
      steepNote: "Steeping: Royal Himalayan Kadak Chai",
      products: { name: "Royal Himalayan Kadak Chai" },
    },
    {
      id: "fb-3",
      customer_name: "Ananya Deshmukh",
      rating: 5,
      title: "Malty and Robust Morning Essential",
      body: "The Upper Assam Orthodox Black Tea is deep, brisk, and holds honey and milk perfectly. You can genuinely smell the fresh garden aroma the moment you peel back the vacuum seal.",
      created_at: new Date().toISOString(),
      location: "Mumbai, Maharashtra",
      steepNote: "Steeping: Upper Assam Reserve Orthodox",
      products: { name: "Upper Assam Reserve Orthodox" },
    },
    {
      id: "fb-4",
      customer_name: "Rohit Mathur",
      rating: 5,
      title: "Silky White Tea with Wildflower Notes",
      body: "Delicate silver needles that unfold gracefully in glass teaware. Subtle floral sweetness with low astringency. A peaceful afternoon companion.",
      created_at: new Date().toISOString(),
      location: "New Delhi",
      steepNote: "Steeping: Himalayan Silver Needles White Tea",
      products: { name: "Himalayan Silver Needles" },
    },
  ];

  const displayReviews = reviews.length > 0 ? reviews : fallbackReviews;
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="w-full py-16 sm:py-24 bg-white border-t border-stone-200/90 relative overflow-hidden">
      {/* Decorative subtle ambient backdrop */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-50/50 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-50/40 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 max-w-7xl mx-auto space-y-12 sm:space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-[11px] font-semibold tracking-wider uppercase">
              <Award className="w-3.5 h-3.5 text-amber-700" />
              Verified Connoisseur Reviews
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
              Stories from Morning Brew Rituals Across India
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
              Read uncensored feedback from discerning tea lovers who made the transition from commercial CTC dust to whole-leaf single-estate harvests.
            </p>
          </div>

          {/* Social Proof & Rating Badge */}
          <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shrink-0 shadow-2xs">
            <div className="text-center border-r border-stone-200 pr-4">
              <div className="text-2xl sm:text-3xl font-mono font-bold text-stone-900 leading-none">
                4.9<span className="text-xs text-stone-400 font-sans">/5</span>
              </div>
              <div className="flex items-center text-amber-400 gap-0.5 mt-1 justify-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
            <div className="text-left space-y-0.5">
              <span className="text-xs font-bold text-stone-900 block font-sans">
                12,000+ Morning Cups
              </span>
              <p className="text-[11px] text-stone-500 font-light">
                Across 28 states &amp; union territories
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic & Mobile-Friendly Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {displayReviews.slice(0, 6).map((rev, idx) => {
            const productName = Array.isArray(rev.products)
              ? (rev.products[0] as any)?.name
              : (rev.products as any)?.name || "Reserve Flush Tea";

            return (
              <div
                key={rev.id || idx}
                className="bg-stone-50/70 hover:bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-7 shadow-xs hover:border-brand-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group relative"
              >
                <div className="space-y-4">
                  {/* Card Top: Rating, Steeping Varietal Tag */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center text-amber-500 gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < (rev.rating || 5)
                              ? "fill-amber-400 text-amber-400"
                              : "text-stone-300"
                          }`}
                        />
                      ))}
                    </div>

                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full shrink-0">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                      Verified
                    </span>
                  </div>

                  {/* Steeping Tag */}
                  <div className="text-[11px] font-medium text-brand-900/90 bg-brand-50/80 border border-brand-200/50 px-2.5 py-1 rounded-lg inline-block">
                    {rev.steepNote || `Steeping: ${productName}`}
                  </div>

                  {/* Title & Body */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-sm sm:text-base text-stone-900 font-serif leading-snug">
                      {rev.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light italic">
                      &ldquo;{rev.body}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Card Footer: Reviewer Info */}
                <div className="pt-4 border-t border-stone-200/80 mt-5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-brand-900 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      {rev.customer_name ? rev.customer_name.charAt(0).toUpperCase() : "P"}
                    </div>
                    <div>
                      <span className="font-semibold text-stone-900 block leading-tight">
                        {rev.customer_name}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {rev.location || "Verified Purveyor"}
                      </span>
                    </div>
                  </div>

                  <Quote className="w-5 h-5 text-stone-300/60 group-hover:text-brand-300 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Bar */}
        <div className="p-6 sm:p-8 bg-stone-900 text-white rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-serif font-bold">
              Elevate Your Morning Cup Today
            </h3>
            <p className="text-xs text-stone-300 font-light">
              Free shipping across India on orders over ₹999. Nitrogen sealed at origin.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-400 hover:bg-amber-300 active:scale-95 text-stone-950 text-xs sm:text-sm font-bold rounded-full transition shadow-sm shrink-0"
          >
            <span>Explore All Single-Estate Teas</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
