"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OrderStatusBadge, PaymentStatusBadge } from "./StatusBadge";
import { ImageUploader } from "./ImageUploader";
import {
  ArrowLeft,
  Printer,
  FileText,
  Truck,
  RotateCcw,
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  User,
  CreditCard,
  MessageSquare,
  ExternalLink,
  Loader2,
  X,
  Check,
  Zap,
  RefreshCw,
  DollarSign,
} from "lucide-react";

export type OrderDetailProps = {
  order: any;
  items: any[];
  addresses: any[];
  history: any[];
  notes: any[];
  payments: any[];
  refunds: any[];
};

const COURIER_PRESETS = [
  { name: "Delhivery", urlPrefix: "https://www.delhivery.com/track/package/" },
  { name: "Blue Dart", urlPrefix: "https://www.bluedart.com/tracking?trackFor=0&trackNo=" },
  { name: "DTDC", urlPrefix: "https://www.dtdc.in/tracking/tracking_results.asp?Ttype=awb_no&strAvbNo=" },
  { name: "India Post (Speed Post)", urlPrefix: "https://www.indiapost.gov.in/_layouts/15/dpt.cept.trackconsignment/trackconsignment.aspx" },
  { name: "Shiprocket", urlPrefix: "https://shiprocket.co/tracking/" },
  { name: "Ekart Logistics", urlPrefix: "https://ekartlogistics.com/shipmenttrack/" },
  { name: "Shadowfax", urlPrefix: "https://tracker.shadowfax.in/#/track/" },
];

