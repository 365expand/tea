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
    const newStatus = body.status;
    const newPaymentStatus = body.payment_status;
    const isSyncAction = Boolean(body.sync_online_payment);
    const note = body.note || (newPaymentStatus ? `Payment marked as ${newPaymentStatus}` : `Status changed to ${newStatus}`);

    const admin = createSupabaseAdminClient();

    // Fetch existing order
    const { data: order, error: fetchErr } = await admin
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", id)
      .single();

    if (fetchErr || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const previousStatus = order.status;
    const previousPaymentStatus = order.payment_status;

    const updateFields: any = {};
    let statusChanged = false;
    let paymentChanged = false;

    // 1. Process Order Status Change
    if (newStatus && newStatus !== previousStatus) {
      statusChanged = true;
      updateFields.status = newStatus;

      if (newStatus === "confirmed" && !order.confirmed_at) {
        updateFields.confirmed_at = new Date().toISOString();
      } else if (newStatus === "shipped" && !order.shipped_at) {
        updateFields.shipped_at = new Date().toISOString();
      } else if (newStatus === "delivered") {
        if (!order.delivered_at) updateFields.delivered_at = new Date().toISOString();

        // When order is marked as delivered, automatically mark as paid
        if (order.payment_status !== "paid" && (!newPaymentStatus || newPaymentStatus === "paid")) {
          updateFields.payment_status = "paid";
          paymentChanged = true;

          // Record collection transaction
          await admin.from("transactions").insert({
            order_id: id,
            type: order.payment_method === "cod" ? "cod_collection" : "payment",
            direction: "credit",
            amount: order.grand_total,
            description: `Payment auto-settled on delivery for order ${order.order_number}`,
            created_by: context.user.id,
          });
        }
      } else if (newStatus === "cancelled" && !order.cancelled_at) {
        updateFields.cancelled_at = new Date().toISOString();
        // If cancelling, restore stock
        if (previousStatus !== "cancelled") {
          for (const item of order.order_items || []) {
            if (item.product_id) {
              await admin.rpc("adjust_product_stock", {
                p_product_id: item.product_id,
                p_change: Math.abs(item.quantity),
                p_note: `Restocked on order cancellation (${order.order_number})`,
                p_actor: context.user.id,
              });
            }
          }
        }
      }
    }

    // 2. Process Payment Status Change
    if (newPaymentStatus && newPaymentStatus !== previousPaymentStatus) {
      paymentChanged = true;
      updateFields.payment_status = newPaymentStatus;

      // If manually marked as paid, record transaction if none exists yet
      if (newPaymentStatus === "paid" && previousPaymentStatus !== "paid") {
        const { data: existingTx } = await admin
          .from("transactions")
          .select("id")
          .eq("order_id", id)
          .eq("direction", "credit")
          .maybeSingle();

        if (!existingTx) {
          await admin.from("transactions").insert({
            order_id: id,
            type: order.payment_method === "cod" ? "cod_collection" : "payment",
            direction: "credit",
            amount: order.grand_total,
            description: `Manual payment status update to 'paid' for order ${order.order_number}`,
            created_by: context.user.id,
          });
        }
      }
    }

    // 3. Process Online Payment Sync
    if (isSyncAction && order.payment_method !== "cod") {
      // Check if existing transactions or razorpay captured
      const { data: existingTx } = await admin
        .from("transactions")
        .select("*")
        .eq("order_id", id)
        .eq("direction", "credit")
        .maybeSingle();

      if (existingTx) {
        updateFields.payment_status = "paid";
        paymentChanged = true;
      }
    }

    // If nothing changed, return existing order
    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ order, message: "No change detected" });
    }

    // Update the order in database
    const { data: updatedOrder, error: updateErr } = await admin
      .from("orders")
      .update(updateFields)
      .eq("id", id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 400 });
    }

    // Insert into status history
    await admin.from("order_status_history").insert({
      order_id: id,
      from_status: previousStatus,
      to_status: updateFields.status || previousStatus,
      changed_by: context.user.id,
      note: `${note}${paymentChanged ? ` (Payment: ${updateFields.payment_status})` : ""}`,
    });

    await logActivity({
      actorId: context.user.id,
      actorEmail: context.admin.email,
      action: statusChanged ? "update_order_status" : "update_order_payment_status",
      entityType: "order",
      entityId: id,
      description: `Order ${order.order_number} updated: Status=${updatedOrder.status}, Payment=${updatedOrder.payment_status}`,
    });

    // Send customer email notification on delivery or cancellation if status changed
    if (statusChanged && (newStatus === "delivered" || newStatus === "cancelled" || newStatus === "shipped")) {
      const templateKey =
        newStatus === "delivered"
          ? "order_delivered"
          : newStatus === "shipped"
          ? "order_shipped"
          : "order_cancelled";

      const { data: tmpl } = await admin
        .from("email_templates")
        .select("*")
        .eq("key", templateKey)
        .eq("is_active", true)
        .maybeSingle();

      if (tmpl && order.customer_email) {
        const renderedSubject = tmpl.subject
          .replace(/{{order_number}}/g, order.order_number)
          .replace(/{{customer_name}}/g, order.customer_name);

        const renderedBody = tmpl.body_html
          .replace(/{{order_number}}/g, order.order_number)
          .replace(/{{customer_name}}/g, order.customer_name)
          .replace(/{{grand_total}}/g, formatCurrency(order.grand_total))
          .replace(/{{order_total}}/g, formatCurrency(order.grand_total))
          .replace(/{{courier_name}}/g, updatedOrder.courier_name || "Courier")
          .replace(/{{tracking_number}}/g, updatedOrder.tracking_number || "—")
          .replace(/{{tracking_url}}/g, updatedOrder.tracking_url || "#");

        sendEmail({
          to: order.customer_email,
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
