"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ImageUploader } from "./ImageUploader";
import {
  ReceiptIndianRupee,
  TrendingUp,
  CreditCard,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Trash2,
  Download,
  FileText,
  Loader2,
  X,
  BarChart3,
} from "lucide-react";

export type FinanceOverview = {
  grossSales: number;
  totalCollected: number;
  pendingCollection: number;
  totalRefunds: number;
  totalExpenses: number;
  netRevenue: number;
};

export type TransactionRow = {
  id: string;
  order_id: string | null;
  type: string;
  direction: "credit" | "debit";
  amount: number;
  description: string | null;
  occurred_at: string;
  orders?: { order_number: string } | null;
};

export type ExpenseRow = {
  id: string;
  category: string;
  description: string;
  amount: number;
  expense_date: string;
  receipt_url: string | null;
  created_at: string;
};

export type InvoiceRow = {
  id: string;
  order_id: string;
  invoice_number: string;
  invoice_date: string;
  grand_total: number;
  is_gst: boolean;
  orders?: { order_number: string; customer_name: string } | null;
};

interface FinanceManagerProps {
  overview: FinanceOverview;
  transactions: TransactionRow[];
  expenses: ExpenseRow[];
  invoices: InvoiceRow[];
}

export function FinanceManager({
  overview,
  transactions,
  expenses: initialExpenses,
  invoices,
}: FinanceManagerProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "expenses" | "invoices">("overview");
  const [expenses, setExpenses] = useState<ExpenseRow[]>(initialExpenses);

  // Record Expense Drawer state
  const [isExpenseDrawerOpen, setIsExpenseDrawerOpen] = useState(false);
  const [expCategory, setExpCategory] = useState("Packaging");
  const [expDesc, setExpDesc] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expDate, setExpDate] = useState(new Date().toISOString().split("T")[0]);
  const [expReceipt, setExpReceipt] = useState("");
  const [savingExpense, setSavingExpense] = useState(false);
  const [expenseError, setExpenseError] = useState<string | null>(null);

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDesc.trim() || !expAmount) {
      setExpenseError("Please fill in description and amount");
      return;
    }

    setSavingExpense(true);
    setExpenseError(null);

    try {
      const res = await fetch("/api/admin/finance/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: expCategory,
          description: expDesc,
          amount: parseFloat(expAmount),
          expense_date: expDate,
          receipt_url: expReceipt || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record expense");

      setExpenses((prev) => [data.expense, ...prev]);
      setIsExpenseDrawerOpen(false);
      setExpDesc("");
      setExpAmount("");
      setExpReceipt("");
      router.refresh();
    } catch (err: any) {
      setExpenseError(err.message);
    } finally {
      setSavingExpense(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense record?")) return;

    try {
      const res = await fetch(`/api/admin/finance/expenses/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleExportCSV = () => {
    window.open("/api/admin/finance/export", "_blank");
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Finance &amp; Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified payment collections, revenue ledgers, expenses, refunds, and tax invoices
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </button>
          <button
            onClick={() => {
              setExpenseError(null);
              setIsExpenseDrawerOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Record Expense
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-500 block mb-0.5 font-semibold">
            Gross Sales
          </span>
          <p className="text-base font-bold font-mono text-slate-900">{formatCurrency(overview.grossSales)}</p>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">Placed orders</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
          <span className="text-[10px] font-mono uppercase text-emerald-700 block mb-0.5 font-semibold">
            Collected
          </span>
          <p className="text-base font-bold font-mono text-emerald-700">{formatCurrency(overview.totalCollected)}</p>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">Settled payments</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
          <span className="text-[10px] font-mono uppercase text-amber-700 block mb-0.5 font-semibold">
            Pending
          </span>
          <p className="text-base font-bold font-mono text-amber-700">
            {formatCurrency(overview.pendingCollection)}
          </p>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">COD / unpaid</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
          <span className="text-[10px] font-mono uppercase text-rose-700 block mb-0.5 font-semibold">
            Refunds
          </span>
          <p className="text-base font-bold font-mono text-rose-700">
            {formatCurrency(overview.totalRefunds)}
          </p>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">Debited to buyers</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-500 block mb-0.5 font-semibold">
            Expenses
          </span>
          <p className="text-base font-bold font-mono text-slate-800">
            {formatCurrency(overview.totalExpenses)}
          </p>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">Operating costs</p>
        </div>

        <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-3.5 shadow-xs">
          <span className="text-[10px] font-mono uppercase text-emerald-800 block mb-0.5 font-bold">
            Net Retained
          </span>
          <p className="text-base font-bold font-mono text-emerald-800">
            {formatCurrency(overview.netRevenue)}
          </p>
          <p className="text-[10px] text-emerald-600 font-mono mt-0.5">Sales - Cost</p>
        </div>
      </div>

      {/* Visual Analytics: Revenue vs Operating Expense Distribution */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-800">
              Capital Efficiency &amp; Net Margin
            </h3>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
            Net Margin: {overview.totalCollected > 0 ? Math.round((overview.netRevenue / overview.totalCollected) * 100) : 0}%
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono text-slate-500">
            <span>Collected vs Operating Outflow</span>
            <span className="text-slate-800 font-semibold">
              {formatCurrency(overview.totalCollected)} vs {formatCurrency(overview.totalExpenses)}
            </span>
          </div>
          {/* Visual ratio bar */}
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
            <div
              style={{
                width: `${overview.totalCollected > 0 ? Math.max(5, Math.min(100, Math.round(((overview.totalCollected - overview.totalExpenses) / overview.totalCollected) * 100))) : 50}%`,
              }}
              className="bg-emerald-600 h-full transition-all duration-500"
              title="Retained Margin"
            />
            <div
              style={{
                width: `${overview.totalCollected > 0 ? Math.min(95, Math.round((overview.totalExpenses / overview.totalCollected) * 100)) : 50}%`,
              }}
              className="bg-amber-400 h-full transition-all duration-500"
              title="Expenses"
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-0.5">
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" /> Retained Net ({formatCurrency(overview.netRevenue)})
            </span>
            <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Operating Costs ({formatCurrency(overview.totalExpenses)})
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-4 text-xs font-medium">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-2.5 transition relative ${
            activeTab === "overview"
              ? "text-emerald-700 border-b-2 border-emerald-600 font-semibold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Ledger &amp; Transactions ({transactions.length})
        </button>
        <button
          onClick={() => setActiveTab("expenses")}
          className={`pb-2.5 transition relative ${
            activeTab === "expenses"
              ? "text-emerald-700 border-b-2 border-emerald-600 font-semibold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Expenses ({expenses.length})
        </button>
        <button
          onClick={() => setActiveTab("invoices")}
          className={`pb-2.5 transition relative ${
            activeTab === "invoices"
              ? "text-emerald-700 border-b-2 border-emerald-600 font-semibold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Invoices ({invoices.length})
        </button>
      </div>

      {/* TAB 1: Transactions Ledger */}
      {activeTab === "overview" && (
        <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
          {transactions.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500 font-mono">
              No financial transactions recorded yet. Payments and refund events will populate here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-600 uppercase text-[10px] font-mono tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Date</th>
                    <th className="py-2.5 px-4 font-semibold">Type</th>
                    <th className="py-2.5 px-4 font-semibold">Description</th>
                    <th className="py-2.5 px-4 font-semibold">Order Ref</th>
                    <th className="py-2.5 px-4 text-right font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx) => {
                    const isCredit = tx.direction === "credit";
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">
                          {formatDate(tx.occurred_at, true)}
                        </td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                              isCredit
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            {isCredit ? (
                              <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <ArrowDownRight className="w-3 h-3 text-rose-600" />
                            )}
                            {tx.type.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-800 font-medium">{tx.description}</td>
                        <td className="py-2.5 px-4 font-mono text-slate-500">
                          {tx.orders?.order_number ? (
                            <Link
                              href={`/admin/orders/${tx.order_id}`}
                              className="text-emerald-700 hover:underline font-semibold"
                            >
                              {tx.orders.order_number}
                            </Link>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td
                          className={`py-2.5 px-4 text-right font-bold font-mono ${
                            isCredit ? "text-emerald-700" : "text-rose-700"
                          }`}
                        >
                          {isCredit ? "+" : "-"}
                          {formatCurrency(tx.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Expenses */}
      {activeTab === "expenses" && (
        <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
          {expenses.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500 font-mono">
              No expenses recorded. Click "Record Expense" above to add operational costs.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-600 uppercase text-[10px] font-mono tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Date</th>
                    <th className="py-2.5 px-4 font-semibold">Category</th>
                    <th className="py-2.5 px-4 font-semibold">Description</th>
                    <th className="py-2.5 px-4 text-right font-semibold">Amount</th>
                    <th className="py-2.5 px-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">{formatDate(exp.expense_date)}</td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[11px] border border-slate-200">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-800 font-medium">{exp.description}</td>
                      <td className="py-2.5 px-4 text-right font-bold font-mono text-slate-900">
                        {formatCurrency(exp.amount)}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                          title="Delete expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Invoices */}
      {activeTab === "invoices" && (
        <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
          {invoices.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500 font-mono">
              No invoices generated yet. Invoices are generated automatically when orders are confirmed.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-600 uppercase text-[10px] font-mono tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Invoice #</th>
                    <th className="py-2.5 px-4 font-semibold">Date</th>
                    <th className="py-2.5 px-4 font-semibold">Order Ref</th>
                    <th className="py-2.5 px-4 font-semibold">Customer</th>
                    <th className="py-2.5 px-4 text-right font-semibold">Grand Total</th>
                    <th className="py-2.5 px-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                        {inv.invoice_number}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">{formatDate(inv.invoice_date)}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-600">
                        {inv.orders?.order_number || "—"}
                      </td>
                      <td className="py-2.5 px-4 text-slate-800 font-medium">
                        {inv.orders?.customer_name || "—"}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold font-mono text-slate-900">
                        {formatCurrency(inv.grand_total)}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <Link
                          href={`/admin/orders/${inv.order_id}/invoice`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Print
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Record Expense Slide-over Drawer (Right to Left) */}
      {isExpenseDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsExpenseDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out animate-in slide-in-from-right">
            <div className="px-5 py-3.5 border-b border-slate-200/80 bg-slate-50/75 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Record Business Expense</h2>
                <p className="text-xs text-slate-500">Track operating outlays, tea leaves procurement &amp; logistics</p>
              </div>
              <button
                type="button"
                onClick={() => setIsExpenseDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="flex-1 flex flex-col overflow-hidden text-xs">
              <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
                {expenseError && (
                  <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
                    {expenseError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expense Category *
                  </label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Packaging">Packaging &amp; Pouches</option>
                    <option value="Raw Materials">Raw Tea Leaf / Spices</option>
                    <option value="Shipping Logistics">Shipping &amp; Couriers</option>
                    <option value="Warehousing">Warehousing &amp; Storage</option>
                    <option value="Marketing">Marketing &amp; Ads</option>
                    <option value="Software">Software &amp; Domain</option>
                    <option value="General">General Operational</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    required
                    value={expDesc}
                    onChange={(e) => setExpDesc(e.target.value)}
                    placeholder="e.g. 500 kraft ziplock pouches from supplier"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Amount (₹) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={expAmount}
                      onChange={(e) => setExpAmount(e.target.value)}
                      placeholder="2500.00"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Expense Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={expDate}
                      onChange={(e) => setExpDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <ImageUploader
                    label="Expense Receipt / Invoice Document"
                    value={expReceipt}
                    onChange={(url) => setExpReceipt(url as string)}
                    bucket="invoices"
                    helperText="Attach bill, GST voucher or payment receipt"
                  />
                </div>
              </div>

              <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/75 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsExpenseDrawerOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingExpense}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 disabled:opacity-50 transition shadow-xs"
                >
                  {savingExpense && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
