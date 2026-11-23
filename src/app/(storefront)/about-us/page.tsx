import type { Metadata } from "next";
import { HomeHeroSequence } from "@/components/storefront/HomeHeroSequence";
import {
  AboutPillars,
  AboutProcessTimeline,
  AboutImpactStats,
  AboutFounderNote,
  AboutCtaSection,
} from "@/components/storefront/AboutSections";

export const metadata: Metadata = {
  title: "About Us | Pure Pour Co. — Single-Origin Artisanal Teas",
  description:
    "Discover Pure Pour Co. Single-origin, garden-fresh teas honestly sourced from high-elevation Himalayan estates with uncompromised whole-leaf purity.",
};

export default function AboutUsPage() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 font-sans">
      {/* Interactive Cinematic Scroll Sequence (Moved from Home per request) */}
      <HomeHeroSequence />

      {/* Four Pillars of Pure Pour Co. */}
      <AboutPillars />

      {/* From Seed to Steep - 5-Step Artisanal Timeline */}
      <AboutProcessTimeline />

      {/* Impact & Provenance Numbers */}
      <AboutImpactStats />

      {/* Founders' Note & Manifesto */}
      <AboutFounderNote />

      {/* Catalog CTA */}
      <AboutCtaSection />
    </main>
  );
}
