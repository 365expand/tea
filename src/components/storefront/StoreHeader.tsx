"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";
import {
  ShoppingBag,
  User,
  Search,
  Menu,
  X,
  Leaf,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Mail,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type StoreHeaderProps = {
  announcement?: { title: string; link_url?: string | null } | null;
  generalSettings?: { website_name?: string; logo_url?: string; tagline?: string } | null;
  headerMenus?: { label: string; url: string }[];
  userEmail?: string | null;
  userName?: string | null;
};

export function StoreHeader({
  announcement,
  generalSettings,
  userEmail,
  userName,
}: StoreHeaderProps) {
  const pathname = usePathname();
  const { itemCount, setIsDrawerOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [knowMoreOpen, setKnowMoreOpen] = useState(false);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if announcement was previously dismissed in this session
  useEffect(() => {
    try {
      if (sessionStorage.getItem("announcement_dismissed") === "true") {
        setAnnouncementDismissed(true);
      }
    } catch (e) {
      // ignore in environments where sessionStorage is blocked
    }
  }, []);

  const handleDismissAnnouncement = () => {
    setAnnouncementDismissed(true);
    try {
      sessionStorage.setItem("announcement_dismissed", "true");
    } catch (e) {
      // ignore
    }
  };

  // Track scroll position to slim down header width and height
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setKnowMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setKnowMoreOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const websiteName = generalSettings?.website_name || "Pure Pour Co.";

  const knowMoreItems = [
    {
      label: "About Us",
      url: "/about-us",
      desc: "Single-estate heritage & direct garden sourcing",
      icon: Info,
    },
    {
      label: "FAQs",
      url: "/faqs",
      desc: "Steeping standards, shipping & storage guidance",
      icon: HelpCircle,
    },
    {
      label: "Contact",
      url: "/contact",
      desc: "Tea sommelier concierge & bespoke gifting",
      icon: Mail,
    },
  ];

  return (
    <header className="sticky top-0 z-40 select-none transition-all duration-300">
      {/* 1. Dismissible Top Announcement Bar */}
      <AnimatePresence>
        {!announcementDismissed && announcement?.title && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-brand-950 text-stone-200 text-[11px] font-medium tracking-wide relative overflow-hidden border-b border-brand-900/60"
          >
            <div className="max-w-7xl mx-auto px-8 py-2 flex items-center justify-center text-center relative">
              {announcement.link_url ? (
                <Link
                  href={announcement.link_url}
                  className="hover:text-white transition flex items-center gap-1.5 font-medium group"
                >
                  <span>{announcement.title}</span>
                  <span className="text-amber-300 font-bold group-hover:translate-x-0.5 transition-transform">
                    &rarr;
                  </span>
                </Link>
              ) : (
                <span>{announcement.title}</span>
              )}

              {/* Dismiss X button */}
              <button
                type="button"
                onClick={handleDismissAnnouncement}
                aria-label="Dismiss announcement"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-white rounded-md hover:bg-white/10 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Main Navigation Bar (Slims down & narrows width on scroll) */}
      <div
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-xs"
            : "bg-white border-b border-stone-200"
        }`}
      >
        <div
          className={`mx-auto px-4 sm:px-6 transition-all duration-300 flex items-center justify-between gap-3 sm:gap-6 ${
            isScrolled
              ? "max-w-5xl lg:max-w-6xl h-12"
              : "max-w-7xl h-16 sm:h-18"
          }`}
        >
          {/* Left: Mobile hamburger & Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 -ml-2 text-stone-700 hover:text-stone-900"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/" className="flex items-center gap-2.5 group">
              {generalSettings?.logo_url ? (
                <img
                  src={generalSettings.logo_url}
                  alt={websiteName}
                  className={`w-auto object-contain transition-all duration-300 ${
                    isScrolled ? "h-6 sm:h-7" : "h-8 sm:h-9"
                  }`}
                />
              ) : (
                <div
                  className={`rounded-xl bg-brand-800 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform ${
                    isScrolled ? "w-6 h-6" : "w-8 h-8"
                  }`}
                >
                  <Leaf className="w-4 h-4" />
                </div>
              )}
              <div>
                <span
                  className={`font-bold tracking-tight text-stone-900 block leading-tight font-serif transition-all duration-300 ${
                    isScrolled ? "text-xs sm:text-sm" : "text-base sm:text-lg"
                  }`}
                >
                  {websiteName}
                </span>
                <span
                  className={`text-stone-400 block tracking-normal font-sans transition-all duration-300 ${
                    isScrolled ? "text-[9px] -mt-0.5" : "text-[10px] -mt-0.5"
                  }`}
                >
                  Single-Origin Tea
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation Links + "Know More" Dropdown */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-semibold text-stone-700">
            <Link
              href="/"
              className={`hover:text-brand-800 transition ${
                pathname === "/" ? "text-brand-800 font-bold" : ""
              }`}
            >
              Home
            </Link>

            <Link
              href="/products"
              className={`hover:text-brand-800 transition ${
                pathname.startsWith("/product") ? "text-brand-800 font-bold" : ""
              }`}
            >
              Shop All Teas
            </Link>

            <Link
              href="/categories"
              className={`hover:text-brand-800 transition ${
                pathname.startsWith("/categor") ? "text-brand-800 font-bold" : ""
              }`}
            >
              Collections
            </Link>

            {/* "Know More" Dropdown Menu */}
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={() => setKnowMoreOpen(true)}
              onMouseLeave={() => setKnowMoreOpen(false)}
            >
              <button
                type="button"
                onClick={() => setKnowMoreOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 py-2 hover:text-brand-800 transition ${
                  knowMoreOpen ||
                  pathname === "/about-us" ||
                  pathname === "/faqs" ||
                  pathname === "/contact"
                    ? "text-brand-800 font-bold"
                    : ""
                }`}
                aria-expanded={knowMoreOpen}
              >
                <span>Know More</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    knowMoreOpen ? "rotate-180 text-brand-800" : "text-stone-400"
                  }`}
                />
              </button>

              <AnimatePresence>
                {knowMoreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute top-full left-0 w-72 bg-white rounded-2xl border border-stone-200 shadow-xl p-2 z-50 mt-1"
                  >
                    <div className="space-y-1">
                      {knowMoreItems.map((item) => {
                        const Icon = item.icon;
                        const isCurrent = pathname === item.url;
                        return (
                          <Link
                            key={item.url}
                            href={item.url}
                            className={`flex items-start gap-3 p-2.5 rounded-xl transition ${
                              isCurrent
                                ? "bg-brand-50 text-brand-900 font-semibold"
                                : "hover:bg-stone-50 text-stone-800"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700 shrink-0 mt-0.5">
                              <Icon className="w-4 h-4 text-brand-700" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-stone-900">
                                {item.label}
                              </div>
                              <div className="text-[11px] text-stone-500 font-normal leading-snug mt-0.5">
                                {item.desc}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Right: Big Search Input, Account & Cart */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            {/* Enlarged Prominent Search Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  window.location.href = `/products?q=${encodeURIComponent(
                    searchQuery.trim()
                  )}`;
                }
              }}
              className="relative hidden sm:block"
            >
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search single-origin teas, spices..."
                className={`pl-10 pr-8 bg-stone-100/90 hover:bg-stone-100 focus:bg-white border border-stone-200 rounded-full text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-700/20 focus:border-brand-600 transition-all duration-300 ${
                  isScrolled
                    ? "w-44 md:w-52 lg:w-60 py-1 text-xs"
                    : "w-56 md:w-64 lg:w-80 py-2 text-xs"
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </form>

            {/* Account link */}
            {userEmail ? (
              <Link
                href="/account"
                className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-brand-800 py-1.5 px-2.5 rounded-full hover:bg-stone-100 transition"
              >
                <User className="w-4 h-4 text-stone-500" />
                <span className="hidden lg:inline truncate max-w-[100px]">
                  {userName || "Account"}
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-xs font-semibold text-stone-700 hover:text-brand-800 py-1.5 px-3 rounded-full hover:bg-stone-100 transition hidden sm:inline-block"
              >
                Sign In
              </Link>
            )}

            {/* Cart Drawer Trigger */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className={`flex items-center gap-2 bg-stone-900 hover:bg-stone-800 active:scale-95 text-white rounded-full text-xs font-semibold transition-all shadow-sm ${
                isScrolled ? "px-3 py-1 text-[11px]" : "px-3.5 py-1.5 sm:py-2 text-xs"
              }`}
              aria-label="View shopping bag"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Bag</span>
              <span className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-white/20 text-white text-[10px] sm:text-[11px] font-bold flex items-center justify-center -mr-1">
                {itemCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-stone-200 bg-white px-4 py-4 space-y-4 shadow-xl overflow-hidden"
          >
            {/* Mobile Search */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  window.location.href = `/products?q=${encodeURIComponent(
                    searchQuery.trim()
                  )}`;
                }
              }}
              className="relative"
            >
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teas, spices, ware..."
                className="w-full pl-10 pr-3 py-2 text-xs bg-stone-100 border border-stone-200 rounded-xl focus:outline-none focus:border-brand-600"
              />
            </form>

            {/* Mobile Primary Links */}
            <nav className="space-y-1">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 px-3 text-xs font-semibold text-stone-800 hover:bg-stone-100 rounded-lg"
              >
                <span>Home</span>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              </Link>

              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 px-3 text-xs font-semibold text-stone-800 hover:bg-stone-100 rounded-lg"
              >
                <span>Shop All Teas</span>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              </Link>

              <Link
                href="/categories"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 px-3 text-xs font-semibold text-stone-800 hover:bg-stone-100 rounded-lg"
              >
                <span>Collections</span>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              </Link>

              {/* Know More Sub-links in Mobile */}
              <div className="pt-2 border-t border-stone-100 mt-2 space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 px-3 block">
                  Know More
                </span>
                {knowMoreItems.map((item) => (
                  <Link
                    key={item.url}
                    href={item.url}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 px-3 text-xs text-stone-700 hover:bg-stone-100 rounded-lg"
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                  </Link>
                ))}
              </div>

              <div className="pt-2 border-t border-stone-100 mt-2 space-y-1">
                <Link
                  href="/track-order"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 px-3 text-xs font-medium text-brand-800 hover:bg-brand-50 rounded-lg"
                >
                  <span>Track Order</span>
                  <ChevronRight className="w-3.5 h-3.5 text-brand-500" />
                </Link>

                {!userEmail && (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 px-3 text-xs font-medium text-stone-800 hover:bg-stone-100 rounded-lg"
                  >
                    <span>Sign In to Account</span>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                  </Link>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
