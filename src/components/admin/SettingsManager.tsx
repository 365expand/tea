"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "./ImageUploader";
import { RichTextEditor } from "./RichTextEditor";
import {
  Globe,
  Share2,
  Mail,
  Building2,
  CreditCard,
  Send,
  FileCode,
  Truck,
  UserCheck,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Info,
} from "lucide-react";

export type SettingsMap = {
  general: any;
  seo: any;
  social: any;
  contact: any;
  business: any;
  payment: any;
  smtp: any;
  shipping: any;
  email_templates: any[];
  secretStatus: {
    hasRazorpaySecret: boolean;
    hasSmtpPassword: boolean;
  };
  currentAdmin?: any;
};

export function SettingsManager({ initialData }: { initialData: SettingsMap }) {
  const router = useRouter();
  const [tab, setTab] = useState<
    | "general"
    | "seo"
    | "social"
    | "contact"
    | "business"
    | "payment"
    | "smtp"
    | "templates"
    | "shipping"
    | "account"
  >("general");

  // Setting states
  const [general, setGeneral] = useState(initialData.general || {});
  const [seo, setSeo] = useState(initialData.seo || {});
  const [social, setSocial] = useState(initialData.social || {});
  const [contact, setContact] = useState(initialData.contact || {});
  const [business, setBusiness] = useState(initialData.business || {});
  const [payment, setPayment] = useState(initialData.payment || {});
  const [smtp, setSmtp] = useState(initialData.smtp || {});
  const [shipping, setShipping] = useState(initialData.shipping || {});
  const [templates, setTemplates] = useState<any[]>(initialData.email_templates || []);
  const [secretStatus, setSecretStatus] = useState(initialData.secretStatus || {
    hasRazorpaySecret: false,
    hasSmtpPassword: false,
  });

  // Vault secrets (only set on input, never prefilled from server)
  const [razorpaySecretInput, setRazorpaySecretInput] = useState("");
  const [smtpPasswordInput, setSmtpPasswordInput] = useState("");

  // Test email state
  const [testEmailTo, setTestEmailTo] = useState("");
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; msg: string } | null>(null);

  // Template editor state
  const [selectedTemplateKey, setSelectedTemplateKey] = useState(
    initialData.email_templates?.[0]?.key || "order_confirmation"
  );

  // Account states
  const [adminPassword, setAdminPassword] = useState("");
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState("");
  const [adminName, setAdminName] = useState(initialData.currentAdmin?.fullName || "");
  const [adminEmail, setAdminEmail] = useState(initialData.currentAdmin?.email || "");

  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const currentTemplate = templates.find((t) => t.key === selectedTemplateKey) || templates[0];

  const handleSaveGroup = async (groupName: string, value: any, isPublic = false) => {
    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: groupName, value, groupName, isPublic }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update settings");

      setStatusMessage("Settings updated successfully!");
      setTimeout(() => setStatusMessage(null), 3000);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Save standard settings
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "payment",
          value: payment,
          groupName: "payment",
          isPublic: false,
        }),
      });

      // 2. If new secret entered, save directly to Supabase Vault
      if (razorpaySecretInput.trim()) {
        const res = await fetch("/api/admin/settings/secrets", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "razorpay_secret", secret: razorpaySecretInput.trim() }),
        });
        if (!res.ok) throw new Error("Failed to save secret to Supabase Vault");
        setSecretStatus({ ...secretStatus, hasRazorpaySecret: true });
        setRazorpaySecretInput("");
      }

      setStatusMessage("Payment configuration and vault keys saved!");
      setTimeout(() => setStatusMessage(null), 3000);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Save settings
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "smtp",
          value: smtp,
          groupName: "smtp",
          isPublic: false,
        }),
      });

      // 2. If new SMTP password entered, save to Supabase Vault
      if (smtpPasswordInput.trim()) {
        const res = await fetch("/api/admin/settings/secrets", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "smtp_password", secret: smtpPasswordInput.trim() }),
        });
        if (!res.ok) throw new Error("Failed to save SMTP password to Vault");
        setSecretStatus({ ...secretStatus, hasSmtpPassword: true });
        setSmtpPasswordInput("");
      }

      setStatusMessage("SMTP settings and encrypted password saved!");
      setTimeout(() => setStatusMessage(null), 3000);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailTo.trim()) return;

    setSendingTestEmail(true);
    setTestEmailResult(null);

    try {
      const res = await fetch("/api/admin/settings/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testEmailTo }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.reason || "Delivery failed");
      }
      setTestEmailResult({ success: true, msg: `Test email dispatched to ${testEmailTo}!` });
    } catch (err: any) {
      setTestEmailResult({ success: false, msg: err.message || "Failed to send test email" });
    } finally {
      setSendingTestEmail(false);
    }
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTemplate) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentTemplate),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save template");

      setStatusMessage(`Template "${currentTemplate.name}" saved!`);
      setTimeout(() => setStatusMessage(null), 3000);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword && adminPassword !== adminPasswordConfirm) {
      alert("Passwords do not match");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: adminName,
          email: adminEmail,
          password: adminPassword || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update account");

      setStatusMessage("Account updated!");
      setAdminPassword("");
      setAdminPasswordConfirm("");
      setTimeout(() => setStatusMessage(null), 3000);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { key: "general", label: "General", icon: Globe },
    { key: "seo", label: "SEO", icon: Sparkles },
    { key: "social", label: "Social Media", icon: Share2 },
    { key: "contact", label: "Contact Info", icon: Mail },
    { key: "business", label: "Business & Tax", icon: Building2 },
    { key: "payment", label: "Payments (Razorpay & COD)", icon: CreditCard },
    { key: "smtp", label: "SMTP Email", icon: Send },
    { key: "templates", label: "Email Templates", icon: FileCode },
    { key: "shipping", label: "Shipping Rates", icon: Truck },
    { key: "account", label: "Admin Account", icon: UserCheck },
  ] as const;

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">System Configuration</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Store identity, tax &amp; GST compliance, payment gateways, encrypted secrets and email servers
          </p>
        </div>

        {statusMessage && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {statusMessage}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Left Side Tab Navigation */}
        <div className="md:col-span-1 bg-white border border-slate-200/80 rounded-xl p-1.5 shadow-xs space-y-0.5 h-fit sticky top-16">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition text-left ${
                  isActive
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold shadow-2xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Content Area */}
        <div className="md:col-span-3 bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          {/* TAB 1: GENERAL */}
          {tab === "general" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveGroup("general", general, true);
              }}
              className="space-y-3.5 text-xs"
            >
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Store Branding &amp; General Settings
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Website Name *
                </label>
                <input
                  type="text"
                  required
                  value={general.website_name || ""}
                  onChange={(e) => setGeneral({ ...general, website_name: e.target.value })}
                  placeholder="Pure Pour Co."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tagline / Motto
                </label>
                <input
                  type="text"
                  value={general.tagline || ""}
                  onChange={(e) => setGeneral({ ...general, tagline: e.target.value })}
                  placeholder="Single-origin teas, honestly sourced"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <ImageUploader
                  label="Primary Logo (Dark on Light Header)"
                  value={general.logo_url || ""}
                  onChange={(url) => setGeneral({ ...general, logo_url: url as string })}
                  bucket="branding"
                />
              </div>

              <div>
                <ImageUploader
                  label="Favicon (Square PNG / ICO)"
                  value={general.favicon_url || ""}
                  onChange={(url) => setGeneral({ ...general, favicon_url: url as string })}
                  bucket="branding"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Store Currency
                  </label>
                  <input
                    type="text"
                    disabled
                    value="INR (₹)"
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 bg-slate-50 text-slate-500 font-mono rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Timezone
                  </label>
                  <input
                    type="text"
                    value={general.timezone || "Asia/Kolkata"}
                    onChange={(e) => setGeneral({ ...general, timezone: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save General Settings
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SEO */}
          {tab === "seo" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveGroup("seo", seo, true);
              }}
              className="space-y-3.5 text-xs"
            >
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Default Store SEO Metadata
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Default Meta Title *
                </label>
                <input
                  type="text"
                  required
                  value={seo.default_meta_title || ""}
                  onChange={(e) => setSeo({ ...seo, default_meta_title: e.target.value })}
                  placeholder="Pure Pour Co. | Artisanal Indian Teas"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Default Meta Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={seo.default_meta_description || ""}
                  onChange={(e) => setSeo({ ...seo, default_meta_description: e.target.value })}
                  placeholder="Shop fresh single-origin teas, blends and brewing essentials with honest sourcing..."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Default Keywords
                </label>
                <input
                  type="text"
                  value={seo.default_meta_keywords || ""}
                  onChange={(e) => setSeo({ ...seo, default_meta_keywords: e.target.value })}
                  placeholder="tea, chai, buy tea online, assam ctc, darjeeling"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <ImageUploader
                  label="Default Social Share Image (Open Graph)"
                  value={seo.default_og_image || ""}
                  onChange={(url) => setSeo({ ...seo, default_og_image: url as string })}
                  bucket="branding"
                />
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save SEO Settings
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: SOCIAL */}
          {tab === "social" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveGroup("social", social, true);
              }}
              className="space-y-3.5 text-xs"
            >
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Social Media Profiles
              </h3>

              {["instagram", "facebook", "youtube", "twitter", "pinterest"].map((net) => (
                <div key={net}>
                  <label className="block text-xs font-semibold text-slate-700 capitalize mb-1">
                    {net} Profile URL
                  </label>
                  <input
                    type="url"
                    value={social[net] || ""}
                    onChange={(e) => setSocial({ ...social, [net]: e.target.value })}
                    placeholder={`https://${net}.com/purepour`}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              ))}

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Social Links
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: CONTACT */}
          {tab === "contact" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveGroup("contact", contact, true);
              }}
              className="space-y-3.5 text-xs"
            >
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Public Contact &amp; Support Info
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Support Email *
                </label>
                <input
                  type="email"
                  required
                  value={contact.email || ""}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  placeholder="hello@purepour.co"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Support Phone
                  </label>
                  <input
                    type="text"
                    value={contact.phone || ""}
                    onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={contact.whatsapp || ""}
                    onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 font-mono font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business / Garden Address
                </label>
                <textarea
                  rows={3}
                  value={contact.address || ""}
                  onChange={(e) => setContact({ ...contact, address: e.target.value })}
                  placeholder="12 Tea Estate Road, Upper Assam, India"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Contact Info
                </button>
              </div>
            </form>
          )}

          {/* TAB 5: BUSINESS & TAX */}
          {tab === "business" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveGroup("business", business, false);
              }}
              className="space-y-3.5 text-xs"
            >
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Business Legal Information &amp; GST Details
              </h3>

              {/* GST Enable / Disable Setting */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">
                      GST / Tax Calculation &amp; Display
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      Toggle whether GST is computed on checkout and printed on tax invoices
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={business.tax_enabled ?? true}
                      onChange={(e) => setBusiness({ ...business, tax_enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {business.tax_enabled === false ? (
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-mono flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      GST is currently <strong>DISABLED</strong>. Products will be billed with 0% tax, and GST details will be hidden on checkout and billing slips.
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-mono flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <span>
                      GST is <strong>ENABLED</strong> ({business.default_tax_rate ?? 5}% default). Tax amounts will be calculated on orders and itemized on tax invoices.
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Legal Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={business.business_name || ""}
                  onChange={(e) => setBusiness({ ...business, business_name: e.target.value })}
                  placeholder="Pure Pour Co. Private Limited"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Business Address
                </label>
                <textarea
                  rows={2}
                  value={business.address || ""}
                  onChange={(e) => setBusiness({ ...business, address: e.target.value })}
                  placeholder="12 Tea Garden Road, Guwahati, Assam 781001"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    GSTIN (Tax ID)
                  </label>
                  <input
                    type="text"
                    value={business.gstin || ""}
                    onChange={(e) => setBusiness({ ...business, gstin: e.target.value.toUpperCase() })}
                    placeholder="18AABCC1234D1Z5"
                    className="w-full px-3 py-1.5 text-xs font-mono uppercase bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Place of Supply (State)
                  </label>
                  <input
                    type="text"
                    value={business.place_of_supply || "Assam, India"}
                    onChange={(e) => setBusiness({ ...business, place_of_supply: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 border-t border-slate-100 pt-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Invoice Prefix
                  </label>
                  <input
                    type="text"
                    value={business.invoice_prefix || "INV"}
                    onChange={(e) => setBusiness({ ...business, invoice_prefix: e.target.value })}
                    placeholder="INV"
                    className="w-full px-3 py-1.5 text-xs font-mono uppercase bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Default Tea HSN
                  </label>
                  <input
                    type="text"
                    value={business.hsn_default || "0902"}
                    onChange={(e) => setBusiness({ ...business, hsn_default: e.target.value })}
                    placeholder="0902"
                    className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Default GST Rate (%) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    value={business.default_tax_rate ?? 5}
                    onChange={(e) =>
                      setBusiness({ ...business, default_tax_rate: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Invoice Terms &amp; Conditions
                </label>
                <textarea
                  rows={2}
                  value={business.invoice_terms || ""}
                  onChange={(e) => setBusiness({ ...business, invoice_terms: e.target.value })}
                  placeholder="Goods once sold are not returnable except as per policy."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Business &amp; Tax Info
                </button>
              </div>
            </form>
          )}

          {/* TAB 6: PAYMENT */}
          {tab === "payment" && (
            <form onSubmit={handleSavePayment} className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-900 font-mono">
                  Payment Gateways (Razorpay &amp; Cash On Delivery)
                </h3>
                <span className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-mono font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Supabase Vault
                </span>
              </div>

              {/* COD Toggle */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <label className="relative flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-900">
                  <input
                    type="checkbox"
                    checked={payment.cod_enabled !== false}
                    onChange={(e) => setPayment({ ...payment, cod_enabled: e.target.checked })}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  Enable Cash on Delivery (COD)
                </label>
                <p className="text-[11px] font-mono text-slate-500 pl-6">
                  Customers pay in cash when the courier delivers their parcel.
                </p>
              </div>

              {/* Razorpay Toggle */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="relative flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-900">
                    <input
                      type="checkbox"
                      checked={Boolean(payment.razorpay_enabled)}
                      onChange={(e) => setPayment({ ...payment, razorpay_enabled: e.target.checked })}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    Enable Razorpay (UPI, Credit/Debit Cards, NetBanking, Wallets)
                  </label>
                  <select
                    value={payment.payment_mode || "test"}
                    onChange={(e) => setPayment({ ...payment, payment_mode: e.target.value })}
                    className="px-2.5 py-1 text-xs border border-slate-300 rounded-md font-mono bg-white text-slate-800 font-semibold"
                  >
                    <option value="test">Test Mode</option>
                    <option value="live">Live Mode</option>
                  </select>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Razorpay Key ID
                    </label>
                    <input
                      type="text"
                      value={payment.razorpay_key_id || ""}
                      onChange={(e) => setPayment({ ...payment, razorpay_key_id: e.target.value })}
                      placeholder="rzp_test_... or rzp_live_..."
                      className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Razorpay Key Secret (Stored in Supabase Vault)
                      </label>
                      {secretStatus.hasRazorpaySecret && (
                        <span className="text-[11px] font-mono text-emerald-700 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Configured
                        </span>
                      )}
                    </div>
                    <input
                      type="password"
                      value={razorpaySecretInput}
                      onChange={(e) => setRazorpaySecretInput(e.target.value)}
                      placeholder={
                        secretStatus.hasRazorpaySecret
                          ? "•••••••••••••••••••••••• (Leave blank to keep existing)"
                          : "Enter Razorpay key secret..."
                      }
                      className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                      The secret key is encrypted at rest in the PostgreSQL Vault and is never sent back to the browser.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Payment Configuration
                </button>
              </div>
            </form>
          )}

          {/* TAB 7: SMTP */}
          {tab === "smtp" && (
            <div className="space-y-4 text-xs">
              <form onSubmit={handleSaveSmtp} className="space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900 font-mono">
                    SMTP Outgoing Mail Server
                  </h3>
                  <span className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-mono font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Supabase Vault
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <label className="relative flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-900">
                    <input
                      type="checkbox"
                      checked={Boolean(smtp.enabled)}
                      onChange={(e) => setSmtp({ ...smtp, enabled: e.target.checked })}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    Enable Transactional Emails via SMTP
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      SMTP Server Host *
                    </label>
                    <input
                      type="text"
                      value={smtp.host || ""}
                      onChange={(e) => setSmtp({ ...smtp, host: e.target.value })}
                      placeholder="smtp.gmail.com or smtp.mailgun.org"
                      className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Port *</label>
                    <input
                      type="number"
                      value={smtp.port || 587}
                      onChange={(e) => setSmtp({ ...smtp, port: parseInt(e.target.value) || 587 })}
                      className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      SMTP Username / Email *
                    </label>
                    <input
                      type="text"
                      value={smtp.username || ""}
                      onChange={(e) => setSmtp({ ...smtp, username: e.target.value })}
                      placeholder="orders@purepour.co"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">
                        SMTP Password (Vault Protected)
                      </label>
                      {secretStatus.hasSmtpPassword && (
                        <span className="text-[11px] font-mono text-emerald-700 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Configured
                        </span>
                      )}
                    </div>
                    <input
                      type="password"
                      value={smtpPasswordInput}
                      onChange={(e) => setSmtpPasswordInput(e.target.value)}
                      placeholder={
                        secretStatus.hasSmtpPassword
                          ? "•••••••••••••••• (Leave blank to keep existing)"
                          : "Enter SMTP app password..."
                      }
                      className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Encryption
                    </label>
                    <select
                      value={smtp.encryption || "tls"}
                      onChange={(e) => setSmtp({ ...smtp, encryption: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                    >
                      <option value="tls">STARTTLS (Port 587)</option>
                      <option value="ssl">SSL / TLS (Port 465)</option>
                      <option value="none">None (Port 25)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Sender Name
                    </label>
                    <input
                      type="text"
                      value={smtp.from_name || "Pure Pour Co."}
                      onChange={(e) => setSmtp({ ...smtp, from_name: e.target.value })}
                      placeholder="Pure Pour Co."
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Sender From Email
                    </label>
                    <input
                      type="email"
                      value={smtp.from_email || ""}
                      onChange={(e) => setSmtp({ ...smtp, from_email: e.target.value })}
                      placeholder="orders@purepour.co"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save SMTP Settings
                  </button>
                </div>
              </form>

              {/* Test Email Card */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5">
                <h4 className="text-xs font-semibold text-slate-800">
                  Send Test Email
                </h4>
                <p className="text-[11px] text-slate-500 font-mono">
                  Test your SMTP connectivity and credentials by sending a live test message.
                </p>

                <form onSubmit={handleSendTestEmail} className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={testEmailTo}
                    onChange={(e) => setTestEmailTo(e.target.value)}
                    placeholder="recipient@example.com"
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <button
                    type="submit"
                    disabled={sendingTestEmail}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    {sendingTestEmail ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    Send Test
                  </button>
                </form>

                {testEmailResult && (
                  <div
                    className={`p-2 rounded-lg text-xs font-mono font-medium ${
                      testEmailResult.success
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {testEmailResult.msg}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 8: EMAIL TEMPLATES */}
          {tab === "templates" && (
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-900 font-mono">
                  Transactional Email Templates
                </h3>
                <span className="text-[11px] font-mono text-slate-500">
                  Placeholders: <code>{"{{order_number}}"}</code>, <code>{"{{customer_name}}"}</code>
                </span>
              </div>

              {/* Template selector pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {templates.map((tmpl) => (
                  <button
                    key={tmpl.key}
                    type="button"
                    onClick={() => setSelectedTemplateKey(tmpl.key)}
                    className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition font-medium border ${
                      selectedTemplateKey === tmpl.key
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold shadow-2xs"
                        : "bg-slate-50 text-slate-600 hover:text-slate-900 border-slate-200"
                    }`}
                  >
                    {tmpl.name}
                  </button>
                ))}
              </div>

              {currentTemplate && (
                <form onSubmit={handleSaveTemplate} className="space-y-3.5 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Subject *
                    </label>
                    <input
                      type="text"
                      required
                      value={currentTemplate.subject}
                      onChange={(e) => {
                        const updated = templates.map((t) =>
                          t.key === currentTemplate.key ? { ...t, subject: e.target.value } : t
                        );
                        setTemplates(updated);
                      }}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                  </div>

                  <div>
                    <RichTextEditor
                      label="Email HTML Body *"
                      value={currentTemplate.body_html || ""}
                      onChange={(html) => {
                        const updated = templates.map((t) =>
                          t.key === currentTemplate.key ? { ...t, body_html: html } : t
                        );
                        setTemplates(updated);
                      }}
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                    <span className="font-semibold text-slate-800 block">Available Placeholders:</span>
                    <p className="font-mono text-[11px] text-emerald-800">
                      {"{{order_number}}"}, {"{{customer_name}}"}, {"{{order_total}}"}, {"{{site_name}}"}, {"{{courier_name}}"}, {"{{tracking_number}}"}, {"{{tracking_url}}"}, {"{{refund_amount}}"}
                    </p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Save Template
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 9: SHIPPING */}
          {tab === "shipping" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveGroup("shipping", shipping, true);
              }}
              className="space-y-3.5 text-xs"
            >
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Shipping Charges &amp; Delivery Rules
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Default Flat Shipping Charge (₹) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={shipping.default_charge ?? 60}
                    onChange={(e) =>
                      setShipping({ ...shipping, default_charge: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 font-bold"
                  />
                  <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                    Charged when cart subtotal is below the free threshold
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Free Shipping Threshold (₹) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={shipping.free_threshold ?? 999}
                    onChange={(e) =>
                      setShipping({ ...shipping, free_threshold: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 font-bold"
                  />
                  <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                    Orders at or above this amount qualify for ₹0 free shipping
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Delivery Information Notice
                </label>
                <textarea
                  rows={3}
                  value={shipping.delivery_info || ""}
                  onChange={(e) => setShipping({ ...shipping, delivery_info: e.target.value })}
                  placeholder="Orders are dispatched within 1-2 business days..."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Shipping Rules
                </button>
              </div>
            </form>
          )}

          {/* TAB 10: ACCOUNT */}
          {tab === "account" && (
            <form onSubmit={handleSaveAccount} className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-900 font-mono">
                  Administrator Profile &amp; Credentials
                </h3>
                {initialData.currentAdmin?.roleName && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {initialData.currentAdmin.roleName}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Admin Full Name / Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="e.g. Pure Pour Master"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                  <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                    Displayed on audit logs, admin replies to reviews, and invoices
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Admin Sign-In Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@purepour.co"
                    className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                    Used to log into the admin panel at /admin/login
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5">
                <h4 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Security: Change Password (Optional)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Leave blank to keep unchanged"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={adminPasswordConfirm}
                      onChange={(e) => setAdminPasswordConfirm(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Update Profile
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
