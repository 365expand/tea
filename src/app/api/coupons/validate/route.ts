import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json({ error: "Please enter a coupon code" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const orderSubtotal = Number(subtotal) || 0;

    const admin = createSupabaseAdminClient();
    const { data: coupon, error } = await admin
      .from("coupons")
      .select("*")
      .eq("code", cleanCode)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !coupon) {
      return NextResponse.json(
        { error: "Invalid or expired coupon code. Try WELCOME10, PUREPOUR50, or CHAI100" },
        { status: 400 }
      );
    }

    const now = new Date();
    if (coupon.start_date && new Date(coupon.start_date) > now) {
      return NextResponse.json({ error: "This coupon is not active yet" }, { status: 400 });
    }
    if (coupon.end_date && new Date(coupon.end_date) < now) {
      return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
    }

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return NextResponse.json({ error: "This coupon has reached its maximum usage limit" }, { status: 400 });
    }

    const minAmount = Number(coupon.min_order_amount || 0);
    if (orderSubtotal < minAmount) {
      return NextResponse.json(
        { error: `Minimum order value of ₹${minAmount} required to use coupon "${cleanCode}"` },
        { status: 400 }
      );
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discount_type === "percentage") {
      discountAmount = (orderSubtotal * Number(coupon.discount_value)) / 100;
      if (coupon.max_discount_amount && discountAmount > Number(coupon.max_discount_amount)) {
        discountAmount = Number(coupon.max_discount_amount);
      }
    } else {
      discountAmount = Math.min(orderSubtotal, Number(coupon.discount_value));
    }

    discountAmount = Math.round(discountAmount * 100) / 100;

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountAmount,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
      description: coupon.description,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

