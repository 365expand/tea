import Link from "next/link";
import {
  Leaf,
  ShieldCheck,
  Clock,
  HeartHandshake,
  Sun,
  Wind,
  Flame,
  Package,
  Award,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export function AboutPillars() {
  const pillars = [
    {
      icon: Leaf,
      title: "100% Single-Estate",
      subtitle: "Never Bulk-Blended",
      description:
        "Every batch originates from a verified, high-altitude mountain estate in Assam or Darjeeling. We never blend harvests with cheaper industrial dust or sweepings.",
      tag: "Pure Terroir",
    },
    {
      icon: ShieldCheck,
      title: "Zero Artificial Scents",
      subtitle: "No Spray Aromas",
      description:
        "We strictly reject chemical spray-on essences, synthetic oils, and artificial colorants. The rich aroma in your cup comes 100% from living tea leaf terpenes.",
      tag: "Lab Tested",
    },
    {
      icon: Clock,
      title: "48-Hour Garden Pack",
      subtitle: "Peak Volatile Oils",
      description:
        "While commercial supermarket teas sit in auction warehouses for months losing their aroma, our leaves are sealed within 48 hours of harvest in multi-layer airtight pouches.",
      tag: "Garden Fresh",
    },
    {
      icon: HeartHandshake,
      title: "Direct Grower Equity",
      subtitle: "35% Above Auction",
      description:
        "We partner directly with heritage tea garden pluckers and family estates, bypassing brokers and supporting living wages, healthcare, and mountain community schools.",
      tag: "Fair Trade",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-stone-50 border-t border-stone-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-mono tracking-widest uppercase text-emerald-800 font-bold">
            The Pure Pour Standard
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-stone-900">
            Four Pillars of Uncompromised Quality.
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            In an industry dominated by commercial mass-blends and artificial enhancements, Pure Pour Co. is a sanctuary of honest, unprocessed single-origin tea.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                      {p.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-stone-900 mb-0.5">{p.title}</h3>
                  <p className="text-xs font-serif italic text-emerald-800 mb-3">{p.subtitle}</p>
                  <p className="text-xs text-stone-600 leading-relaxed">{p.description}</p>
                </div>

                <div className="pt-5 border-t border-stone-100 mt-5 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Guaranteed Authentic
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function AboutProcessTimeline() {
  const steps = [
    {
      number: "01",
      icon: Sun,
      title: "Dawn Hand-Plucking",
      subtitle: "Two Leaves & A Bud",
      description:
        "Harvesting begins at daybreak before sunlight evaporates mountain dew. Artisans select only the tender topmost bud and adjoining two leaves, rich in amino acids.",
    },
    {
      number: "02",
      icon: Wind,
      title: "Gentle Solar Withering",
      subtitle: "Bamboo Troughs",
      description:
        "Fresh green leaves are spread across elevated bamboo racks where gentle Himalayan breezes slowly evaporate surface moisture, concentrating volatile aroma oils.",
    },
    {
      number: "03",
      icon: Leaf,
      title: "Artisanal Rolling & Sorting",
      subtitle: "Cellular Awakening",
      description:
        "Leaves are rolled with measured pressure to rupture cell walls without shredding, triggering enzymatic oxidation that unlocks deep malt and muscatel tones.",
    },
    {
      number: "04",
      icon: Flame,
      title: "Master Wood-Fired Drying",
      subtitle: "Halting at Peak Bouquet",
      description:
        "The tea passes through precision hot-air chambers to halt oxidation at the exact second peak fragrance is reached, imparting a brisk golden amber warmth.",
    },
    {
      number: "05",
      icon: Package,
      title: "Nitrogen Airtight Sealing",
      subtitle: "Direct to Your Cup",
      description:
        "Within 48 hours of drying, the tea is hermetically sealed in foil-lined airtight craft pouches, locking in garden-fresh flavor until the moment you steep your cup.",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-white border-t border-stone-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-xl space-y-2">
            <span className="text-xs font-mono tracking-widest uppercase text-emerald-800 font-bold">
              The Journey of the Leaf
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
              From Alpine Mountain to Pure Pour.
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md leading-relaxed">
            Every step is a harmonious dialogue between nature, time, and ancestral garden craftsmanship. Here is how your leaves make their way into your cup.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="bg-stone-50/70 border border-stone-200/80 rounded-2xl p-5 relative flex flex-col justify-between hover:bg-white hover:border-emerald-300 hover:shadow-sm transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-mono font-bold text-stone-300 group-hover:text-emerald-700 transition">
                      {s.number}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-700 group-hover:text-emerald-700 group-hover:border-emerald-200 transition">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-stone-900 mb-0.5">{s.title}</h3>
                  <p className="text-[11px] font-mono text-emerald-800 font-medium mb-2">{s.subtitle}</p>
                  <p className="text-xs text-stone-600 leading-relaxed">{s.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200/60 text-[10px] font-mono text-stone-400">
                  Step {idx + 1} of 5
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function AboutImpactStats() {
  const stats = [
    { value: "4,500+", unit: "FT", label: "Average Garden Elevation", desc: "High alpine estates with morning mist" },
    { value: "100%", unit: "PURITY", label: "Whole Leaf Authenticity", desc: "Zero dust, sweepings, or artificial extracts" },
    { value: "48", unit: "HOURS", label: "Harvest to Sealed Pouch", desc: "Locked-in fresh natural volatile terpenes" },
    { value: "35%", unit: "PREMIUM", label: "Above Fairtrade Minimums", desc: "Directly empowering mountain grower families" },
  ];

  return (
    <section className="py-16 sm:py-20 bg-emerald-950 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((item, idx) => (
            <div key={idx} className="space-y-1 text-center sm:text-left">
              <div className="flex items-baseline justify-center sm:justify-start gap-1">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-mono font-bold text-white tracking-tight">
                  {item.value}
                </span>
                <span className="text-xs font-mono font-semibold text-emerald-300">
                  {item.unit}
                </span>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-200">
                {item.label}
              </p>
              <p className="text-xs text-stone-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutFounderNote() {
  return (
    <section className="py-20 sm:py-28 bg-stone-50 border-t border-stone-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-stone-200/90 rounded-3xl p-8 sm:p-12 shadow-sm space-y-6 relative overflow-hidden">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-800 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            A Note from the Founders
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-stone-900 tracking-tight leading-snug">
            &ldquo;We Started Pure Pour Co. Because Tea Deserved Truth.&rdquo;
          </h2>

          <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
            <p>
              Growing up near the foothills of the Himalayas, tea was never a cardboard box off a supermarket shelf. It was the scent of wet mountain soil after rain, the crackle of firewood under a steaming kettle, and the vibrant golden liquor poured into earthen cups.
            </p>
            <p>
              When we saw how modern commercial brands stripped tea down to bitter dust mixed with artificial vanilla and spray aromas, we felt compelled to rebuild the bridge.
            </p>
            <p>
              <strong>Pure Pour Co.</strong> exists for those who cherish the ritual of slow brewing. Whether you seek the bold malty kick of an authentic Assam CTC with whole crushed cardamom, or the meditative muscatel subtleties of a high-grown Darjeeling, every leaf in your pouch represents uncompromised purity.
            </p>
          </div>

          <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-serif font-bold text-stone-900">The Pure Pour Co. Collective</p>
              <p className="text-xs text-stone-500 font-mono">Assam &amp; Darjeeling, India</p>
            </div>
            <span className="text-xs font-serif italic text-emerald-800">Pure Leaves. Pure Soul.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AboutCtaSection() {
  return (
    <section className="py-20 bg-white text-center border-t border-stone-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <span className="text-xs font-mono uppercase tracking-widest text-emerald-800 font-bold">
          Taste the Difference
        </span>

        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
          Ready to Experience Single-Origin Purity?
        </h2>

        <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
          Explore our garden-fresh releases, freshly packed and shipped directly from the mountain estates to your doorstep across India.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-brand-800 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition active:scale-95"
          >
            <span>Shop All Teas</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs sm:text-sm font-semibold rounded-xl transition border border-stone-200 shadow-2xs"
          >
            Browse Collections
          </Link>
        </div>
      </div>
    </section>
  );
}
