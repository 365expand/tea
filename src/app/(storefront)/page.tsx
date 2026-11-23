import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ProductCardData } from "@/components/storefront/ProductCard";
import { HomeHeroSlider } from "@/components/storefront/HomeHeroSlider";
import { HomeProductShowcase } from "@/components/storefront/HomeProductShowcase";
import { EstateParallaxSection } from "@/components/storefront/EstateParallaxSection";
import { ReserveClubSection } from "@/components/storefront/ReserveClubSection";
import { WhyUsSection } from "@/components/storefront/WhyUsSection";
import { HomeTestimonialsSection } from "@/components/storefront/HomeTestimonialsSection";
import {
  ShieldCheck,
  Truck,
  Leaf,
  Sparkles,
  PackageCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StorefrontHomePage() {
  const admin = createSupabaseAdminClient();

  const [
    { data: heroSliderRow },
    { data: products },
    { data: categories },
    { data: reviews },
  ] = await Promise.all([
    admin.from("settings").select("value").eq("key", "hero_slider").maybeSingle(),
    admin
      .from("products")
      .select(
        "id, name, slug, sku, featured_image_url, regular_price, sale_price, net_quantity, stock_quantity, is_featured, categories(name, slug), reviews(rating, status)"
      )
      .eq("status", "active")
      .order("is_featured", { ascending: false }),
    admin
      .from("categories")
      .select("id, name, slug, image_url, description_html")
      .eq("is_active", true)
      .order("display_order", { ascending: true }),
    admin
      .from("reviews")
      .select("id, customer_name, rating, title, body, created_at, products(name)")
      .eq("status", "approved")
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const activeCategories = (categories || []).map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    image_url: cat.image_url,
    description_html: cat.description_html,
  }));

  const activeProducts = (products || []) as unknown as ProductCardData[];
  const heroSlides = heroSliderRow?.value?.slides || [];

  return (
    <div className="pb-24 font-sans">
      {/* 1. IMAGE-ONLY HERO SLIDER (Configurable from Admin for Desktop & Mobile) */}
      <HomeHeroSlider slides={heroSlides} />

      {/* 2. BRAND ASSURANCE / FOUR-PILLAR TRUST STRIP */}
      <section className="border-y border-stone-200/80 bg-stone-50/70">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 py-4 sm:py-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-100/70 text-brand-800 flex items-center justify-center shrink-0">
                <Leaf className="w-5 h-5 text-brand-700" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-stone-900 font-sans">
                  Artisanal Whole Leaf
                </h4>
                <p className="text-[11px] text-stone-500">Carefully hand-plucked harvest</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-stone-900 font-sans">
                  Direct From Garden
                </h4>
                <p className="text-[11px] text-stone-500">Makaibari, Assam &amp; Nilgiri</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center shrink-0">
                <PackageCheck className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-stone-900 font-sans">
                  Nitrogen Fresh Pack
                </h4>
                <p className="text-[11px] text-stone-500">Multi-layer barrier protection</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-stone-200/70 text-stone-800 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 text-stone-700" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-stone-900 font-sans">
                  Pan-India Express
                </h4>
                <p className="text-[11px] text-stone-500">Fast, reliable insured courier</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-12 sm:space-y-20 pt-6 sm:pt-10">
        {/* 3. FEATURED PRODUCTS & CATEGORY TAB SHOWCASE (Collections slider removed per request) */}
        <HomeProductShowcase
          products={activeProducts}
          categories={activeCategories}
        />

        {/* 4. WHY US / THE TERROIR DISTINCTION SECTION */}
        <WhyUsSection />

        {/* 5. TERROIR SOURCING PARALLAX BANNER */}
        <EstateParallaxSection />

        {/* 6. VERIFIED CONNOISSEUR TESTIMONIALS (Modern, Dynamic, Mobile-Friendly) */}
        <HomeTestimonialsSection reviews={reviews as any} />

        {/* 7. THE RESERVE SOCIETY (Private cellar allocations & rare harvest alerts) */}
        <ReserveClubSection />
      </div>
    </div>
  );
}
