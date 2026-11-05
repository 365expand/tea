import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAdminContext } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await getAdminContext();
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.question !== undefined) {
      if (!body.question || typeof body.question !== "string" || !body.question.trim()) {
        return NextResponse.json({ error: "Question cannot be empty" }, { status: 400 });
      }
      updatePayload.question = body.question.trim();
    }

    if (body.answer !== undefined) {
      if (!body.answer || typeof body.answer !== "string" || !body.answer.trim()) {
        return NextResponse.json({ error: "Answer cannot be empty" }, { status: 400 });
      }
      updatePayload.answer = body.answer.trim();
    }

    if (body.display_order !== undefined) {
      updatePayload.display_order = Number(body.display_order) || 0;
    }

    if (body.is_active !== undefined) {
      updatePayload.is_active = Boolean(body.is_active);
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("faqs")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ faq: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update FAQ" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await getAdminContext();
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("faqs").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete FAQ" }, { status: 500 });
  }
}

