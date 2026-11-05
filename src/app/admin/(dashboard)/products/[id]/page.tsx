import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createSupabaseAdminClient();

  const [
    { data: product },
    { data: categories },
    { data: ingredients },
  ] = await Promise.all([
    admin
      .from("products")
      .select(`
        *,
        product_images(*),
        product_features(*),
        product_faqs(*),
        product_ingredients(*)
      `)
      .eq("id", id)
      .single(),
    admin
      .from("categories")
      .select("id, name, subcategories(id, name)")
      .order("display_order", { ascending: true }),
    admin
      .from("ingredients")
      .select("id, name")
      .order("name", { ascending: true }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <ProductForm
      initialProduct={product}
      categories={(categories || []) as any}
      ingredients={ingredients || []}
    />
  );
}

