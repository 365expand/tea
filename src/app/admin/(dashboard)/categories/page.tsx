import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { CategoryManager, Category } from "@/components/admin/CategoryManager";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const admin = createSupabaseAdminClient();

  const { data: categories } = await admin
    .from("categories")
    .select("*, subcategories(*)")
    .order("display_order", { ascending: true });

  return (
    <CategoryManager
      initialCategories={(categories || []) as Category[]}
    />
  );
}

