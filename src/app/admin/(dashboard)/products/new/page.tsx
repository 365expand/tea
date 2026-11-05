import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const admin = createSupabaseAdminClient();

  const [{ data: categories }, { data: ingredients }] = await Promise.all([
    admin
      .from("categories")
      .select("id, name, subcategories(id, name)")
      .order("display_order", { ascending: true }),
    admin
      .from("ingredients")
      .select("id, name")
      .order("name", { ascending: true }),
  ]);

  return (
    <ProductForm
      categories={(categories || []) as any}
      ingredients={ingredients || []}
    />
  );
}

