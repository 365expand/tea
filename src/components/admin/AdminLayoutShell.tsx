"use client";

import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

interface AdminLayoutShellProps {
  children: React.ReactNode;
  adminName?: string;
  adminEmail?: string;
  roleName?: string;
  logoUrl?: string;
  websiteName?: string;
}

export function AdminLayoutShell({
  children,
  adminName,
  adminEmail,
  roleName,
  logoUrl,
  websiteName,
}: AdminLayoutShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 font-sans">
      {/* Desktop sidebar */}
      <div className="hidden lg:block w-60 flex-shrink-0 sticky top-0 h-screen z-40">
        <AdminSidebar
          adminName={adminName}
          adminEmail={adminEmail}
          roleName={roleName}
          logoUrl={logoUrl}
          websiteName={websiteName}
        />
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 transition-opacity backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-60 z-50 shadow-2xl">
            <AdminSidebar
              onClose={() => setMobileMenuOpen(false)}
              adminName={adminName}
              adminEmail={adminEmail}
              roleName={roleName}
              logoUrl={logoUrl}
              websiteName={websiteName}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        <AdminHeader
          onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
          adminName={adminName}
          adminEmail={adminEmail}
          websiteName={websiteName}
        />
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
