import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedReviews() {
  const { data: products } = await supabase.from("products").select("id, name");
  if (!products || products.length === 0) return;

  const sampleReviews = [
    {
      product_id: products[0].id,
      customer_name: "Aditya Verma",
      customer_email: "aditya@example.com",
      rating: 5,
      title: "Remarkable aroma and depth of flavor!",
      body: "This has become our family's morning staple. Exceptional quality compared to regular commercial store-bought brands.",
      is_verified_purchase: true,
      status: "approved",
      is_featured: true,
    },
    {
      product_id: products[0].id,
      customer_name: "Sneha Nair",
      customer_email: "sneha@example.com",
      rating: 5,
      title: "Clean, fresh, and authentically sourced",
      body: "You can immediately notice the difference in leaf quality. Perfectly balanced without any artificial bitterness.",
      is_verified_purchase: true,
      status: "approved",
      is_featured: true,
    },
  ];

  if (products.length > 1) {
    sampleReviews.push({
      product_id: products[1].id,
      customer_name: "Rohit Kulkarni",
      customer_email: "rohit@example.com",
      rating: 5,
      title: "Unmatched saffron and cardamom fragrance",
      body: "Brewing this Kahwa is like bringing Kashmir home. Truly authentic spices and soothing flavor.",
      is_verified_purchase: true,
      status: "approved",
      is_featured: true,
    });
  }

  const { error } = await supabase.from("reviews").upsert(sampleReviews, { onConflict: "id" });
  if (error) console.error("Error upserting reviews:", error);
  else console.log("✓ Sample verified reviews successfully added to public.reviews");
}

seedReviews().catch(console.error);

