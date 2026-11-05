import { NextRequest, NextResponse } from "next/server";
import { getAdminContext, logActivity } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

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

    const { data, error } = await admin
      .from("categories")
      .update({
        name: body.name,
        slug: body.slug,
        description_html: body.description_html || null,
        image_url: body.image_url || null,
        seo_title: body.seo_title || null,
        seo_description: body.seo_description || null,
        seo_keywords: body.seo_keywords || null,
        display_order: Number(body.display_order) || 0,
        is_active: Boolean(body.is_active),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await logActivity({
      actorId: context.user.id,
      actorEmail: context.admin.email,
      action: "update_category",
      entityType: "category",
      entityId: id,
      description: `Updated category: ${data.name}`,
    });

    return NextResponse.json({ category: data });
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

    // 1. Check if category exists
    const { data: category } = await admin
      .from("categories")
      .select("id, name")
      .eq("id", id)
      .single();

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // 2. Check for assigned products to prevent foreign key errors
    const { count: productCount } = await admin
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("category_id", id);

    if (productCount && productCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete "${category.name}": ${productCount} active tea ${
            productCount === 1 ? "product is" : "products are"
          } assigned to this category. Please reassign them to another category first.`,
        },
        { status: 400 }
      );
    }

    // 3. Delete category
    const { error } = await admin.from("categories").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await logActivity({
      actorId: context.user.id,
      actorEmail: context.admin.email,
      action: "delete_category",
      entityType: "category",
      entityId: id,
      description: `Deleted category: ${category.name}`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
