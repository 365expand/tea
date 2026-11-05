import { NextRequest, NextResponse } from "next/server";
import { getSetting, getSecret } from "@/lib/settings";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const { data: order, error: orderErr } = await admin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const paymentSettings = await getSetting("payment", {
      razorpay_enabled: false,
      razorpay_key_id: "",
      payment_mode: "test",
    });

    const keyId = paymentSettings.razorpay_key_id || "";
    const keySecret = (await getSecret("razorpay_secret")) || "";
    const amountInPaise = Math.round(Number(order.grand_total) * 100);

    // If Razorpay API keys are configured and valid
    if (keyId && keySecret && !keyId.startsWith("placeholder")) {
      const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: "INR",
          receipt: order.order_number,
          notes: {
            order_id: order.id,
            customer_email: order.customer_email,
          },
        }),
      });

      const rzpOrder = await response.json();
      if (!response.ok) {
        throw new Error(rzpOrder.error?.description || "Failed to create Razorpay order");
      }

      // Record pending payment
      await admin.from("payments").insert({
        order_id: order.id,
        provider: "razorpay",
        provider_order_id: rzpOrder.id,
        amount: order.grand_total,
        currency: "INR",
        status: "pending",
      });

      return NextResponse.json({
        success: true,
        isTestMock: false,
        keyId,
        razorpayOrderId: rzpOrder.id,
        amount: amountInPaise,
        currency: "INR",
      });
    }

    // Fallback sandbox test flow when keys are test/placeholder
    const testRzpOrderId = `order_test_${Date.now()}`;
    await admin.from("payments").insert({
      order_id: order.id,
      provider: "razorpay",
      provider_order_id: testRzpOrderId,
      amount: order.grand_total,
      currency: "INR",
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      isTestMock: true,
      keyId: keyId || "rzp_test_mock_mode",
      razorpayOrderId: testRzpOrderId,
      amount: amountInPaise,
      currency: "INR",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to initiate payment" }, { status: 500 });
  }
}

