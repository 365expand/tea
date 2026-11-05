import Link from "next/link";
import {
  Leaf,
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  Truck,
  Sparkles,
  CreditCard,
  ArrowRight,
} from "lucide-react";

export type StoreFooterProps = {
  generalSettings?: any;
  socialSettings?: any;
  contactSettings?: any;
  footerSettings?: any;
  footerMenus?: { label: string; url: string }[];
};

export function StoreFooter({
  generalSettings,
  socialSettings,
  contactSettings,
  footerSettings,
  footerMenus,
}: StoreFooterProps) {
  const currentYear = new Date().getFullYear();
  const siteName = generalSettings?.website_name || "Pure Pour Co.";
  const tagline =
    generalSettings?.tagline ||
    "Artisanal single-origin tea, honestly sourced from heritage estate gardens";
  const supportEmail =
    contactSettings?.email || generalSettings?.support_email || "care@purepour.co";
  const phone = contactSettings?.phone || contactSettings?.whatsapp || "+91 98765 43210";
  const address =
    contactSettings?.address ||
    "Heritage Tea Estate Hub, Upper Assam & Darjeeling, India";

  const hasSocials =
    socialSettings?.instagram ||
    socialSettings?.facebook ||
    socialSettings?.twitter ||
    socialSettings?.youtube;

  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800 text-xs">
      {/* Top Quality & Trust Value Strip */}
      <div className="border-b border-stone-800/80 bg-stone-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-stone-100 text-xs tracking-tight">
                  Single-Estate Origin
                </h4>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  100% pure orthodox &amp; whole leaves
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-stone-100 text-xs tracking-tight">
                  Pan-India Express
                </h4>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Fast courier dispatch within 48h
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-stone-100 text-xs tracking-tight">
                  Clean Promise
                </h4>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Zero artificial flavors or fillers
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-stone-100 text-xs tracking-tight">
                  Secure Checkout
                </h4>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  UPI, Cards, NetBanking &amp; COD
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Brand Info & Mission (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 text-white group">
              {generalSettings?.logo_url ? (
                <img
                  src={generalSettings.logo_url}
                  alt={siteName}
                  className="h-8 w-auto object-contain max-w-[130px] group-hover:scale-105 transition"
                />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition">
                  <Leaf className="w-4 h-4" />
                </div>
              )}
              <span className="font-bold text-lg tracking-tight font-serif">{siteName}</span>
            </Link>

            <p className="text-stone-400 text-xs leading-relaxed max-w-sm">
              {footerSettings?.about_text || tagline}
            </p>

            <div className="pt-1 text-[11px] text-stone-400 space-y-2">
              <p className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Mon – Sat: 9:00 AM – 6:30 PM IST</span>
              </p>
            </div>

            {/* Social media channels if configured */}
            {hasSocials && (
              <div className="flex items-center gap-2 pt-2">
                {socialSettings?.instagram && (
                  <a
                    href={socialSettings.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-white hover:border-stone-700 flex items-center justify-center transition"
                    aria-label="Instagram"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                )}
                {socialSettings?.facebook && (
                  <a
                    href={socialSettings.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-white hover:border-stone-700 flex items-center justify-center transition"
                    aria-label="Facebook"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
                {socialSettings?.twitter && (
                  <a
                    href={socialSettings.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-white hover:border-stone-700 flex items-center justify-center transition"
                    aria-label="Twitter / X"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                )}
                {socialSettings?.youtube && (
                  <a
                    href={socialSettings.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-white hover:border-stone-700 flex items-center justify-center transition"
                    aria-label="YouTube"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Sourcing & Harvests (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-white text-[11px]">
              Explore Teas
            </h4>
            <ul className="space-y-2 text-stone-400 text-xs">
              <li>
                <Link href="/products" className="hover:text-emerald-400 transition">
                  Shop All Harvests
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-emerald-400 transition">
                  Browse Collections
                </Link>
              </li>
              <li>
                <Link href="/about-us" className="hover:text-emerald-400 transition">
                  Our Sourcing Story
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="hover:text-emerald-400 transition">
                  Brewing Knowledge
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service & Track (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-white text-[11px]">
              Orders &amp; Concierge
            </h4>
            <ul className="space-y-2 text-stone-400 text-xs">
              <li>
                <Link
                  href="/track-order"
                  className="hover:text-emerald-400 font-semibold text-emerald-400 flex items-center gap-1 transition"
                >
                  <span>Track Your Order</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-emerald-400 transition">
                  Customer Account
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-400 transition">
                  Contact Tea Concierge
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="hover:text-emerald-400 transition">
                  FAQs &amp; Shipping Turnaround
                </Link>
              </li>
              <li>
                <Link href="/shipping-return-policy" className="hover:text-emerald-400 transition">
                  Shipping &amp; Return Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Policies & Direct Contact (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-white text-[11px]">
              Trust &amp; Direct Support
            </h4>
            <ul className="space-y-2 text-stone-400 text-xs">
              <li>
                <Link href="/privacy-policy" className="hover:text-emerald-400 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-conditions" className="hover:text-emerald-400 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/shipping-return-policy" className="hover:text-emerald-400 transition">
                  Cancellation &amp; Refund Policy
                </Link>
              </li>
            </ul>

            <div className="pt-3 border-t border-stone-800 text-[11px] text-stone-400 space-y-1.5">
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a
                  href={`mailto:${supportEmail}`}
                  className="hover:text-white font-mono transition"
                >
                  {supportEmail}
                </a>
              </p>
              {phone && (
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <a
                    href={`tel:${phone}`}
                    className="hover:text-white font-mono transition"
                  >
                    {phone}
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
          <p>© {currentYear} {siteName}. All rights reserved.</p>
          <p className="text-stone-400 font-serif italic text-xs">
            Crafted for unadulterated, single-origin Indian tea connoisseurs.
          </p>
        </div>
      </div>
    </footer>
  );
}
