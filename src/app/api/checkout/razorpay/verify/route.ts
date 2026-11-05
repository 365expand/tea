import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getSecret } from "@/lib/settings";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { formatCurrency } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      isTestMock,
    } = await req.json();

    const admin = createSupabaseAdminClient();

    // Fetch order
    const { data: order, error: orderErr } = await admin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    let verified = false;

    if (isTestMock) {
      verified = true;
    } else {
      const keySecret = (await getSecret("razorpay_secret")) || "";
      if (keySecret) {
        const generatedSignature = crypto
          .createHmac("sha256", keySecret)
          .update(`${razorpay_order_id}|${razorpay_payment_id}`)
          .digest("hex");

        verified = generatedSignature === razorpay_signature;
      }
    }

    if (!verified) {
      // Log payment failure
      await admin.from("payment_logs").insert({
        order_id: order.id,
        provider: "razorpay",
        event_type: "payment_failed",
        status: "signature_mismatch",
        message: "Razorpay payment signature mismatch",
      });

      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    // Update payment record
    const { data: paymentRecord } = await admin
      .from("payments")
      .upsert(
        {
          order_id: order.id,
          provider: "razorpay",
          provider_order_id: razorpay_order_id,
          provider_payment_id: razorpay_payment_id || `pay_${Date.now()}`,
          amount: order.grand_total,
          currency: "INR",
          status: "paid",
          signature_verified: true,
          paid_at: new Date().toISOString(),
        },
        { onConflict: "provider_payment_id" }
      )
      .select()
      .single();

    // Update order status
    await admin
      .from("orders")
      .update({
        payment_status: "paid",
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    // Record verified transaction in finance ledger
    await admin.from("transactions").insert({
      order_id: order.id,
      payment_id: paymentRecord?.id || null,
      type: "payment",
      direction: "credit",
      amount: order.grand_total,
      description: `Razorpay online payment received for order ${order.order_number}`,
    });

    // Log status history
    await admin.from("order_status_history").insert({
      order_id: order.id,
      from_status: order.status,
      to_status: "confirmed",
      note: `Online payment of ${formatCurrency(order.grand_total)} verified via Razorpay`,
    });

    // Send Payment Confirmation Email
    if (order.customer_email) {
      await sendEmail({
        to: order.customer_email,
        templateKey: "payment_confirmation",
        orderId: order.id,
        variables: {
          customer_name: order.customer_name,
          order_number: order.order_number,
          order_total: formatCurrency(order.grand_total),
        },
      });
    }

    return NextResponse.json({ success: true, orderNumber: order.order_number });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Verification failed" }, { status: 500 });
  }
}

