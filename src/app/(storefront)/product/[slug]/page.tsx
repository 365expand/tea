import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ProductDetailClient } from "@/components/storefront/ProductDetailClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const raw = (await params)?.slug;
  if (!raw) return { title: "Artisanal Tea | Pure Pour Co." };
  const slug = decodeURIComponent(raw).trim();

  const admin = createSupabaseAdminClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

  let query = admin.from("products").select("name, seo_title, seo_description, short_description");
  if (isUuid) {
    query = query.eq("id", slug);
  } else {
    query = query.eq("slug", slug);
  }

  const { data: product } = await query.maybeSingle();

  if (!product) return { title: "Product Not Found | Pure Pour Co." };

  return {
    title: product.seo_title || `${product.name} | Pure Pour Co.`,
    description: product.seo_description || product.short_description || undefined,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const raw = (await params)?.slug;
  if (!raw) notFound();
  const slug = decodeURIComponent(raw).trim();
  const admin = createSupabaseAdminClient();

  // Fetch product by slug, or fallback to UUID id
  let { data: product } = await admin
    .from("products")
    .select(`
      *,
      categories(name, slug),
      subcategories(name, slug),
      product_images(url, display_order),
      product_features(title, description, display_order),
      product_faqs(question, answer, display_order),
      product_ingredients(notes, ingredients(name, image_url, short_description))
    `)
    .eq("slug", slug)
    .maybeSingle();

  // If not found by slug, try matching id (uuid)
  if (!product && slug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    const res = await admin
      .from("products")
      .select(`
        *,
        categories(name, slug),
        subcategories(name, slug),
        product_images(url, display_order),
        product_features(title, description, display_order),
        product_faqs(question, answer, display_order),
        product_ingredients(notes, ingredients(name, image_url, short_description))
      `)
      .eq("id", slug)
      .maybeSingle();
    product = res.data;
  }

  if (!product || product.status === "archived") {
    notFound();
  }

  // Fetch approved reviews for this product
  const { data: reviews } = await admin
    .from("reviews")
    .select("*")
    .eq("product_id", product.id)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  // Fetch related active products
  const { data: relatedProducts } = await admin
    .from("products")
    .select(`
      id,
      name,
      slug,
      regular_price,
      sale_price,
      featured_image_url,
      net_quantity,
      short_description,
      categories(name, slug)
    `)
    .eq("status", "active")
    .neq("id", product.id)
    .limit(3);

  // Format images array
  const gallery = (product.product_images || [])
    .sort((a: any, b: any) => a.display_order - b.display_order)
    .map((img: any) => img.url);

  const allImages = [
    ...(product.featured_image_url ? [product.featured_image_url] : []),
    ...gallery.filter((url: string) => url !== product.featured_image_url),
  ];

  // Format features
  const features = (product.product_features || []).sort(
    (a: any, b: any) => a.display_order - b.display_order
  );

  // Format FAQs
  const faqs = (product.product_faqs || []).sort(
    (a: any, b: any) => a.display_order - b.display_order
  );

  // Format ingredients
  const ingredients = (product.product_ingredients || []).map((pi: any) => ({
    name: pi.ingredients?.name,
    image_url: pi.ingredients?.image_url,
    short_description: pi.ingredients?.short_description,
    notes: pi.notes,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <ProductDetailClient
        product={product}
        images={allImages}
        features={features}
        faqs={faqs}
        ingredients={ingredients}
        reviews={reviews || []}
        relatedProducts={relatedProducts || []}
      />
    </div>
  );
}
