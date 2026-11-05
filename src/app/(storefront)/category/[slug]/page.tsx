import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ProductCard, ProductCardData } from "@/components/storefront/ProductCard";
import { ArrowLeft, ShoppingBag, Sparkles } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sub?: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const admin = createSupabaseAdminClient();
  const { data: category } = await admin
    .from("categories")
    .select("name, seo_title, seo_description")
    .eq("slug", slug)
    .single();

  if (!category) {
    return { title: "Collection | Pure Pour Co." };
  }

  return {
    title: category.seo_title || `${category.name} | Pure Pour Co.`,
    description:
      category.seo_description ||
      `Shop artisanal, single-origin ${category.name} ethically sourced from premier Indian tea gardens.`,
  };
}

export default async function CategoryDetailPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const sub = (await searchParams)?.sub;
  const admin = createSupabaseAdminClient();

  const { data: category } = await admin
    .from("categories")
    .select("*, subcategories(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!category) notFound();

  let prodQuery = admin
    .from("products")
    .select(
      "id, name, slug, sku, featured_image_url, regular_price, sale_price, net_quantity, stock_quantity, is_featured, subcategory_id, categories(name)"
    )
    .eq("category_id", category.id)
    .eq("status", "active")
    .order("is_featured", { ascending: false });

  if (sub) {
    const matchedSub = category.subcategories?.find((s: any) => s.slug === sub);
    if (matchedSub) {
      prodQuery = prodQuery.eq("subcategory_id", matchedSub.id);
    }
  }

  const { data: products } = await prodQuery;

  return (
    <div className="bg-stone-50 min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/categories"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Tea Collections</span>
          </Link>
        </div>

        {/* Hero Banner Header */}
        <div className="relative rounded-3xl overflow-hidden border border-stone-200/90 shadow-xs bg-stone-950 text-white">
          {category.image_url && (
            <div className="absolute inset-0 z-0">
              <img
                src={category.image_url}
                alt={category.name}
                className="w-full h-full object-cover object-center opacity-40 scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 to-transparent" />
            </div>
          )}

          <div className="relative z-10 p-8 sm:p-12 lg:p-16 max-w-3xl space-y-4">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-emerald-400">
              Artisanal Collection
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif text-white tracking-tight">
              {category.name}
            </h1>
            {category.description_html && (
              <div
                className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-2xl"
                dangerouslySetInnerHTML={{ __html: category.description_html }}
              />
            )}
          </div>
        </div>

        {/* Subcategory Filter Bar */}
        {category.subcategories && category.subcategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200 scrollbar-none">
            <Link
              href={`/category/${category.slug}`}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition ${
                !sub
                  ? "bg-stone-900 text-white shadow-xs"
                  : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
              }`}
            >
              All {category.name}
            </Link>
            {category.subcategories.map((sc: any) => {
              const isActive = sub === sc.slug;
              return (
                <Link
                  key={sc.id}
                  href={`/category/${category.slug}?sub=${sc.slug}`}
                  className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition ${
                    isActive
                      ? "bg-stone-900 text-white shadow-xs"
                      : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
                  }`}
                >
                  {sc.name}
                </Link>
              );
            })}
          </div>
        )}

        {/* Products Grid */}
        {!products || products.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-3xl p-16 text-center space-y-3 shadow-xs max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-serif font-medium text-stone-900">
              No teas currently in this harvest selection
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Check back soon as new seasonal estate flushes arrive from Assam and Darjeeling.
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition shadow-xs"
              >
                Browse All Harvests
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
      </div>
    </div>
  );
}
