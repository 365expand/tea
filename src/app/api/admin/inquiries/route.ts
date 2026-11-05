import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAdminContext } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const context = await getAdminContext();
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const supabase = createSupabaseAdminClient();
    let query = supabase
      .from("contact_inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (status && ["unread", "read", "replied", "archived"].includes(status)) {
      query = query.eq("status", status);
    }

    const { data: inquiries, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ inquiries: inquiries || [] });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch inquiries" },
      { status: 500 }
    );
  }
}

