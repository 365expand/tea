import { NextRequest, NextResponse } from "next/server";
import { getAdminContext, logActivity } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function PUT(req: NextRequest) {
  const context = await getAdminContext();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { fullName, email, password } = await req.json();
    const admin = createSupabaseAdminClient();

    const authUpdates: any = {};
    if (password && password.length >= 6) {
      authUpdates.password = password;
    }

    const trimmedEmail = email ? email.trim().toLowerCase() : null;
    if (trimmedEmail && trimmedEmail !== context.user.email?.toLowerCase()) {
      authUpdates.email = trimmedEmail;
      authUpdates.email_confirm = true; // Auto-confirm for admin updates
    }

    // 1. Update Supabase Auth if password or email changed
    if (Object.keys(authUpdates).length > 0) {
      const { error: authErr } = await admin.auth.admin.updateUserById(
        context.user.id,
        authUpdates
      );
      if (authErr) return NextResponse.json({ error: authErr.message }, { status: 400 });
    }

    // 2. Update admin profile in admin_users table
    const profileUpdates: any = {};
    if (fullName !== undefined) {
      profileUpdates.full_name = fullName.trim();
    }
    if (trimmedEmail) {
      profileUpdates.email = trimmedEmail;
    }

    if (Object.keys(profileUpdates).length > 0) {
      const { error: profileErr } = await admin
        .from("admin_users")
        .update(profileUpdates)
        .eq("user_id", context.user.id);
      if (profileErr) return NextResponse.json({ error: profileErr.message }, { status: 400 });
    }

    await logActivity({
      actorId: context.user.id,
      actorEmail: trimmedEmail || context.admin.email,
      action: "update_admin_account",
      entityType: "admin_user",
      entityId: context.user.id,
      description: `Admin updated account profile (${fullName || ""}, ${trimmedEmail || ""})`,
    });

    return NextResponse.json({
      success: true,
      email: trimmedEmail || context.admin.email,
      fullName: fullName || context.admin.full_name,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
