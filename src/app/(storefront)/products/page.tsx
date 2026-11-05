import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ProductCard, ProductCardData } from "@/components/storefront/ProductCard";
import { ProductSortSelect } from "@/components/storefront/ProductSortSelect";
import {
  Search,
  ShoppingBag,
  Sparkles,
  Droplets,
  Thermometer,
  Clock,
  ShieldCheck,
  Leaf,
  Mountain,
  ArrowRight,
  Coffee,
} from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Artisanal Single-Origin Teas & Harvest Catalog | Pure Pour Co.",
  description:
    "Explore our complete collection of single-estate orthodox black teas, spring flush Darjeeling leaves, high-mountain greens, and handcrafted whole-spice masala chais.",
};

interface ProductsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    inStock?: string;
  }>;
}

export default async function ProductsCatalogPage({ searchParams }: ProductsPageProps) {
  const sp = (await searchParams) || {};
  const q = sp.q || "";
  const category = sp.category || "all";
  const sort = sp.sort || "featured";
  const inStock = sp.inStock || "false";
  const admin = createSupabaseAdminClient();

  // Fetch categories for filter pills
  const { data: categories } = await admin
    .from("categories")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  // Query products with reviews relation for live rating shorts
  let query = admin
    .from("products")
    .select(
      "id, name, slug, sku, featured_image_url, regular_price, sale_price, net_quantity, stock_quantity, is_featured, created_at, category_id, categories(name, slug), reviews(rating, status)"
    )
    .eq("status", "active");

  if (category && category !== "all") {
    const matchedCategory = categories?.find((c) => c.slug === category);
    if (matchedCategory) {
      query = query.eq("category_id", matchedCategory.id);
    }
  }

  if (q.trim()) {
    query = query.or(`name.ilike.%${q.trim()}%,short_description.ilike.%${q.trim()}%`);
  }

  if (inStock === "true") {
    query = query.gt("stock_quantity", 0);
  }

  // Sorting
  if (sort === "price_asc") {
    query = query.order("regular_price", { ascending: true });
  } else if (sort === "price_desc") {
    query = query.order("regular_price", { ascending: false });
  } else if (sort === "newest") {
    query = query.order("created_at", { ascending: false });
  } else {
    // Featured first
    query = query.order("is_featured", { ascending: false }).order("created_at", { ascending: false });
  }

  const { data: products } = await query;

  return (
    <div className="bg-stone-50 min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-200 pb-8">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-semibold tracking-widest text-emerald-800 uppercase">
              Pure Pour Co. &bull; Harvest Compendium
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-stone-900 tracking-tight leading-tight">
              Single-Origin Harvests &amp; House Blends
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pt-1">
              Pure whole-leaf orthodox teas and artisanal whole-spice chais ethically sourced from high-altitude gardens across Assam, Darjeeling, and Kashmir.
            </p>
          </div>

          {/* Sort & Search Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <form method="GET" action="/products" className="relative">
              <input type="hidden" name="category" value={category} />
              <input type="hidden" name="sort" value={sort} />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search harvest or blend..."
                className="pl-8 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900 w-48 sm:w-60 shadow-2xs transition"
              />
            </form>

            {/* Sort dropdown */}
            <ProductSortSelect currentSort={sort} />
          </div>
        </div>

        {/* Category Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Link
            href={`/products?category=all${q ? `&q=${q}` : ""}&sort=${sort}`}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition ${
              category === "all"
                ? "bg-stone-900 text-white shadow-xs"
                : "bg-white text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-stone-200"
            }`}
          >
            All Harvests ({products?.length || 0})
          </Link>
          {categories?.map((c) => {
            const isActive = category === c.slug;
            return (
              <Link
                key={c.id}
                href={`/products?category=${c.slug}${q ? `&q=${q}` : ""}&sort=${sort}`}
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition ${
                  isActive
                    ? "bg-stone-900 text-white shadow-xs"
                    : "bg-white text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-stone-200"
                }`}
              >
                {c.name}
              </Link>
            );
          })}
        </div>

        {/* Products Grid */}
        {!products || products.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-3xl p-16 text-center space-y-3 shadow-xs max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-serif font-medium text-stone-900">
              No matching teas found
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Try adjusting your search keywords or switching category filters.
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition shadow-xs"
              >
                Reset Catalog Filters
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7">
            {products.map((p) => (
              <ProductCard key={p.id} product={p as unknown as ProductCardData} />
            ))}
          </div>
        )}

        {/* Premium Brand Knowledge & Sourcing Guide Section */}
        <div className="pt-12 sm:pt-20 border-t border-stone-200 space-y-12 sm:space-y-16">
          {/* Header */}
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-semibold tracking-widest text-emerald-800 uppercase">
              Tasting &amp; Provenance Guide
            </p>
            <h2 className="text-2xl sm:text-4xl font-serif text-stone-900 tracking-tight">
              Understanding Our Harvest Seasons
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              The flavor, color, and aroma of whole leaf tea are deeply shaped by mountain elevation, rainfall, and seasonal flush cycles.
            </p>
          </div>

          {/* Three Harvest Season Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Spring Flush */}
            <div className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center">
                <Mountain className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block">
                  Spring Flush &bull; March to April
                </span>
                <h3 className="text-base font-serif font-semibold text-stone-900">
                  First Flush Darjeeling
                </h3>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Hand-plucked from tender spring buds emerging after winter dormancy. Yields a light, crystalline amber cup with vibrant floral muscatel notes and crisp astringency.
              </p>
              <div className="pt-2 text-[11px] font-mono text-stone-500 border-t border-stone-100 flex items-center justify-between">
                <span>Elevation: 1,800m+</span>
                <span className="text-emerald-700 font-medium">Light &amp; Aromatic</span>
              </div>
            </div>

            {/* Summer Flush */}
            <div className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center">
                <Leaf className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block">
                  Summer Flush &bull; May to June
                </span>
                <h3 className="text-base font-serif font-semibold text-stone-900">
                  Upper Assam Golden Orthodox
                </h3>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Grown in rich alluvial Brahmaputra valley soil under abundant summer monsoons. Renowned for velvety malty depth, golden tips, and full-bodied richness.
              </p>
              <div className="pt-2 text-[11px] font-mono text-stone-500 border-t border-stone-100 flex items-center justify-between">
                <span>Elevation: 120m – 300m</span>
                <span className="text-amber-800 font-medium">Bold &amp; Malty</span>
              </div>
            </div>

            {/* Artisan Spiced */}
            <div className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
              <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block">
                  House Recipes &bull; Year-Round
                </span>
                <h3 className="text-base font-serif font-semibold text-stone-900">
                  Artisan Spiced Chais &amp; Kahwa
                </h3>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Crushed orthodox leaves united with whole hand-crushed botanicals — Idukki green cardamom, Ceylon cinnamon quills, cloves, and Kashmiri saffron.
              </p>
              <div className="pt-2 text-[11px] font-mono text-stone-500 border-t border-stone-100 flex items-center justify-between">
                <span>100% Real Whole Spices</span>
                <span className="text-rose-700 font-medium">Warming &amp; Comforting</span>
              </div>
            </div>
          </div>

          {/* Steeping Parameters Chart */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-8 sm:p-10 shadow-xs">
            <div className="max-w-2xl mb-8 space-y-1.5">
              <span className="text-xs font-semibold tracking-widest text-emerald-800 uppercase">
                Brewing Standards
              </span>
              <h3 className="text-xl sm:text-2xl font-serif text-stone-900">
                Recommended Water Temperatures &amp; Steeping Times
              </h3>
              <p className="text-xs text-stone-500">
                Never scald delicate whole leaves with boiling water. Proper water temperature unlocks natural sweetness without bitterness.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-stone-100">
              {/* Green & White */}
              <div className="space-y-3 pt-4 md:pt-0 md:pr-6">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-xs text-stone-900">
                    Green &amp; White Teas
                  </span>
                </div>
                <div className="space-y-1 text-xs text-stone-600">
                  <p className="font-mono text-stone-900 font-bold text-sm">75&deg;C &ndash; 80&deg;C</p>
                  <p>2.5g (1 heaped teaspoon) per 150ml</p>
                  <p>Steep for 2 &ndash; 3 minutes &bull; 2 to 3 infusions</p>
                </div>
              </div>

              {/* Orthodox Black */}
              <div className="space-y-3 pt-4 md:pt-0 md:px-6">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-amber-600" />
                  <span className="font-semibold text-xs text-stone-900">
                    Single-Origin Black Orthodox
                  </span>
                </div>
                <div className="space-y-1 text-xs text-stone-600">
                  <p className="font-mono text-stone-900 font-bold text-sm">90&deg;C &ndash; 95&deg;C</p>
                  <p>2.5g per 150ml fresh water</p>
                  <p>Steep for 3 &ndash; 4 minutes &bull; Enjoy pure or with a dash of milk</p>
                </div>
              </div>

              {/* Kadak Chai */}
              <div className="space-y-3 pt-4 md:pt-0 md:pl-6">
                <div className="flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-rose-600" />
                  <span className="font-semibold text-xs text-stone-900">
                    Kadak CTC &amp; Masala Chai
                  </span>
                </div>
                <div className="space-y-1 text-xs text-stone-600">
                  <p className="font-mono text-stone-900 font-bold text-sm">100&deg;C (Rolling Boil)</p>
                  <p>3g tea simmered with 100ml water</p>
                  <p>Add 50ml fresh milk and simmer 2&ndash;3 minutes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sourcing Seal & Concierge Assistance Strip */}
          <div className="bg-stone-900 text-stone-100 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md border border-stone-800">
            <div className="space-y-1.5 text-center md:text-left">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Unsure Which Blend Suits Your Palate?
              </span>
              <h3 className="text-lg sm:text-xl font-serif text-white">
                Consult Our Dedicated Tea Sommelier
              </h3>
              <p className="text-xs text-stone-300 max-w-lg leading-relaxed">
                Whether you are selecting a daily morning chai or crafting custom corporate gifting hampers, our tea curators are ready to help.
              </p>
            </div>

            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold tracking-wider uppercase transition shadow-xs flex items-center gap-2 shrink-0"
            >
              <span>Contact Tea Concierge</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
