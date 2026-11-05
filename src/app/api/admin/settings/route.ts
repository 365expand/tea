import { NextRequest, NextResponse } from "next/server";
import { getAdminContext, logActivity } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from("settings").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}

export async function PUT(req: NextRequest) {
  const context = await getAdminContext();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const admin = createSupabaseAdminClient();

    const { data, error } = await admin
      .from("settings")
      .upsert(
        {
          key: body.key,
          value: body.value,
          group_name: body.groupName || body.key,
          is_public: Boolean(body.isPublic),
        },
        { onConflict: "key" }
      )
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // If general favicon is updated, sync public/favicon.ico asynchronously
    if (body.key === "general" && body.value?.favicon_url) {
      try {
        const fs = await import("fs");
        const path = await import("path");
        const res = await fetch(body.value.favicon_url);
        if (res.ok) {
          const buf = Buffer.from(await res.arrayBuffer());
          fs.writeFileSync(path.join(process.cwd(), "public", "favicon.ico"), buf);
          fs.writeFileSync(path.join(process.cwd(), "public", "favicon.png"), buf);
        }
      } catch (e) {
        console.warn("Could not sync local favicon file:", e);
      }
    }

    await logActivity({
      actorId: context.user.id,
      actorEmail: context.admin.email,
      action: "update_settings",
      entityType: "settings",
      entityId: body.key,
      description: `Updated setting group: ${body.key}`,
    });

    return NextResponse.json({ setting: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

