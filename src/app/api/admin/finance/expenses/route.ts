import { NextRequest, NextResponse } from "next/server";
import { getAdminContext, logActivity } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const context = await getAdminContext();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const admin = createSupabaseAdminClient();

    const { data: expense, error } = await admin
      .from("expenses")
      .insert({
        category: body.category || "General",
        description: body.description,
        amount: parseFloat(body.amount) || 0,
        expense_date: body.expense_date || new Date().toISOString().split("T")[0],
        receipt_url: body.receipt_url || null,
        created_by: context.user.id,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Also record in transactions as debit
    await admin.from("transactions").insert({
      type: "expense",
      direction: "debit",
      amount: expense.amount,
      description: `Expense (${expense.category}): ${expense.description}`,
      created_by: context.user.id,
    });

    await logActivity({
      actorId: context.user.id,
      actorEmail: context.admin.email,
      action: "record_expense",
      entityType: "expense",
      entityId: expense.id,
      description: `Recorded expense of ₹${expense.amount}: ${expense.description}`,
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

