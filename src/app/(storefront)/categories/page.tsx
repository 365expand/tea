import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getPublicSettings } from "@/lib/settings";
import { CategoriesClient, CategoryItem } from "./CategoriesClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Artisanal Tea Collections | Pure Pour Co.",
  description:
    "Explore single-origin black teas, high-mountain green leaves, aromatic whole-spice chais, and delicate silver needle white teas.",
};

export default async function CategoriesOverviewPage() {
  const admin = createSupabaseAdminClient();

  const [{ data: categories }, publicSettings] = await Promise.all([
    admin
      .from("categories")
      .select("*, subcategories(*), products(id, status)")
      .eq("is_active", true)
      .order("display_order", { ascending: true }),
    getPublicSettings(),
  ]);

  return (
    <CategoriesClient
      categories={(categories as unknown as CategoryItem[]) || []}
      tagline={publicSettings.general?.tagline}
    />
  );
}
