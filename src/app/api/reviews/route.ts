import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, customerName, customerEmail, rating, title, body: reviewText } = body;

    if (!productId || !customerName || !rating || !title || !reviewText) {
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 });
    }

    const cleanEmail = customerEmail ? customerEmail.trim().toLowerCase() : null;
    if (cleanEmail && !cleanEmail.includes("@")) {
      return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();

    // 1. Anti-spam check: prevent duplicate reviews from the same email for the same product within 10 minutes
    if (cleanEmail) {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { data: recentReview } = await admin
        .from("reviews")
        .select("id")
        .eq("product_id", productId)
        .eq("customer_email", cleanEmail)
        .gte("created_at", tenMinutesAgo)
        .maybeSingle();

      if (recentReview) {
        return NextResponse.json(
          { error: "You recently submitted a brew note for this tea. Please wait a bit before submitting another." },
          { status: 429 }
        );
      }
    }

    // 2. Verified Purchase detection: check if customer has a fulfilled order with this product
    let isVerifiedPurchase = false;
    if (cleanEmail) {
      const { data: orderItem } = await admin
        .from("order_items")
        .select("id, orders!inner(customer_email, status)")
        .eq("product_id", productId)
        .eq("orders.customer_email", cleanEmail)
        .in("orders.status", ["delivered", "shipped", "confirmed", "processing"])
        .limit(1)
        .maybeSingle();

      if (orderItem) {
        isVerifiedPurchase = true;
      }
    }

    const { data: review, error } = await admin
      .from("reviews")
      .insert({
        product_id: productId,
        customer_name: customerName.trim(),
        customer_email: cleanEmail,
        rating: Math.max(1, Math.min(5, Number(rating) || 5)),
        title: title.trim(),
        body: reviewText.trim(),
        status: "approved", // Live for immediate customer feedback
        is_verified_purchase: isVerifiedPurchase,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
