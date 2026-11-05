import { NextRequest, NextResponse } from "next/server";
import { getAdminContext, logActivity } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function PUT(req: NextRequest) {
  const context = await getAdminContext();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const admin = createSupabaseAdminClient();

    const { data: template, error } = await admin
      .from("email_templates")
      .update({
        subject: body.subject,
        body_html: body.body_html,
        is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
      })
      .eq("key", body.key)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await logActivity({
      actorId: context.user.id,
      actorEmail: context.admin.email,
      action: "update_email_template",
      entityType: "email_template",
      entityId: body.key,
      description: `Updated email template: ${body.key}`,
    });

    return NextResponse.json({ template });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

