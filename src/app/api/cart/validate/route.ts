import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json();
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ valid: true, updates: [] });
    }

    const admin = createSupabaseAdminClient();
    const productIds = items.map((i: any) => i.productId);

    const { data: dbProducts } = await admin
      .from("products")
      .select("id, name, regular_price, sale_price, stock_quantity, status")
      .in("id", productIds);

    const updates: any[] = [];
    let hasIssues = false;

    for (const item of items) {
      const db = dbProducts?.find((p) => p.id === item.productId);
      if (!db || db.status !== "active") {
        hasIssues = true;
        updates.push({
          productId: item.productId,
          available: false,
          issue: "Product is no longer available",
        });
        continue;
      }

      const currentPrice =
        db.sale_price !== null && db.sale_price !== undefined
          ? Number(db.sale_price)
          : Number(db.regular_price);

      const priceChanged = currentPrice !== item.price;
      const outOfStock = db.stock_quantity <= 0;
      const quantityExceeded = item.quantity > db.stock_quantity;

      if (priceChanged || outOfStock || quantityExceeded) {
        hasIssues = true;
        updates.push({
          productId: item.productId,
          available: !outOfStock,
          priceChanged,
          currentPrice,
          stockQuantity: db.stock_quantity,
          issue: outOfStock
            ? "Out of Stock"
            : quantityExceeded
            ? `Only ${db.stock_quantity} available`
            : priceChanged
            ? `Price updated to ₹${currentPrice}`
            : null,
        });
      }
    }

    return NextResponse.json({
      valid: !hasIssues,
      updates,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

