"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Star,
  Users,
  ShoppingCart,
  ReceiptIndianRupee,
  Settings,
  Leaf,
  ExternalLink,
  Sparkles,
  Tag,
  ChevronRight,
  Database,
  HelpCircle,
  Mail,
} from "lucide-react";

interface AdminSidebarProps {
  onClose?: () => void;
  adminName?: string;
  adminEmail?: string;
  roleName?: string;
  logoUrl?: string;
  websiteName?: string;
}

export function AdminSidebar({
  onClose,
  adminName,
  adminEmail,
  roleName,
  logoUrl,
  websiteName = "Pure Pour Co.",
}: AdminSidebarProps) {
  const pathname = usePathname();

  const links = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Categories", href: "/admin/categories", icon: FolderTree },
    { label: "Ingredients", href: "/admin/ingredients", icon: Sparkles },
    { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { label: "Customers", href: "/admin/customers", icon: Users },
    { label: "Inquiries", href: "/admin/inquiries", icon: Mail },
    { label: "Coupons", href: "/admin/coupons", icon: Tag },
    { label: "Reviews", href: "/admin/reviews", icon: Star },
    { label: "FAQs", href: "/admin/faqs", icon: HelpCircle },
    { label: "Finance", href: "/admin/finance", icon: ReceiptIndianRupee },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="w-60 bg-white text-slate-700 flex flex-col h-full border-r border-slate-200/80 shadow-xs">
      {/* Brand header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-slate-100">
        <Link href="/admin" className="flex items-center gap-2.5 font-semibold text-slate-900 group">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={websiteName}
              className="h-8 w-auto max-w-[36px] object-contain group-hover:scale-105 transition"
            />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition">
              <Leaf className="w-4 h-4" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold tracking-tight text-slate-900 truncate max-w-[130px]">
                {websiteName}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            </div>
            <span className="text-[10px] text-slate-400 font-mono tracking-tight block">Console v2.0</span>
          </div>
        </Link>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
        <div className="px-2 pb-1.5 flex items-center justify-between text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
          <span>Manage</span>
          <Database className="w-3 h-3 text-slate-400" />
        </div>

        {links.map((link) => {
          const active = isActive(link.href, link.exact);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all group ${
                active
                  ? "bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/80 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    active ? "text-emerald-700" : "text-slate-400 group-hover:text-slate-700"
                  }`}
                />
                <span>{link.label}</span>
              </div>
              {active && <ChevronRight className="w-3 h-3 text-emerald-600" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile & Store link */}
      <div className="p-2.5 border-t border-slate-100 bg-slate-50/50 space-y-1.5">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition shadow-2xs"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            Storefront
          </span>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-mono font-medium">
            LIVE
          </span>
        </a>

        <div className="px-2.5 py-1.5 rounded-md bg-white border border-slate-200/80 flex items-center justify-between">
          <div className="truncate">
            <p className="text-xs font-semibold text-slate-800 truncate">{adminName || "Administrator"}</p>
            <p className="text-[10px] text-slate-400 font-mono truncate">{adminEmail || "admin@purepour.co"}</p>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase font-mono tracking-wider">
            {roleName || "admin"}
          </span>
        </div>
      </div>
    </aside>
  );
}
