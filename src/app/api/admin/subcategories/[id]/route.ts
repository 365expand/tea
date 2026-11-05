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
      .from("subcategories")
      .update({
        name: body.name,
        slug: body.slug,
        description_html: body.description_html || null,
        image_url: body.image_url || null,
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
      action: "update_subcategory",
      entityType: "subcategory",
      entityId: id,
      description: `Updated subcategory: ${data.name}`,
    });

    return NextResponse.json({ subcategory: data });
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

    const { error } = await admin.from("subcategories").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await logActivity({
      actorId: context.user.id,
      actorEmail: context.admin.email,
      action: "delete_subcategory",
      entityType: "subcategory",
      entityId: id,
      description: `Deleted subcategory: ${id}`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

