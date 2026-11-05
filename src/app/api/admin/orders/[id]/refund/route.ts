import { NextRequest, NextResponse } from "next/server";
import { getAdminContext, logActivity } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSecret, getSetting } from "@/lib/settings";
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
    const amount = parseFloat(body.amount);
    const reason = body.reason || "Customer requested refund";
    const restoreStock = Boolean(body.restore_stock);

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Valid refund amount is required" }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();

    // 1. Fetch order
    const { data: order, error: orderErr } = await admin
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", id)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    let providerRefundId = body.provider_refund_id || null;

    // 2. Automated Razorpay Refund Call if paid via Razorpay and credentials exist
    if (order.payment_method === "razorpay") {
      const [keySecret, paymentSettingsRaw] = await Promise.all([
        getSecret("razorpay_secret"),
        getSetting<Record<string, any>>("payment", {}),
      ]);

      const keyId = paymentSettingsRaw.razorpay_key_id;

      // Look up captured payment ID from payment_logs or transactions
      const { data: payLog } = await admin
        .from("payment_logs")
        .select("provider_payment_id")
        .eq("order_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const paymentId = payLog?.provider_payment_id;

      if (keyId && keySecret && paymentId && !paymentId.startsWith("mock_")) {
        try {
          const authString = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
          const rzpRes = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${authString}`,
            },
            body: JSON.stringify({
              amount: Math.round(amount * 100), // amount in paise
              notes: {
                reason,
                order_number: order.order_number,
              },
            }),
          });

          const rzpData = await rzpRes.json();
          if (rzpRes.ok && rzpData.id) {
            providerRefundId = rzpData.id;
          }
        } catch (rzpErr) {
          console.error("Razorpay automated refund API call failed:", rzpErr);
        }
      }
    }

    // 3. Insert into refunds table
    const { data: refund, error: refErr } = await admin
      .from("refunds")
      .insert({
        order_id: id,
        amount,
        reason,
        status: "processed",
        provider_refund_id: providerRefundId,
        processed_by: context.user.id,
        processed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (refErr) return NextResponse.json({ error: refErr.message }, { status: 400 });

    // 4. Record transaction in finance ledger
    await admin.from("transactions").insert({
      order_id: id,
      refund_id: refund.id,
      type: "refund",
      direction: "debit",
      amount,
      description: `Refund processed for order ${order.order_number}: ${reason}${
        providerRefundId ? ` (${providerRefundId})` : ""
      }`,
      created_by: context.user.id,
    });

    // 5. Update order payment status
    const newPaymentStatus = amount >= order.grand_total ? "refunded" : "partially_refunded";
    await admin
      .from("orders")
      .update({ payment_status: newPaymentStatus })
      .eq("id", id);

    // 6. Restock if requested
    if (restoreStock && Array.isArray(order.order_items)) {
      for (const item of order.order_items) {
        if (item.product_id) {
          await admin.rpc("adjust_product_stock", {
            p_product_id: item.product_id,
            p_change: Math.abs(item.quantity),
            p_note: `Restocked on order refund (${order.order_number})`,
            p_actor: context.user.id,
          });
        }
      }
    }

    // 7. Log status history
    await admin.from("order_status_history").insert({
      order_id: id,
      from_status: order.status,
      to_status: order.status,
      changed_by: context.user.id,
      note: `Processed refund of ${formatCurrency(amount)}. Reason: ${reason}`,
    });

    await logActivity({
      actorId: context.user.id,
      actorEmail: context.admin.email,
      action: "process_refund",
      entityType: "order",
      entityId: id,
      description: `Refunded ${formatCurrency(amount)} for order ${order.order_number}`,
    });

    // 8. Send refund email notification to customer
    if (order.customer_email) {
      sendEmail({
        to: order.customer_email,
        subject: `Refund Processed for Order #${order.order_number} | Pure Pour Co.`,
        bodyHtml: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #283d24;">Refund Confirmation</h2>
            <p>Dear ${order.customer_name},</p>
            <p>A refund of <strong>${formatCurrency(amount)}</strong> has been processed for order <strong>#${order.order_number}</strong>.</p>
            <p><strong>Reason:</strong> ${reason}</p>
            ${providerRefundId ? `<p><strong>Reference / Refund ID:</strong> ${providerRefundId}</p>` : ""}
            <p>Depending on your bank or payment provider, funds typically reflect in 5-7 business days.</p>
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">Pure Pour Co. &bull; Artisanal Harvests</p>
          </div>
        `,
      }).catch((err) => console.error("Refund email error:", err));
    }

    return NextResponse.json({ success: true, refund });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
