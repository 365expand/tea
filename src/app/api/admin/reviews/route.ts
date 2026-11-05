import { NextRequest, NextResponse } from "next/server";
import { getAdminContext, logActivity } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const productId = searchParams.get("productId");

  const admin = createSupabaseAdminClient();
  let query = admin
    .from("reviews")
    .select("*, products(id, name, slug)")
    .order("created_at", { ascending: false });

  if (status && status !== "all") query = query.eq("status", status);
  if (productId && productId !== "all") query = query.eq("product_id", productId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reviews: data });
}

export async function POST(req: NextRequest) {
  const context = await getAdminContext();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const admin = createSupabaseAdminClient();

    const { data: review, error } = await admin
      .from("reviews")
      .insert({
        product_id: body.product_id,
        customer_name: body.customer_name,
        customer_email: body.customer_email || null,
        rating: Math.max(1, Math.min(5, Number(body.rating) || 5)),
        title: body.title || null,
        body: body.body || null,
        images: body.images || [],
        status: body.status || "approved",
        is_featured: Boolean(body.is_featured),
        is_verified_purchase: Boolean(body.is_verified_purchase),
      })
      .select("*, products(id, name, slug)")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await logActivity({
      actorId: context.user.id,
      actorEmail: context.admin.email,
      action: "create_manual_review",
      entityType: "review",
      entityId: review.id,
      description: `Added manual review for product ${body.product_id}`,
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

