import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSetting } from "@/lib/settings";
import { formatDate } from "@/lib/utils";
import { Leaf } from "lucide-react";
import { PrintButton } from "@/components/admin/PrintButton";

export const dynamic = "force-dynamic";

export default async function AdminOrderPackingSlipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createSupabaseAdminClient();

  // 1. Fetch order by UUID or order_number
  let orderQuery = admin.from("orders").select("*");
  if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    orderQuery = orderQuery.eq("id", id);
  } else {
    orderQuery = orderQuery.eq("order_number", id);
  }

  const { data: order } = await orderQuery.maybeSingle();

  if (!order) notFound();

  const orderId = order.id;

  const [
    { data: items },
    { data: addresses },
    generalSettings,
    contactSettings,
  ] = await Promise.all([
    admin.from("order_items").select("*").eq("order_id", orderId),
    admin.from("order_addresses").select("*").eq("order_id", orderId),
    getSetting("general", {
      website_name: "Pure Pour Co.",
    }),
    getSetting("contact", {
      phone: "+91 98765 43210",
      whatsapp: "+91 98765 43210",
    }),
  ]);

  const shippingAddr = addresses?.find((a) => a.type === "shipping");

  return (
    <div className="min-h-screen bg-stone-100 p-4 sm:p-8 print:p-0 print:bg-white text-stone-900 font-sans">
      {/* Top action bar */}
      <div className="max-w-2xl mx-auto mb-6 flex items-center justify-between no-print">
        <a
          href={`/admin/orders/${order.id}`}
          className="text-xs font-semibold text-stone-600 hover:text-stone-900"
        >
          &larr; Back to Order Details
        </a>

        <PrintButton label="Print Packing Slip" />
      </div>

      {/* Slip Document */}
      <div className="max-w-2xl mx-auto bg-white border border-stone-200 rounded-xl p-8 sm:p-10 shadow-md print:shadow-none print:border-none print:p-0">
        <div className="flex items-start justify-between border-b-2 border-stone-900 pb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-brand-700 text-white flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-stone-900">
                {generalSettings.website_name || "Pure Pour Co."}
              </h1>
              <p className="text-xs text-stone-500">Warehouse Fulfillment Packing Slip</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-bold px-2 py-1 bg-stone-900 text-white rounded">
              {order.order_number}
            </span>
            <p className="text-xs text-stone-500 mt-2">
              Date: {formatDate(order.created_at)}
            </p>
            <p className="text-xs text-stone-500">
              Payment: <strong className="uppercase">{order.payment_method}</strong>
            </p>
          </div>
        </div>

        {/* Shipping Destination */}
        <div className="py-6 border-b border-stone-200 text-xs">
          <span className="font-bold text-stone-500 uppercase tracking-wider block mb-1">
            Ship To:
          </span>
          <p className="font-bold text-sm text-stone-900">
            {shippingAddr?.full_name || order.customer_name}
          </p>
          <p className="text-stone-700 mt-0.5">{shippingAddr?.line1}</p>
          {shippingAddr?.line2 && <p className="text-stone-700">{shippingAddr.line2}</p>}
          <p className="text-stone-700">
            {shippingAddr?.city}, {shippingAddr?.state} - <strong>{shippingAddr?.postal_code}</strong>
          </p>
          <p className="text-stone-900 font-semibold mt-1">
            Phone: {shippingAddr?.phone || order.customer_phone}
          </p>
          {order.customer_note && (
            <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded text-amber-900">
              <strong>Customer Note:</strong> {order.customer_note}
            </div>
          )}
        </div>

        {/* Items Checklist for Warehouse staff */}
        <div className="py-6">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200 text-stone-500 uppercase">
              <tr>
                <th className="py-2 w-12 text-center">Check</th>
                <th className="py-2">Item Description &amp; SKU</th>
                <th className="py-2 text-right">Net Wt.</th>
                <th className="py-2 text-right">Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {items?.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 text-center">
                    <div className="w-4 h-4 border border-stone-400 rounded inline-block" />
                  </td>
                  <td className="py-3">
                    <p className="font-bold text-stone-900">{item.product_name}</p>
                    <p className="text-[11px] font-mono text-stone-500">
                      SKU: {item.product_sku || "N/A"}
                    </p>
                  </td>
                  <td className="py-3 text-right text-stone-600">{item.net_quantity}</td>
                  <td className="py-3 text-right font-bold text-stone-900 text-sm">
                    {item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Warehouse Verification sign off */}
        <div className="border-t-2 border-dashed border-stone-300 pt-6 mt-6 flex justify-between items-end text-xs text-stone-500">
          <div>
            <p>Packed by: _______________________</p>
            <p className="mt-2">Checked by: ______________________</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-stone-900">Chai &amp; Leaf Operations</p>
            <p className="text-[11px] text-stone-400">Handle with care • Food product</p>
          </div>
        </div>
      </div>
    </div>
  );
}
