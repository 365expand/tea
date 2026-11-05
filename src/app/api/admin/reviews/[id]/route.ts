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

    const updateData: any = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.is_featured !== undefined) updateData.is_featured = Boolean(body.is_featured);
    if (body.admin_reply !== undefined) updateData.admin_reply = body.admin_reply;

    const { data: review, error } = await admin
      .from("reviews")
      .update(updateData)
      .eq("id", id)
      .select("*, products(id, name, slug)")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await logActivity({
      actorId: context.user.id,
      actorEmail: context.admin.email,
      action: "update_review",
      entityType: "review",
      entityId: id,
      description: `Updated review status/featured/reply for review ${id}`,
    });

    return NextResponse.json({ review });
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

    const { error } = await admin.from("reviews").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await logActivity({
      actorId: context.user.id,
      actorEmail: context.admin.email,
      action: "delete_review",
      entityType: "review",
      entityId: id,
      description: `Deleted review ${id}`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

