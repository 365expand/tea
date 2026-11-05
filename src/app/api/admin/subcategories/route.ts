import { NextRequest, NextResponse } from "next/server";
import { getAdminContext, logActivity } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const context = await getAdminContext();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const admin = createSupabaseAdminClient();

    const { data, error } = await admin
      .from("subcategories")
      .insert({
        category_id: body.category_id,
        name: body.name,
        slug: body.slug,
        description_html: body.description_html || null,
        image_url: body.image_url || null,
        display_order: Number(body.display_order) || 0,
        is_active: Boolean(body.is_active),
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await logActivity({
      actorId: context.user.id,
      actorEmail: context.admin.email,
      action: "create_subcategory",
      entityType: "subcategory",
      entityId: data.id,
      description: `Created subcategory: ${data.name}`,
    });

    return NextResponse.json({ subcategory: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

