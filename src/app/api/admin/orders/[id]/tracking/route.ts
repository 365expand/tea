import { NextRequest, NextResponse } from "next/server";
import { getAdminContext, logActivity } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { formatCurrency } from "@/lib/utils";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const context = await getAdminContext();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const admin = createSupabaseAdminClient();

    // Fetch existing order
    const { data: currentOrder, error: fetchErr } = await admin
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !currentOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updates: Record<string, any> = {
      courier_name: body.courier_name || null,
      tracking_number: body.tracking_number || null,
      tracking_url: body.tracking_url || null,
      shipping_document_url: body.shipping_document_url || null,
    };

    let transitionedToShipped = false;
    const previousStatus = currentOrder.status;

    // If tracking number is set and status is not already shipped or delivered, advance to shipped
    if (
      body.tracking_number &&
      ["pending", "confirmed", "processing"].includes(currentOrder.status)
    ) {
      updates.status = "shipped";
      if (!currentOrder.shipped_at) {
        updates.shipped_at = new Date().toISOString();
      }
      transitionedToShipped = true;
    }

    const { data: updatedOrder, error } = await admin
      .from("orders")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    if (transitionedToShipped) {
      await admin.from("order_status_history").insert({
        order_id: id,
        from_status: previousStatus,
        to_status: "shipped",
        changed_by: context.user.id,
        note: `Dispatched via ${body.courier_name || "Courier"} (AWB: ${body.tracking_number})`,
      });
    }

    await logActivity({
      actorId: context.user.id,
      actorEmail: context.admin.email,
      action: "update_order_tracking",
      entityType: "order",
      entityId: id,
      description: `Updated tracking info for order ${updatedOrder.order_number}: ${body.courier_name} (${body.tracking_number})${
        transitionedToShipped ? " -> Status changed to Shipped" : ""
      }`,
    });

    // Send shipping notification email
    if (transitionedToShipped && updatedOrder.customer_email) {
      const { data: tmpl } = await admin
        .from("email_templates")
        .select("*")
        .eq("key", "order_shipped")
        .eq("is_active", true)
        .maybeSingle();

      if (tmpl) {
        const renderedSubject = tmpl.subject
          .replace(/{{order_number}}/g, updatedOrder.order_number)
          .replace(/{{customer_name}}/g, updatedOrder.customer_name);

        const renderedBody = tmpl.body_html
          .replace(/{{order_number}}/g, updatedOrder.order_number)
          .replace(/{{customer_name}}/g, updatedOrder.customer_name)
          .replace(/{{grand_total}}/g, formatCurrency(updatedOrder.grand_total))
          .replace(/{{order_total}}/g, formatCurrency(updatedOrder.grand_total))
          .replace(/{{courier_name}}/g, updatedOrder.courier_name || "Courier")
          .replace(/{{tracking_number}}/g, updatedOrder.tracking_number || "—")
          .replace(/{{tracking_url}}/g, updatedOrder.tracking_url || "#");

        sendEmail({
          to: updatedOrder.customer_email,
          subject: renderedSubject,
          bodyHtml: renderedBody,
        }).catch((err) => console.error("Email notification failed:", err));
      }
    }

    return NextResponse.json({ order: updatedOrder });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
