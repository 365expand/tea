import React from "react";
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
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Mountain,
  Compass,
  Award,
} from "lucide-react";

export function AboutTerroirGallery() {
  const galleryItems = [
    {
      title: "Himalayan Alpine Terroir",
      subtitle: "Elevation 4,500 - 6,200 ft",
      location: "Darjeeling & Kangra Valley",
      description:
        "Perched amidst rolling sub-Himalayan ridges, our partner estates experience cold mountain mists, brisk alpine winds, and mineral-dense volcanic soil. The dramatic diurnal temperature shifts slow leaf maturation, concentrating natural aromatic terpenes.",
      image: "/images/about/himalayan_terroir_harvest.jpg",
      tag: "Estate Provenance",
    },
    {
      title: "Artisanal Solar Withering",
      subtitle: "Elevated Bamboo Troughs",
      location: "Upper Assam & Kurseong",
      description:
        "Immediately after morning plucking, whole orthodox shoots (two leaves and a tender bud) rest gently across elevated bamboo racks. Mountain breezes evaporate surface moisture naturally, preserving delicate essential oils without bruising the cellular structure.",
      image: "/images/about/artisanal_orthodox_withering.jpg",
      tag: "Handcrafted Method",
    },
    {
      title: "The Sommelier Cupping Ritual",
      subtitle: "ISO 3103 Standard Tasting",
      location: "Tasting Room, Siliguri",
      description:
        "Every seasonal micro-lot undergoes rigorous sensory evaluation. We assess wet leaf aroma, liquor luminosity, muscatel complexity, and mouthfeel density before approving an estate allocation for our cellar collection.",
      image: "/images/about/tea_master_cupping_ritual.jpg",
      tag: "Sensory Quality",
    },
    {
      title: "Whole Botanical Botanicals",
      subtitle: "Sun-Dried Garden Spices",
      location: "Idukki & Wayanad, Kerala",
      description:
        "We reject artificial flavor sprays, chemical vanillin, and sugar coatings. Our heritage chai blends use exclusively whole hand-cracked green cardamom, Ceylon cinnamon quills, clove buds, and dry ginger roots sourced directly from smallholder forest farms.",
      image: "/images/about/chai_botanical_spices.jpg",
      tag: "100% Pure Botanicals",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-stone-200/90">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 max-w-7xl mx-auto space-y-12 sm:space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/70 text-brand-900 text-[11px] font-semibold tracking-wider uppercase">
            <Compass className="w-3.5 h-3.5 text-brand-700" />
            Visual Provenance
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
            The Geography, Craft, &amp; Living Heritage
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
            Step behind the veil of industrial mass-market tea. Explore the mist-shrouded gardens, ancestral withering troughs, and meticulous cupping tables that shape every Pure Pour Co. harvest.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
          {galleryItems.map((item, idx) => (
            <div
              key={idx}
              className="bg-stone-50/70 rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group"
            >
              {/* Image Frame */}
              <div className="relative aspect-[16/10] overflow-hidden bg-stone-900">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-mono uppercase tracking-wider font-semibold border border-white/20">
                    {item.tag}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[11px] font-mono text-amber-300 block">
                    {item.location}
                  </span>
                  <h3 className="text-lg sm:text-xl font-serif font-bold leading-tight">
                    {item.title}
                  </h3>
                </div>
              </div>

              {/* Text Body */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-brand-800 tracking-wide block">
                    {item.subtitle}
                  </span>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-200/80 flex items-center justify-between text-[11px] text-stone-500 font-mono">
                  <span>Single-Lot Sourcing</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Origin
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutPillars() {
  const pillars = [
    {
      icon: Leaf,
      title: "Single-Estate Sourcing",
      subtitle: "Distinct Micro-Lots",
      description:
        "Every batch originates from carefully selected high-altitude estates in Assam and Darjeeling. We celebrate the authentic terroir of regional Himalayan gardens without dilution.",
      tag: "Pure Terroir",
    },
    {
      icon: ShieldCheck,
      title: "Natural Craftsmanship",
      subtitle: "Unadulterated Leaves",
      description:
        "We reject synthetic additives, chemical flavor sprays, and artificial colors. The nuanced fragrance in your cup stems genuinely from handcrafted tea leaves and sun-dried botanical spices.",
      tag: "Small Batch",
    },
    {
      icon: Clock,
      title: "Direct Garden Freshness",
      subtitle: "Preserved Terroir",
      description:
        "Bypassing prolonged holding warehouses, our freshly harvested leaves are promptly sealed in airtight multi-layer protective pouches to maintain their natural botanical vitality.",
      tag: "Estate Packed",
    },
    {
      icon: HeartHandshake,
      title: "Grower Equity & Care",
      subtitle: "Fair Partnerships",
      description:
        "We foster direct relationships with regional tea pluckers and estate workers, promoting sustainable mountain agriculture and respectful, transparent compensation.",
      tag: "Ethical Trade",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-stone-50/70 border-t border-stone-200/80">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-900 text-[11px] font-semibold tracking-wider uppercase">
            <Award className="w-3.5 h-3.5 text-emerald-700" />
            The Pure Pour Standard
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-stone-900">
            Four Pillars of Uncompromised Quality
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
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
                  <p className="text-xs text-stone-600 leading-relaxed font-light">{p.description}</p>
                </div>

                <div className="pt-5 border-t border-stone-100 mt-5 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Artisanal Provenance
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
    <section className="py-16 sm:py-24 bg-white border-t border-stone-200/80">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="max-w-xl space-y-2">
            <span className="text-xs font-mono tracking-widest uppercase text-emerald-800 font-bold">
              The Journey of the Leaf
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
              From Alpine Mountain to Pure Pour
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md leading-relaxed font-light">
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
                  <p className="text-xs text-stone-600 leading-relaxed font-light">{s.description}</p>
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
    { value: "WHOLE", unit: "LEAF", label: "Artisanal Selection", desc: "Hand-sorted unbroken leaves & whole spices" },
    { value: "FRESH", unit: "SEAL", label: "Sealed At Harvest", desc: "Locking in natural aromatic volatile oils" },
    { value: "DIRECT", unit: "TRADE", label: "Grower Equity", desc: "Directly partnering with mountain grower families" },
  ];

  return (
    <section className="py-16 sm:py-20 bg-brand-950 text-white">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((item, idx) => (
            <div key={idx} className="space-y-1 text-center sm:text-left">
              <div className="flex items-baseline justify-center sm:justify-start gap-1">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-mono font-bold text-white tracking-tight">
                  {item.value}
                </span>
                <span className="text-xs font-mono font-semibold text-amber-300">
                  {item.unit}
                </span>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-200">
                {item.label}
              </p>
              <p className="text-xs text-stone-400 font-light">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutFounderNote() {
  return (
    <section className="py-16 sm:py-24 bg-stone-50/70 border-t border-stone-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-stone-200/90 rounded-3xl p-8 sm:p-12 shadow-sm space-y-6 relative overflow-hidden">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-800 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            A Note from the Founders
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-stone-900 tracking-tight leading-snug">
            &ldquo;We Started Pure Pour Co. Because Tea Deserved Truth.&rdquo;
          </h2>

          <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed font-sans font-light">
            <p>
              Growing up near the foothills of the Himalayas, tea was never a cardboard box off a supermarket shelf. It was the scent of wet mountain soil after rain, the crackle of firewood under a steaming kettle, and the vibrant golden liquor poured into earthen cups.
            </p>
            <p>
              When we saw how modern commercial brands stripped tea down to bitter dust mixed with artificial vanilla and chemical spray aromas, we felt compelled to rebuild the bridge.
            </p>
            <p>
              <strong>Pure Pour Co.</strong> exists for those who cherish the ritual of slow brewing. Whether you seek the bold malty kick of an authentic Assam orthodox with whole crushed cardamom, or the meditative muscatel subtleties of a high-grown Darjeeling, every leaf in your pouch represents uncompromised purity.
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
    <section className="py-16 sm:py-24 bg-white text-center border-t border-stone-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <span className="text-xs font-mono uppercase tracking-widest text-brand-800 font-bold">
          Taste the Difference
        </span>

        <h2 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
          Ready to Experience Single-Origin Purity?
        </h2>

        <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto leading-relaxed font-light">
          Explore our garden-fresh releases, freshly packed and shipped directly from the mountain estates to your doorstep across India.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-stone-900 hover:bg-stone-800 active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-full shadow-md transition"
          >
            <span>Shop All Single-Estate Teas</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs sm:text-sm font-semibold rounded-full transition border border-stone-200"
          >
            Concierge &amp; Gifting
          </Link>
        </div>
      </div>
    </section>
  );
}
