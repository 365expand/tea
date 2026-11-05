import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const admin = createSupabaseAdminClient();

    if (body.isDefault) {
      await admin
        .from("customer_addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);
    }

    const { data: addr, error } = await admin
      .from("customer_addresses")
      .insert({
        user_id: user.id,
        full_name: body.fullName,
        phone: body.phone,
        line1: body.line1,
        line2: body.line2 || null,
        city: body.city,
        state: body.state,
        postal_code: body.postalCode,
        country: "India",
        is_default: Boolean(body.isDefault),
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ address: addr }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

