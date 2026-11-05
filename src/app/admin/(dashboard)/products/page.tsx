import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ProductListManager, ProductRow } from "@/components/admin/ProductListManager";

export const dynamic = "force-dynamic";

interface ProductsPageProps {
  searchParams: Promise<{ stock?: string; status?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const sp = (await searchParams) || {};
  const admin = createSupabaseAdminClient();

  const [{ data: products }, { data: categories }] = await Promise.all([
    admin
      .from("products")
      .select("*, categories(name), subcategories(name)")
      .order("created_at", { ascending: false }),
    admin
      .from("categories")
      .select("id, name")
      .order("display_order", { ascending: true }),
  ]);

  return (
    <ProductListManager
      initialProducts={(products || []) as ProductRow[]}
      categories={categories || []}
      initialStockFilter={sp.stock || "all"}
      initialStatusFilter={sp.status || "all"}
    />
  );
}

