"use client";

import { Menu, LogOut, Database, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface AdminHeaderProps {
  onToggleMobileMenu: () => void;
  adminName?: string;
  adminEmail?: string;
  websiteName?: string;
}

export function AdminHeader({
  onToggleMobileMenu,
  adminName,
  adminEmail,
  websiteName = "Pure Pour Co.",
}: AdminHeaderProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          type="button"
          className="lg:hidden p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-mono border border-emerald-200 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live DB
          </span>
          <span className="text-xs text-slate-300 hidden sm:inline">/</span>
          <span className="text-xs text-slate-500 hidden sm:inline font-medium">{websiteName} Storefront</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-semibold text-slate-800">{adminName || "Administrator"}</p>
          <p className="text-[10px] text-slate-400 font-mono">{adminEmail || "admin@purepour.co"}</p>
        </div>

        <button
          onClick={handleSignOut}
          type="button"
          title="Sign out of Admin Console"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-700 bg-slate-50 hover:bg-rose-50 rounded-md border border-slate-200 hover:border-rose-200 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
