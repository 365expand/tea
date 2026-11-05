import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ProductCardData } from "@/components/storefront/ProductCard";
import { HomeHeroSequence } from "@/components/storefront/HomeHeroSequence";
import { CategorySlider } from "@/components/storefront/CategorySlider";
import { HomeProductShowcase } from "@/components/storefront/HomeProductShowcase";
import { EstateParallaxSection } from "@/components/storefront/EstateParallaxSection";
import { ReserveClubSection } from "@/components/storefront/ReserveClubSection";
import {
  ShieldCheck,
  Truck,
  Leaf,
  Sparkles,
  Star,
  CheckCircle2,
  ArrowRight,
  PackageCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StorefrontHomePage() {
  const admin = createSupabaseAdminClient();

  const [
    { data: products },
    { data: categories },
    { data: reviews },
  ] = await Promise.all([
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

  return (
    <div className="pb-24">
      {/* 1. CINEMATIC SCROLL-DRIVEN 2026 HERO */}
      <HomeHeroSequence />

      {/* 2. BRAND ASSURANCE / FOUR-PILLAR TRUST STRIP */}
      <section className="border-y border-stone-200/80 bg-stone-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-100/70 text-brand-800 flex items-center justify-center shrink-0">
                <Leaf className="w-5 h-5 text-brand-700" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-stone-900 font-serif">
                  100% Whole Leaf
                </h4>
                <p className="text-[11px] text-stone-500">Zero dust or sweepings</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-stone-900 font-serif">
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
                <h4 className="text-xs sm:text-sm font-bold text-stone-900 font-serif">
                  Nitrogen Fresh Pack
                </h4>
                <p className="text-[11px] text-stone-500">Multi-layer UV protection</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-stone-200/70 text-stone-800 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 text-stone-700" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-stone-900 font-serif">
                  Pan-India Express
                </h4>
                <p className="text-[11px] text-stone-500">Dispatched within 24 hours</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-12 sm:space-y-20 pt-8 sm:pt-14">
        {/* 3. HORIZONTAL CATEGORY SLIDER (Left-to-right scroll with ~3.5 cards) */}
        <CategorySlider categories={activeCategories} />

        {/* 4. FEATURED PRODUCTS & CATEGORY TAB SHOWCASE */}
        <HomeProductShowcase
          products={activeProducts}
          categories={activeCategories}
        />

        {/* 5. TERROIR SOURCING PARALLAX BANNER */}
        <EstateParallaxSection />

        {/* 6. VERIFIED CONNOISSEUR TESTIMONIALS */}
        {reviews && reviews.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-semibold tracking-widest uppercase text-stone-500 block mb-1">
                Customer Endorsements
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold text-stone-900 tracking-tight font-serif">
                What True Tea Drinkers Say
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1.5 font-light">
                Honest feedback from morning brew rituals across every corner of India.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-7 shadow-xs hover:border-brand-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-amber-500 gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-stone-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        Verified Buyer
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-stone-900 font-serif">
                      {rev.title}
                    </h4>

                    <p className="text-xs text-stone-600 leading-relaxed italic">
                      &ldquo;{rev.body}&rdquo;
                    </p>
                  </div>

                  <div className="pt-3.5 border-t border-stone-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-stone-900 block text-xs">
                        {rev.customer_name}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        Direct Purveyor
                      </span>
                    </div>
                    <span className="text-brand-800 font-medium text-[11px] truncate max-w-[140px] text-right">
                      {Array.isArray(rev.products)
                        ? (rev.products[0] as any)?.name
                        : (rev.products as any)?.name || "Reserve Flush"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom link to contact or feedback */}
            <div className="mt-10 text-center">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-stone-900 hover:bg-stone-800 active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition"
              >
                <span>Find Your Morning Tea</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>
        )}

        {/* 8. THE RESERVE SOCIETY (Private cellar allocations & rare harvest alerts) */}
        <ReserveClubSection />
      </div>
    </div>
  );
}
