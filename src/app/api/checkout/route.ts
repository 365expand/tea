import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSetting } from "@/lib/settings";
import { sendEmail } from "@/lib/email";
import { formatCurrency } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      billingAddress,
      paymentMethod, // 'cod' | 'razorpay'
      items,
      customerNote,
      couponCode,
    } = body;

    if (!customerName || !customerEmail || !shippingAddress || !items || items.length === 0) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const serverSupabase = await createSupabaseServerClient();
    const { data: { user } } = await serverSupabase.auth.getUser();

    // 1. Fetch shipping & business tax settings
    const [shippingSettings, businessSettings] = await Promise.all([
      getSetting("shipping", {
        default_charge: 60,
        free_threshold: 999,
      }),
      getSetting("business", {
        default_tax_rate: 5,
        tax_enabled: true,
      }),
    ]);
    const isTaxEnabled = businessSettings.tax_enabled !== false;
    const defaultTaxRate = isTaxEnabled ? Number(businessSettings.default_tax_rate ?? 5) : 0;

    // 2. Verify products, prices, and stock in database
    const productIds = items.map((i: any) => i.productId);
    const { data: dbProducts, error: prodErr } = await admin
      .from("products")
      .select("id, name, sku, featured_image_url, regular_price, sale_price, stock_quantity, tax_rate, hsn_code, net_quantity, status")
      .in("id", productIds);

    if (prodErr || !dbProducts || dbProducts.length === 0) {
      return NextResponse.json({ error: "Could not verify products in cart" }, { status: 400 });
    }

    let subtotal = 0;
    let taxTotal = 0;
    const validatedItems: any[] = [];

    for (const cartItem of items) {
      const dbProduct = dbProducts.find((p) => p.id === cartItem.productId);
      if (!dbProduct || dbProduct.status !== "active") {
        return NextResponse.json(
          { error: `Product "${cartItem.name}" is no longer available` },
          { status: 400 }
        );
      }

      if (dbProduct.stock_quantity < cartItem.quantity) {
        return NextResponse.json(
          { error: `Only ${dbProduct.stock_quantity} units available for "${dbProduct.name}"` },
          { status: 400 }
        );
      }

      const unitPrice = dbProduct.sale_price !== null && dbProduct.sale_price !== undefined
        ? Number(dbProduct.sale_price)
        : Number(dbProduct.regular_price);
      const lineTotal = unitPrice * cartItem.quantity;
      const taxRate = isTaxEnabled
        ? (dbProduct.tax_rate !== null && dbProduct.tax_rate !== undefined && Number(dbProduct.tax_rate) > 0
            ? Number(dbProduct.tax_rate)
            : defaultTaxRate)
        : 0;
      const taxAmount = isTaxEnabled && taxRate > 0 ? (lineTotal * taxRate) / (100 + taxRate) : 0; // Inclusive tax calculation

      subtotal += lineTotal;
      taxTotal += taxAmount;

      validatedItems.push({
        product_id: dbProduct.id,
        product_name: dbProduct.name,
        product_sku: dbProduct.sku,
        product_image: dbProduct.featured_image_url,
        unit_price: unitPrice,
        quantity: cartItem.quantity,
        tax_rate: taxRate,
        tax_amount: parseFloat(taxAmount.toFixed(2)),
        line_total: lineTotal,
        net_quantity: dbProduct.net_quantity,
        hsn_code: dbProduct.hsn_code || "0902",
      });
    }

    // 2.5 Verify and apply coupon if provided
    let discountTotal = 0;
    let appliedCouponId: string | null = null;

    if (couponCode && typeof couponCode === "string" && couponCode.trim()) {
      const cleanCoupon = couponCode.trim().toUpperCase();
      const { data: coupon } = await admin
        .from("coupons")
        .select("*")
        .eq("code", cleanCoupon)
        .eq("is_active", true)
        .maybeSingle();

      if (coupon) {
        const minAmount = Number(coupon.min_order_amount || 0);
        if (subtotal >= minAmount) {
          if (coupon.discount_type === "percentage") {
            discountTotal = (subtotal * Number(coupon.discount_value)) / 100;
            if (coupon.max_discount_amount && discountTotal > Number(coupon.max_discount_amount)) {
              discountTotal = Number(coupon.max_discount_amount);
            }
          } else {
            discountTotal = Math.min(subtotal, Number(coupon.discount_value));
          }
          discountTotal = Math.round(discountTotal * 100) / 100;
          appliedCouponId = coupon.id;

          // Increment coupon used count
          await admin
            .from("coupons")
            .update({ used_count: (coupon.used_count || 0) + 1 })
            .eq("id", coupon.id);
        }
      }
    }

    const freeThreshold = Number(shippingSettings.free_threshold) || 999;
    const defaultCharge = Number(shippingSettings.default_charge) || 60;
    const effectiveSubtotal = Math.max(0, subtotal - discountTotal);
    const shippingTotal = effectiveSubtotal >= freeThreshold ? 0 : defaultCharge;
    const grandTotal = effectiveSubtotal + shippingTotal;

    // 3. Generate unique Order Number
    const { data: orderNumberData, error: numError } = await admin.rpc("next_order_number");
    const orderNumber = orderNumberData || `TEA-${Math.floor(100000 + Math.random() * 900000)}`;

    // 4. Insert Order
    const { data: order, error: orderInsertErr } = await admin
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: user?.id || null,
        customer_email: customerEmail,
        customer_name: customerName,
        customer_phone: customerPhone || shippingAddress.phone || null,
        subtotal,
        discount_total: discountTotal,
        shipping_total: shippingTotal,
        tax_total: parseFloat(taxTotal.toFixed(2)),
        grand_total: grandTotal,
        currency: "INR",
        payment_method: paymentMethod || "cod",
        payment_status: "pending",
        status: paymentMethod === "cod" ? "confirmed" : "pending",
        customer_note: customerNote || null,
        confirmed_at: paymentMethod === "cod" ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (orderInsertErr || !order) {
      return NextResponse.json({ error: orderInsertErr?.message || "Failed to create order" }, { status: 500 });
    }

    const orderId = order.id;

    // 5. Insert Order Items (Immutable Snapshots)
    const itemRows = validatedItems.map((item) => ({
      ...item,
      order_id: orderId,
    }));
    await admin.from("order_items").insert(itemRows);

    // 6. Insert Order Addresses
    await admin.from("order_addresses").insert([
      {
        order_id: orderId,
        type: "shipping",
        full_name: shippingAddress.fullName || customerName,
        phone: shippingAddress.phone || customerPhone || null,
        line1: shippingAddress.line1,
        line2: shippingAddress.line2 || null,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postal_code: shippingAddress.postalCode,
        country: shippingAddress.country || "India",
      },
      {
        order_id: orderId,
        type: "billing",
        full_name: billingAddress?.fullName || shippingAddress.fullName || customerName,
        phone: billingAddress?.phone || shippingAddress.phone || customerPhone || null,
        line1: billingAddress?.line1 || shippingAddress.line1,
        line2: billingAddress?.line2 || shippingAddress.line2 || null,
        city: billingAddress?.city || shippingAddress.city,
        state: billingAddress?.state || shippingAddress.state,
        postal_code: billingAddress?.postalCode || shippingAddress.postalCode,
        country: billingAddress?.country || shippingAddress.country || "India",
      },
    ]);

    // 7. Deduct Inventory Stock Safely
    for (const item of validatedItems) {
      await admin.rpc("adjust_product_stock", {
        p_product_id: item.product_id,
        p_change: -Math.abs(item.quantity),
        p_note: `Sale for order ${orderNumber}`,
        p_actor: user?.id || null,
      });
    }

    // 8. Order Status History
    await admin.from("order_status_history").insert({
      order_id: orderId,
      to_status: paymentMethod === "cod" ? "confirmed" : "pending",
      changed_by: user?.id || null,
      note: paymentMethod === "cod" ? "Order placed via Cash on Delivery" : "Order initiated via Razorpay",
    });

    // 9. Auto-generate Tax Invoice Record
    const { data: invoiceNum } = await admin.rpc("next_invoice_number");
    await admin.from("invoices").insert({
      order_id: orderId,
      invoice_number: invoiceNum || `INV-${orderNumber.replace("TEA-", "")}`,
      invoice_date: new Date().toISOString().split("T")[0],
      is_gst: true,
      subtotal,
      tax_total: parseFloat(taxTotal.toFixed(2)),
      shipping_total: shippingTotal,
      grand_total: grandTotal,
    });

    // 10. Dispatch Transactional Order Confirmation Email
    await sendEmail({
      to: customerEmail,
      templateKey: "order_confirmation",
      orderId,
      variables: {
        customer_name: customerName,
        order_number: orderNumber,
        order_total: formatCurrency(grandTotal),
        order_url: `http://localhost:3000/track-order?num=${orderNumber}&email=${encodeURIComponent(customerEmail)}`,
        items_table: validatedItems.map((i) => `${i.product_name} x ${i.quantity} (${formatCurrency(i.line_total)})`).join("<br/>"),
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: orderId,
        order_number: orderNumber,
        grand_total: grandTotal,
        payment_method: paymentMethod,
        status: order.status,
      },
    });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: err.message || "Checkout failed" }, { status: 500 });
  }
}

