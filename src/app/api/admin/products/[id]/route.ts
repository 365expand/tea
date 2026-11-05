import { NextRequest, NextResponse } from "next/server";
import { getAdminContext, logActivity } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = createSupabaseAdminClient();

  const { data: product, error } = await admin
    .from("products")
    .select(`
      *,
      product_images(*),
      product_features(*),
      product_faqs(*),
      product_ingredients(*)
    `)
    .eq("id", id)
    .single();

  if (error || !product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ product });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const context = await getAdminContext();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const admin = createSupabaseAdminClient();

    // 1. Update product
    const { data: product, error: prodErr } = await admin
      .from("products")
      .update({
        name: body.name,
        slug: body.slug,
        sku: body.sku,
        featured_image_url: body.featured_image_url || null,
        video_url: body.video_url || null,
        regular_price: body.regular_price,
        sale_price: body.sale_price || null,
        net_quantity: body.net_quantity,
        category_id: body.category_id || null,
        subcategory_id: body.subcategory_id || null,
        short_description: body.short_description || null,
        description_html: body.description_html || null,
        stock_quantity: body.stock_quantity ?? 0,
        low_stock_threshold: body.low_stock_threshold ?? 5,
        tax_rate: body.tax_rate ?? 0,
        hsn_code: body.hsn_code || null,
        weight_grams: body.weight_grams || null,
        status: body.status || "draft",
        is_featured: Boolean(body.is_featured),
        seo_title: body.seo_title || null,
        seo_description: body.seo_description || null,
        seo_keywords: body.seo_keywords || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (prodErr) {
      return NextResponse.json({ error: prodErr.message }, { status: 400 });
    }

    // 2. Synchronize gallery images
    await admin.from("product_images").delete().eq("product_id", id);
    if (Array.isArray(body.gallery_images) && body.gallery_images.length > 0) {
      const imgRows = body.gallery_images.map((url: string, idx: number) => ({
        product_id: id,
        url,
        display_order: idx,
      }));
      await admin.from("product_images").insert(imgRows);
    }

    // 3. Synchronize features
    await admin.from("product_features").delete().eq("product_id", id);
    if (Array.isArray(body.features) && body.features.length > 0) {
      const featRows = body.features.map((f: any, idx: number) => ({
        product_id: id,
        title: f.title,
        description: f.description || "",
        display_order: idx,
      }));
      await admin.from("product_features").insert(featRows);
    }

    // 4. Synchronize FAQs
    await admin.from("product_faqs").delete().eq("product_id", id);
    if (Array.isArray(body.faqs) && body.faqs.length > 0) {
      const faqRows = body.faqs.map((faq: any, idx: number) => ({
        product_id: id,
        question: faq.question,
        answer: faq.answer,
        display_order: idx,
        is_active: true,
      }));
      await admin.from("product_faqs").insert(faqRows);
    }

    // 5. Synchronize ingredients
    await admin.from("product_ingredients").delete().eq("product_id", id);
    if (Array.isArray(body.ingredients) && body.ingredients.length > 0) {
      const ingRows = body.ingredients.map((ing: any, idx: number) => ({
        product_id: id,
        ingredient_id: ing.ingredient_id,
        notes: ing.notes || null,
        display_order: idx,
      }));
      await admin.from("product_ingredients").insert(ingRows);
    }

    await logActivity({
      actorId: context.user.id,
      actorEmail: context.admin.email,
      action: "update_product",
      entityType: "product",
      entityId: id,
      description: `Updated product: ${product.name}`,
    });

    return NextResponse.json({ product });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const context = await getAdminContext();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const admin = createSupabaseAdminClient();

    const { error } = await admin.from("products").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await logActivity({
      actorId: context.user.id,
      actorEmail: context.admin.email,
      action: "delete_product",
      entityType: "product",
      entityId: id,
      description: `Deleted product: ${id}`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

