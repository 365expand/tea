import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const context = await getAdminContext();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createSupabaseAdminClient();
  const { data: transactions } = await admin
    .from("transactions")
    .select("*, orders(order_number)")
    .order("occurred_at", { ascending: false });

  const rows = [
    ["Transaction ID", "Date", "Type", "Direction", "Amount (INR)", "Order Ref", "Description"],
    ...(transactions || []).map((t) => [
      t.id,
      new Date(t.occurred_at).toISOString(),
      t.type,
      t.direction,
      t.amount,
      t.orders?.order_number || "",
      `"${(t.description || "").replace(/"/g, '""')}"`,
    ]),
  ];

  const csv = rows.map((r) => r.join(",")).join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="transactions_${Date.now()}.csv"`,
    },
  });
}

