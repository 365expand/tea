import { NextRequest, NextResponse } from "next/server";
import { getAdminContext, logActivity } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("ingredients")
    .select("*")
    .order("name", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ingredients: data });
}

export async function POST(req: NextRequest) {
  const context = await getAdminContext();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const admin = createSupabaseAdminClient();

    const { data, error } = await admin
      .from("ingredients")
      .insert({
        name: body.name,
        slug: body.slug,
        image_url: body.image_url || null,
        short_description: body.short_description || null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await logActivity({
      actorId: context.user.id,
      actorEmail: context.admin.email,
      action: "create_ingredient",
      entityType: "ingredient",
      entityId: data.id,
      description: `Created ingredient: ${data.name}`,
    });

    return NextResponse.json({ ingredient: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

