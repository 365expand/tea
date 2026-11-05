import { NextRequest, NextResponse } from "next/server";
import { getAdminContext, logActivity } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("category");
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const admin = createSupabaseAdminClient();
  let query = admin
    .from("products")
    .select("*, categories(name), subcategories(name)")
    .order("created_at", { ascending: false });

  if (categoryId) query = query.eq("category_id", categoryId);
  if (status && status !== "all") query = query.eq("status", status);
  if (search) query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data });
}

export async function POST(req: NextRequest) {
  const context = await getAdminContext();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const admin = createSupabaseAdminClient();

    // 1. Insert product
    const { data: product, error: prodErr } = await admin
      .from("products")
      .insert({
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
      .select()
      .single();

    if (prodErr) {
      return NextResponse.json({ error: prodErr.message }, { status: 400 });
    }

    const productId = product.id;

    // 2. Insert gallery images
    if (Array.isArray(body.gallery_images) && body.gallery_images.length > 0) {
      const imgRows = body.gallery_images.map((url: string, idx: number) => ({
        product_id: productId,
        url,
        display_order: idx,
      }));
      await admin.from("product_images").insert(imgRows);
    }

    // 3. Insert features
    if (Array.isArray(body.features) && body.features.length > 0) {
      const featRows = body.features.map((f: any, idx: number) => ({
        product_id: productId,
        title: f.title,
        description: f.description || "",
        display_order: idx,
      }));
      await admin.from("product_features").insert(featRows);
    }

    // 4. Insert FAQs
    if (Array.isArray(body.faqs) && body.faqs.length > 0) {
      const faqRows = body.faqs.map((faq: any, idx: number) => ({
        product_id: productId,
        question: faq.question,
        answer: faq.answer,
        display_order: idx,
        is_active: true,
      }));
      await admin.from("product_faqs").insert(faqRows);
    }

    // 5. Insert ingredients
    if (Array.isArray(body.ingredients) && body.ingredients.length > 0) {
      const ingRows = body.ingredients.map((ing: any, idx: number) => ({
        product_id: productId,
        ingredient_id: ing.ingredient_id,
        notes: ing.notes || null,
        display_order: idx,
      }));
      await admin.from("product_ingredients").insert(ingRows);
    }

    await logActivity({
      actorId: context.user.id,
      actorEmail: context.admin.email,
      action: "create_product",
      entityType: "product",
      entityId: productId,
      description: `Created product: ${product.name} (SKU: ${product.sku})`,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

