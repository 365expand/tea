import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSetting } from "@/lib/settings";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Leaf, ArrowLeft } from "lucide-react";
import { PrintButton } from "@/components/admin/PrintButton";

export const dynamic = "force-dynamic";

interface InvoicePageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerOrderInvoicePage({ params }: InvoicePageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/account/orders/${id}/invoice`);

  const admin = createSupabaseAdminClient();

  const [
    { data: order },
    { data: items },
    { data: addresses },
    generalSettings,
    businessSettings,
    contactSettings,
  ] = await Promise.all([
    admin.from("orders").select("*").eq("id", id).single(),
    admin.from("order_items").select("*").eq("order_id", id),
    admin.from("order_addresses").select("*").eq("order_id", id),
    getSetting("general", { website_name: "Pure Pour Co.", support_email: "care@purepour.co" }),
    getSetting("business", {
      business_name: "Pure Pour Co.",
      address: "Estate Garden Unit, Hill Cart Road, Darjeeling & Assam, India",
      gstin: "",
      invoice_prefix: "PPC",
      invoice_terms: "Goods once sold are not returnable except as per return policy.",
      invoice_notes: "Thank you for choosing Pure Pour Co. Sip pure, live inspired.",
      default_tax_rate: 5,
      tax_enabled: true,
    }),
    getSetting("contact", { phone: "", whatsapp: "" }),
  ]);

  if (!order) notFound();

  // Security check: ensure order belongs to this customer
  if (order.customer_id !== user.id && order.customer_email !== user.email) {
    notFound();
  }

  const shippingAddr = addresses?.find((a) => a.type === "shipping");
  const billingAddr = addresses?.find((a) => a.type === "billing") || shippingAddr;

  const invoiceNumber = `${businessSettings.invoice_prefix || "INV"}-${order.order_number}`;
  const isTaxEnabled = (businessSettings as any).tax_enabled !== false;

  return (
    <div className="min-h-screen bg-stone-100 p-4 sm:p-8 print:p-0 print:bg-white text-stone-900 font-sans">
      {/* Top action bar (hidden on print) */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between no-print">
        <a
          href={`/account/orders/${order.id}`}
          className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Order
        </a>

        <PrintButton label="Print / Save PDF" />
      </div>

      {/* Invoice Document Body */}
      <div className="max-w-3xl mx-auto bg-white border border-stone-200 rounded-xl p-8 sm:p-12 shadow-md print:shadow-none print:border-none print:p-0">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-200 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded bg-brand-700 text-white flex items-center justify-center">
                <Leaf className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-stone-900">
                {businessSettings.business_name || generalSettings.website_name}
              </h1>
            </div>
            <p className="text-xs text-stone-600 max-w-sm whitespace-pre-line">
              {businessSettings.address}
            </p>
            {isTaxEnabled && businessSettings.gstin && (
              <p className="text-xs font-mono text-stone-700 mt-1">
                <strong>GSTIN:</strong> {businessSettings.gstin}
              </p>
            )}
            <p className="text-xs text-stone-500 mt-0.5">
              Contact: {contactSettings.phone || generalSettings.support_email}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 block">
              {isTaxEnabled ? "TAX INVOICE" : "INVOICE / BILL OF SUPPLY"}
            </span>
            <p className="text-lg font-mono font-bold text-stone-900 mt-1">{invoiceNumber}</p>
            <p className="text-xs text-stone-500 mt-1">
              <strong>Invoice Date:</strong> {formatDate(new Date())}
            </p>
            <p className="text-xs text-stone-500">
              <strong>Order Ref:</strong> {order.order_number}
            </p>
            <p className="text-xs text-stone-500">
              <strong>Payment:</strong>{" "}
              <span className="uppercase font-mono">{order.payment_method}</span> ({order.payment_status})
            </p>
          </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-2 gap-8 py-6 border-b border-stone-200 text-xs">
          <div>
            <h3 className="font-bold uppercase tracking-wider text-stone-500 mb-2">Billed To</h3>
            <p className="font-bold text-stone-900">{billingAddr?.full_name || order.customer_name}</p>
            <p className="text-stone-600">{billingAddr?.line1}</p>
            {billingAddr?.line2 && <p className="text-stone-600">{billingAddr.line2}</p>}
            <p className="text-stone-600">
              {billingAddr?.city}, {billingAddr?.state} - {billingAddr?.postal_code}
            </p>
            <p className="text-stone-500 mt-1">Phone: {billingAddr?.phone || order.customer_phone}</p>
            <p className="text-stone-500">Email: {order.customer_email}</p>
          </div>

          <div>
            <h3 className="font-bold uppercase tracking-wider text-stone-500 mb-2">Shipped To</h3>
            <p className="font-bold text-stone-900">{shippingAddr?.full_name || order.customer_name}</p>
            <p className="text-stone-600">{shippingAddr?.line1}</p>
            {shippingAddr?.line2 && <p className="text-stone-600">{shippingAddr.line2}</p>}
            <p className="text-stone-600">
              {shippingAddr?.city}, {shippingAddr?.state} - {shippingAddr?.postal_code}
            </p>
            <p className="text-stone-500 mt-1">Phone: {shippingAddr?.phone || order.customer_phone}</p>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="py-6">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-300 text-stone-600 font-semibold uppercase">
              <tr>
                <th className="py-2">Item Description</th>
                <th className="py-2">HSN</th>
                <th className="py-2 text-right">Unit Price</th>
                <th className="py-2 text-center">Qty</th>
                {isTaxEnabled && <th className="py-2 text-right">GST Rate</th>}
                {isTaxEnabled && <th className="py-2 text-right">Tax</th>}
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {items?.map((item: any) => (
                <tr key={item.id}>
                  <td className="py-3">
                    <p className="font-bold text-stone-900">{item.product_name}</p>
                    <p className="text-[11px] text-stone-500">
                      SKU: {item.product_sku || "N/A"} • {item.net_quantity}
                    </p>
                  </td>
                  <td className="py-3 font-mono text-stone-600">{item.hsn_code || "0902"}</td>
                  <td className="py-3 text-right text-stone-800">{formatCurrency(item.unit_price)}</td>
                  <td className="py-3 text-center font-bold text-stone-900">{item.quantity}</td>
                  {isTaxEnabled && (
                    <td className="py-3 text-right text-stone-600">
                      {item.tax_rate ?? businessSettings.default_tax_rate ?? 5}%
                    </td>
                  )}
                  {isTaxEnabled && (
                    <td className="py-3 text-right text-stone-600">
                      {formatCurrency(item.tax_amount)}
                    </td>
                  )}
                  <td className="py-3 text-right font-bold text-stone-900">
                    {formatCurrency(item.line_total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="border-t border-stone-200 pt-4 flex justify-end">
          <div className="w-72 space-y-2 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal:</span>
              <span className="font-medium text-stone-900">{formatCurrency(order.subtotal)}</span>
            </div>
            {Number(order.discount_total) > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount:</span>
                <span>-{formatCurrency(order.discount_total)}</span>
              </div>
            )}
            <div className="flex justify-between text-stone-600">
              <span>Shipping Fee:</span>
              <span className="font-medium text-stone-900">
                {Number(order.shipping_total) === 0 ? "FREE" : formatCurrency(order.shipping_total)}
              </span>
            </div>
            {isTaxEnabled && (
              <div className="flex justify-between text-stone-600">
                <span>GST Total:</span>
                <span className="font-medium text-stone-900">{formatCurrency(order.tax_total)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-300">
              <span>Total Payable:</span>
              <span>{formatCurrency(order.grand_total)}</span>
            </div>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="mt-12 pt-6 border-t border-stone-200 text-xs text-stone-500 space-y-2">
          {businessSettings.invoice_terms && (
            <p>
              <strong>Terms:</strong> {businessSettings.invoice_terms}
            </p>
          )}
          {businessSettings.invoice_notes && (
            <p>
              <strong>Note:</strong> {businessSettings.invoice_notes}
            </p>
          )}
          <div className="pt-4 flex justify-between items-end text-[11px] text-stone-400">
            <span>This is a computer-generated tax invoice. No signature required.</span>
            <span>Authorized Signatory</span>
          </div>
        </div>
      </div>
    </div>
  );
}
