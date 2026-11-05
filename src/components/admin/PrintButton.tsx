"use client";

import { Printer } from "lucide-react";

export function PrintButton({ label = "Print Document" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono font-bold rounded-lg flex items-center gap-2 shadow-xs transition cursor-pointer"
    >
      <Printer className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}

