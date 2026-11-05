import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  FinanceManager,
  FinanceOverview,
  TransactionRow,
  ExpenseRow,
  InvoiceRow,
} from "@/components/admin/FinanceManager";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const admin = createSupabaseAdminClient();

  const [
    { data: orders },
    { data: payments },
    { data: refunds },
    { data: expenses },
    { data: transactions },
    { data: invoices },
  ] = await Promise.all([
    admin.from("orders").select("grand_total, status, payment_status, payment_method"),
    admin.from("payments").select("amount, status").eq("status", "paid"),
    admin.from("refunds").select("amount, status"),
    admin.from("expenses").select("*").order("expense_date", { ascending: false }),
    admin
      .from("transactions")
      .select("*, orders(order_number)")
      .order("occurred_at", { ascending: false }),
    admin
      .from("invoices")
      .select("*, orders(order_number, customer_name)")
      .order("invoice_date", { ascending: false }),
  ]);

  const grossSales = (orders || [])
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.grand_total || 0), 0);

  const totalCollected = (payments || []).reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  const pendingCollection = (orders || [])
    .filter((o) => o.payment_status !== "paid" && o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.grand_total || 0), 0);

  const totalRefunds = (refunds || []).reduce(
    (sum, r) => sum + Number(r.amount || 0),
    0
  );

  const totalExpenses = (expenses || []).reduce(
    (sum, e) => sum + Number(e.amount || 0),
    0
  );

  const netRevenue = totalCollected - totalRefunds - totalExpenses;

  const overview: FinanceOverview = {
    grossSales,
    totalCollected,
    pendingCollection,
    totalRefunds,
    totalExpenses,
    netRevenue,
  };

  return (
    <FinanceManager
      overview={overview}
      transactions={(transactions || []) as TransactionRow[]}
      expenses={(expenses || []) as ExpenseRow[]}
      invoices={(invoices || []) as InvoiceRow[]}
    />
  );
}

