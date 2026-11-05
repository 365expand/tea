export function OrderStatusBadge({ status }: { status: string }) {
  const configs: Record<string, { bg: string; dot: string; label?: string }> = {
    pending: { bg: "bg-amber-50 text-amber-800 border-amber-200", dot: "bg-amber-500" },
    confirmed: { bg: "bg-sky-50 text-sky-800 border-sky-200", dot: "bg-sky-500" },
    processing: { bg: "bg-indigo-50 text-indigo-800 border-indigo-200", dot: "bg-indigo-500" },
    shipped: { bg: "bg-purple-50 text-purple-800 border-purple-200", dot: "bg-purple-500" },
    delivered: { bg: "bg-emerald-50 text-emerald-800 border-emerald-200", dot: "bg-emerald-500" },
    cancelled: { bg: "bg-slate-100 text-slate-700 border-slate-200", dot: "bg-slate-400" },
    returned: { bg: "bg-rose-50 text-rose-800 border-rose-200", dot: "bg-rose-500" },
  };

  const conf = configs[status] || { bg: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium border uppercase tracking-wider ${conf.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${conf.dot}`} />
      {status}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: string }) {
  const configs: Record<string, { bg: string; dot: string; label?: string }> = {
    pending: { bg: "bg-amber-50 text-amber-800 border-amber-200", dot: "bg-amber-500" },
    paid: { bg: "bg-emerald-50 text-emerald-800 border-emerald-200", dot: "bg-emerald-500" },
    failed: { bg: "bg-rose-50 text-rose-800 border-rose-200", dot: "bg-rose-500" },
    partially_refunded: { bg: "bg-orange-50 text-orange-800 border-orange-200", dot: "bg-orange-500" },
    refunded: { bg: "bg-slate-100 text-slate-700 border-slate-200", dot: "bg-slate-400" },
  };

  const conf = configs[status] || { bg: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" };
  const label = status.replace("_", " ");

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium border uppercase tracking-wider ${conf.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${conf.dot}`} />
      {label}
    </span>
  );
}

export function ReviewStatusBadge({ status }: { status: string }) {
  const configs: Record<string, { bg: string; dot: string }> = {
    pending: { bg: "bg-amber-50 text-amber-800 border-amber-200", dot: "bg-amber-500" },
    approved: { bg: "bg-emerald-50 text-emerald-800 border-emerald-200", dot: "bg-emerald-500" },
    rejected: { bg: "bg-rose-50 text-rose-800 border-rose-200", dot: "bg-rose-500" },
  };

  const conf = configs[status] || { bg: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium border uppercase tracking-wider ${conf.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${conf.dot}`} />
      {status}
    </span>
  );
}

export function ProductStatusBadge({ status }: { status: string }) {
  const configs: Record<string, { bg: string; dot: string }> = {
    active: { bg: "bg-emerald-50 text-emerald-800 border-emerald-200", dot: "bg-emerald-500" },
    draft: { bg: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" },
    archived: { bg: "bg-amber-50 text-amber-800 border-amber-200", dot: "bg-amber-500" },
  };

  const conf = configs[status] || { bg: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium border uppercase tracking-wider ${conf.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${conf.dot}`} />
      {status}
    </span>
  );
}
