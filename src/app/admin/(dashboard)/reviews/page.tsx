import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ReviewManager, ReviewItem } from "@/components/admin/ReviewManager";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const admin = createSupabaseAdminClient();

  const [{ data: reviews }, { data: products }] = await Promise.all([
    admin
      .from("reviews")
      .select("*, products(id, name, slug)")
      .order("created_at", { ascending: false }),
    admin
      .from("products")
      .select("id, name")
      .order("name", { ascending: true }),
  ]);

  return (
    <ReviewManager
      initialReviews={(reviews || []) as ReviewItem[]}
      products={products || []}
    />
  );
}