export function OrderDetailManager({
  order,
  items,
  addresses,
  history,
  notes,
  payments,
  refunds,
}: OrderDetailProps) {
  const router = useRouter();

  // Status & Payment transition states
  const [selectedStatus, setSelectedStatus] = useState<string>(order.status);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>(order.payment_status);
  const [statusNote, setStatusNote] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Tracking states
  const [courierName, setCourierName] = useState(order.courier_name || "");
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || "");
  const [trackingUrl, setTrackingUrl] = useState(order.tracking_url || "");
  const [shippingDocUrl, setShippingDocUrl] = useState(order.shipping_document_url || "");
  const [savingTracking, setSavingTracking] = useState(false);

  // Internal notes state
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  // Refund drawer state
  const [isRefundDrawerOpen, setIsRefundDrawerOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState(order.grand_total.toString());
  const [refundReason, setRefundReason] = useState("");
  const [providerRefundId, setProviderRefundId] = useState("");
  const [restoreStock, setRestoreStock] = useState(true);
  const [processingRefund, setProcessingRefund] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);

  const shippingAddr = addresses.find((a) => a.type === "shipping");
  const billingAddr = addresses.find((a) => a.type === "billing") || shippingAddr;

  const executeOrderUpdate = async (options: {
    nextStatus?: string;
    nextPaymentStatus?: string;
    noteText?: string;
    syncOnline?: boolean;
  }) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: options.nextStatus || selectedStatus,
          payment_status: options.nextPaymentStatus || selectedPaymentStatus,
          note: options.noteText || statusNote || undefined,
          sync_online_payment: options.syncOnline || false,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update order");

      if (options.nextStatus) setSelectedStatus(options.nextStatus);
      if (options.nextPaymentStatus) setSelectedPaymentStatus(options.nextPaymentStatus);
      setStatusNote("");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeOrderUpdate({});
  };

  const handleMarkCodPaid = async () => {
    if (!confirm("Confirm payment received in cash for this COD order?")) return;
    await executeOrderUpdate({
      nextPaymentStatus: "paid",
      noteText: "COD cash payment collected from customer upon delivery",
    });
  };

  const handleSyncOnlinePayment = async () => {
    await executeOrderUpdate({
      syncOnline: true,
      noteText: "Admin triggered manual online payment gateway sync",
    });
  };

  const handleSelectCourierPreset = (presetName: string) => {
    setCourierName(presetName);
    const found = COURIER_PRESETS.find((c) => c.name === presetName);
    if (found && trackingNumber) {
      setTrackingUrl(found.urlPrefix + trackingNumber);
    }
  };

  const handleTrackingNumberChange = (val: string) => {
    setTrackingNumber(val);
    const found = COURIER_PRESETS.find((c) => c.name === courierName);
    if (found && val) {
      setTrackingUrl(found.urlPrefix + val);
    }
  };

  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTracking(true);

    try {
      const res = await fetch(`/api/admin/orders/${order.id}/tracking`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courier_name: courierName,
          tracking_number: trackingNumber,
          tracking_url: trackingUrl,
          shipping_document_url: shippingDocUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save tracking");

      alert("Tracking details saved successfully!");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingTracking(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setAddingNote(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: newNote }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add note");

      setNewNote("");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAddingNote(false);
    }
  };

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessingRefund(true);
    setRefundError(null);

    try {
      const res = await fetch(`/api/admin/orders/${order.id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(refundAmount),
          reason: refundReason,
          provider_refund_id: providerRefundId || null,
          restore_stock: restoreStock,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process refund");

      setIsRefundDrawerOpen(false);
      router.refresh();
    } catch (err: any) {
      setRefundError(err.message);
    } finally {
      setProcessingRefund(false);
    }
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-16">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-14 bg-slate-50/95 backdrop-blur-md py-3 z-20 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 shadow-xs transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight font-mono">
                {order.order_number}
              </h1>
              <OrderStatusBadge status={order.status} />
              <PaymentStatusBadge status={order.payment_status} />
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Placed on {formatDate(order.created_at, true)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Printable Packing Slip */}
          <Link
            href={`/admin/orders/${order.id}/packing-slip`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            Packing Slip
          </Link>

          {/* Printable Invoice */}
          <Link
            href={`/admin/orders/${order.id}/invoice`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            GST Invoice
          </Link>

          {/* Refund Trigger */}
          {order.payment_status === "paid" && (
            <button
              type="button"
              onClick={() => {
                setRefundError(null);
                setIsRefundDrawerOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg shadow-xs transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Process Refund
            </button>
          )}
        </div>
      </div>

      {/* 1-Click Status Workflow Advance Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-semibold text-slate-800">Next Action:</span>
          <span className="text-xs text-slate-600">
            Order is currently <strong className="capitalize text-slate-900 font-mono">{order.status}</strong>.
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {order.status === "pending" && (
            <>
              <button
                type="button"
                disabled={updatingStatus}
                onClick={() => executeOrderUpdate({ nextStatus: "confirmed", noteText: "Order verified and confirmed" })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition disabled:opacity-50"
              >
                {updatingStatus ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                Confirm Order
              </button>
              <button
                type="button"
                disabled={updatingStatus}
                onClick={() => {
                  if (confirm("Are you sure you want to cancel this order?")) {
                    executeOrderUpdate({ nextStatus: "cancelled", noteText: "Order cancelled by admin" });
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-medium rounded-lg transition disabled:opacity-50"
              >
                Cancel Order
              </button>
            </>
          )}

          {order.status === "confirmed" && (
            <button
              type="button"
              disabled={updatingStatus}
              onClick={() => executeOrderUpdate({ nextStatus: "processing", noteText: "Items picked, packed, and awaiting courier pickup" })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg shadow-xs transition disabled:opacity-50"
            >
              {updatingStatus ? <Loader2 className="w-3 h-3 animate-spin" /> : <Package className="w-3 h-3" />}
              Start Packing (Move to Processing)
            </button>
          )}

          {order.status === "processing" && (
            <button
              type="button"
              disabled={updatingStatus}
              onClick={() => executeOrderUpdate({ nextStatus: "shipped", noteText: "Order handed over to courier" })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition disabled:opacity-50"
            >
              {updatingStatus ? <Loader2 className="w-3 h-3 animate-spin" /> : <Truck className="w-3 h-3" />}
              Mark Dispatched &amp; Shipped
            </button>
          )}

          {order.status === "shipped" && (
            <button
              type="button"
              disabled={updatingStatus}
              onClick={() => executeOrderUpdate({ nextStatus: "delivered", noteText: "Successfully delivered to customer" })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition disabled:opacity-50"
            >
              {updatingStatus ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
              Mark Delivered (Auto-Settle Payment)
            </button>
          )}

          {order.status === "delivered" && (
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> Order Fulfilled &amp; Completed
            </span>
          )}

          {/* Quick COD collection action in top bar if unpaid */}
          {order.payment_method === "cod" && order.payment_status !== "paid" && (
            <button
              type="button"
              disabled={updatingStatus}
              onClick={handleMarkCodPaid}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg shadow-2xs transition disabled:opacity-50 ml-auto"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              Mark Paid (Cash Received)
            </button>
          )}

          {order.payment_method !== "cod" && order.payment_status !== "paid" && (
            <button
              type="button"
              disabled={updatingStatus}
              onClick={handleSyncOnlinePayment}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold rounded-lg shadow-2xs transition disabled:opacity-50 ml-auto"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              Sync Online Payment
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 cols: Items, Status & Fulfillment */}
        <div className="lg:col-span-2 space-y-4">
          {/* Snapshot Items table */}
          <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-700">
                Purchased Items ({items.length})
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                Tax rates preserved from time of order
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-600 uppercase font-mono font-medium border-b border-slate-200/80">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Item</th>
                    <th className="py-2.5 px-4 font-semibold">SKU</th>
                    <th className="py-2.5 px-4 font-semibold">Unit Price</th>
                    <th className="py-2.5 px-4 font-semibold">Qty</th>
                    <th className="py-2.5 px-4 font-semibold">Tax</th>
                    <th className="py-2.5 px-4 text-right font-semibold">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {item.product_image ? (
                              <img
                                src={item.product_image}
                                alt={item.product_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{item.product_name}</p>
                            <p className="text-[11px] text-slate-500 font-mono">
                              {item.net_quantity || "Standard"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-4 font-mono text-slate-500 text-xs">
                        {item.product_sku || "—"}
                      </td>

                      <td className="py-2.5 px-4 text-slate-700 font-mono">
                        {formatCurrency(item.unit_price)}
                      </td>

                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                        {item.quantity}
                      </td>

                      <td className="py-2.5 px-4 text-slate-500 font-mono">
                        {formatCurrency(item.tax_amount)} ({item.tax_rate}%)
                      </td>

                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(item.line_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Breakdown */}
            <div className="bg-slate-50/60 p-4 border-t border-slate-100 flex justify-end">
              <div className="w-72 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(order.subtotal)}</span>
                </div>
                {Number(order.discount_total) > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount:</span>
                    <span>-{formatCurrency(order.discount_total)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Shipping:</span>
                  <span className="font-semibold text-slate-800">
                    {Number(order.shipping_total) === 0
                      ? "FREE"
                      : formatCurrency(order.shipping_total)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Taxes (GST):</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(order.tax_total)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Grand Total:</span>
                  <span className="text-emerald-700">{formatCurrency(order.grand_total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Courier & Tracking Fulfillment Card */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600" />
                Courier Partner &amp; Tracking
              </h3>
              {trackingUrl && (
                <a
                  href={trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1 transition"
                >
                  Track on Courier Website <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <form onSubmit={handleSaveTracking} className="space-y-3">
              {/* Popular Courier Buttons */}
              <div>
                <p className="text-[11px] font-semibold text-slate-600 mb-1.5">
                  Popular Indian Courier Partners:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {COURIER_PRESETS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => handleSelectCourierPreset(c.name)}
                      className={`text-[11px] px-2.5 py-0.5 rounded-full border font-mono transition ${
                        courierName === c.name
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Courier Partner Name
                  </label>
                  <input
                    type="text"
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    placeholder="e.g. Delhivery, Blue Dart"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tracking AWB Number
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => handleTrackingNumberChange(e.target.value)}
                    placeholder="e.g. 14892019481"
                    className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tracking Web URL
                </label>
                <input
                  type="url"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  placeholder="https://delhivery.com/track/package/..."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                />
              </div>

              <div>
                <ImageUploader
                  label="Shipping Label / Consignment Document"
                  value={shippingDocUrl}
                  onChange={(url) => setShippingDocUrl(url as string)}
                  bucket="shipping-documents"
                  helperText="Scanned waybill or label for dispatch records"
                />
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={savingTracking}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition"
                >
                  {savingTracking && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Tracking Details
                </button>
              </div>
            </form>
          </div>

          {/* Status & Payment Management Card */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                Status &amp; Payment Controls
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-500">Method:</span>
                <span className="text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
                  {order.payment_method}
                </span>
              </div>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Order Status Select */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Order Status:
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono font-semibold border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 bg-white text-slate-900"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing (Packing)</option>
                    <option value="shipped">Shipped (In Transit)</option>
                    <option value="delivered">Delivered (Completed)</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="returned">Returned</option>
                  </select>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    * Marking as &quot;Delivered&quot; automatically marks payment as Paid
                  </p>
                </div>

                {/* Payment Status Select */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Status:
                  </label>
                  <select
                    value={selectedPaymentStatus}
                    onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono font-semibold border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 bg-white text-slate-900"
                  >
                    <option value="pending">Pending (Unpaid)</option>
                    <option value="paid">Paid (Collected)</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {order.payment_method === "cod" ? "COD: Settle once cash is received" : "Online: Verifiable with gateway"}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Transition Note / Reason (Optional):
                </label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Verified payment via bank / hand-delivered by local courier..."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  {order.payment_method === "cod" && order.payment_status !== "paid" && (
                    <button
                      type="button"
                      disabled={updatingStatus}
                      onClick={handleMarkCodPaid}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1 transition disabled:opacity-50"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      Mark Cash Paid
                    </button>
                  )}
                  {order.payment_method !== "cod" && (
                    <button
                      type="button"
                      disabled={updatingStatus}
                      onClick={handleSyncOnlinePayment}
                      className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 flex items-center gap-1 transition disabled:opacity-50"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                      Sync Online Status
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={updatingStatus || (selectedStatus === order.status && selectedPaymentStatus === order.payment_status)}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition"
                >
                  {updatingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Status &amp; Payment Changes
                </button>
              </div>
            </form>
          </div>

          {/* Timeline of status transitions */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              Status History Timeline
            </h3>

            {history.length === 0 ? (
              <p className="text-xs font-mono text-slate-400">No transitions recorded yet.</p>
            ) : (
              <div className="relative pl-6 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
                {history.map((h) => (
                  <div key={h.id} className="relative text-xs space-y-0.5">
                    <span className="absolute -left-6 top-1.5 w-2 h-2 rounded-full bg-emerald-600 ring-4 ring-white" />
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 capitalize">
                        {h.from_status ? `${h.from_status} → ${h.to_status}` : h.to_status}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {formatDate(h.created_at, true)}
                      </span>
                    </div>
                    {h.note && <p className="text-slate-600 text-xs">{h.note}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 col: Customer, Address, Notes & Payments */}
        <div className="space-y-4">
          {/* Customer info card */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-2.5">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              Customer
            </h3>
            <div>
              <p className="text-sm font-semibold text-slate-900">{order.customer_name}</p>
              <p className="text-xs font-mono text-slate-600">{order.customer_email}</p>
              <p className="text-xs font-mono text-slate-400">{order.customer_phone || "No phone"}</p>
            </div>
            {order.customer_id && (
              <Link
                href={`/admin/customers/${order.customer_id}`}
                className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-mono font-medium transition"
              >
                View Customer Profile <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>

          {/* Delivery Address */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-2.5">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Delivery Address
            </h3>

            {!shippingAddr ? (
              <p className="text-xs font-mono text-slate-400">No address recorded</p>
            ) : (
              <div className="text-xs text-slate-700 space-y-1">
                <p className="font-semibold text-slate-900">{shippingAddr.full_name}</p>
                <p>{shippingAddr.line1}</p>
                {shippingAddr.line2 && <p>{shippingAddr.line2}</p>}
                <p className="font-mono text-slate-600">
                  {shippingAddr.city}, {shippingAddr.state} - {shippingAddr.postal_code}
                </p>
                <p className="text-slate-400 font-mono">Phone: {shippingAddr.phone || order.customer_phone}</p>
              </div>
            )}
          </div>

          {/* Payment Details */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-2.5">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Payment Information
            </h3>

            <div className="text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-mono">Method:</span>
                <span className="font-mono font-bold uppercase text-slate-900">
                  {order.payment_method}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-mono">Status:</span>
                <PaymentStatusBadge status={order.payment_status} />
              </div>
              {payments.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <span className="text-[11px] font-mono font-semibold text-slate-600 block">
                    Verified Transactions:
                  </span>
                  {payments.map((p) => (
                    <div
                      key={p.id}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono space-y-0.5"
                    >
                      <div className="flex justify-between">
                        <span className="text-slate-700 font-medium">{p.provider}</span>
                        <span className="font-bold text-emerald-700">{formatCurrency(p.amount)}</span>
                      </div>
                      <p className="text-slate-400 truncate">ID: {p.provider_payment_id || "N/A"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Internal Notes */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              Internal Notes
            </h3>

            {notes.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {notes.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1"
                  >
                    <p className="text-slate-800">{n.note}</p>
                    <p className="text-[10px] font-mono text-slate-400">
                      {n.author_name || "Staff"} • {formatDate(n.created_at, true)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                rows={2}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add private staff note..."
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={addingNote || !newNote.trim()}
                  className="px-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 disabled:opacity-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition"
                >
                  {addingNote ? "Saving..." : "Add Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Refund Slide-over Drawer (Right to Left) */}
      {isRefundDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsRefundDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out animate-in slide-in-from-right">
            <div className="px-5 py-3.5 border-b border-slate-200/80 bg-slate-50/75 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Process Order Refund</h2>
                <p className="text-xs text-slate-500">Debit payment gateway or issue cash reversal</p>
              </div>
              <button
                type="button"
                onClick={() => setIsRefundDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProcessRefund} className="flex-1 flex flex-col overflow-hidden text-xs">
              <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
                {refundError && (
                  <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
                    {refundError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Refund Amount (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    max={order.grand_total}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-rose-500 font-mono font-bold"
                  />
                  <p className="text-[11px] text-slate-500 font-mono mt-1">
                    Max refundable: {formatCurrency(order.grand_total)}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reason for Refund *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="e.g. Customer cancelled before dispatch, package damaged in transit..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gateway / Bank Transfer Reference ID
                  </label>
                  <input
                    type="text"
                    value={providerRefundId}
                    onChange={(e) => setProviderRefundId(e.target.value)}
                    placeholder="e.g. rfd_1028401928"
                    className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <label className="relative flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={restoreStock}
                      onChange={(e) => setRestoreStock(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    Restock returned / cancelled items back to inventory
                  </label>
                </div>
              </div>

              <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/75 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsRefundDrawerOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingRefund}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 disabled:opacity-50 transition shadow-xs"
                >
                  {processingRefund && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
