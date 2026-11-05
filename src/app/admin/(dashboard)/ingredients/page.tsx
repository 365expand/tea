import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { IngredientManager, Ingredient } from "@/components/admin/IngredientManager";

export const dynamic = "force-dynamic";

export default async function IngredientsPage() {
  const admin = createSupabaseAdminClient();

  const { data: ingredients } = await admin
    .from("ingredients")
    .select("*")
    .order("name", { ascending: true });

  return (
    <IngredientManager
      initialIngredients={(ingredients || []) as Ingredient[]}
    />
  );
}

