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
  ArrowRight,
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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [knowMoreOpen, setKnowMoreOpen] = useState(false);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Check if announcement was previously dismissed in this session
  useEffect(() => {
    try {
      if (sessionStorage.getItem("announcement_dismissed") === "true") {
        setAnnouncementDismissed(true);
      }
    } catch (e) {
      // ignore
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

  // Track scroll position cleanly with hysteresis to prevent blinking/layout jitter
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          // Wide hysteresis: activate at > 75px, deactivate at < 20px to prevent any oscillation or vibration
          setIsScrolled((prev) => {
            if (!prev && currentY > 75) return true;
            if (prev && currentY < 20) return false;
            return prev;
          });
          ticking = false;
        });
        ticking = true;
      }
    };
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

  // Close dropdown and search on route change
  useEffect(() => {
    setKnowMoreOpen(false);
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  }, [pathname]);

  // Focus mobile search input when opened
  useEffect(() => {
    if (mobileSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [mobileSearchOpen]);

  const websiteName = generalSettings?.website_name || "Pure Pour Co.";

  const knowMoreItems = [
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
    <header className="sticky top-0 z-40 select-none font-sans">
      {/* 1. Dismissible Top Announcement Bar */}
      <AnimatePresence>
        {!announcementDismissed && announcement?.title && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-brand-950 text-stone-200 text-[11px] font-medium tracking-wide relative overflow-hidden border-b border-brand-900/60"
          >
            <div className="w-full px-4 sm:px-8 lg:px-12 py-2 flex items-center justify-center text-center relative">
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

      {/* 2. Main Navigation Bar (Full Width with Luxury Spacing, Zero Transparency on Mobile, Smooth Compact Transition) */}
      <div
        className={`w-full bg-white transition-shadow duration-300 ${
          isScrolled
            ? "border-b border-stone-200/90 shadow-sm"
            : "border-b border-stone-200"
        }`}
      >
        <div
          className={`w-full px-4 sm:px-6 lg:px-10 xl:px-14 flex items-center justify-between gap-3 sm:gap-6 transition-[height] duration-300 ease-out ${
            isScrolled ? "h-14" : "h-15 sm:h-18"
          }`}
        >
          {/* Left: Mobile hamburger & Brand Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 -ml-1 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo Area: Montserrat Medium (400-500 weight), no subtitle, clean balanced alignment */}
            <Link href="/" className="flex items-center gap-2.5 group py-1">
              {generalSettings?.logo_url ? (
                <img
                  src={generalSettings.logo_url}
                  alt={websiteName}
                  className="w-auto h-7 sm:h-8 object-contain transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-brand-800 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Leaf className="w-4 h-4" />
                </div>
              )}
              <span className="font-montserrat font-medium text-base sm:text-lg lg:text-xl text-stone-900 tracking-normal sm:tracking-wide leading-none transition-colors group-hover:text-brand-900">
                {websiteName}
              </span>
            </Link>
          </div>

          {/* Center: Desktop Navigation Links: Home, About, Shop All Tea, Know More (FAQ & Contact) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-9 text-xs sm:text-sm font-medium text-stone-700">
            <Link
              href="/"
              className={`hover:text-brand-800 transition py-1 relative ${
                pathname === "/" ? "text-brand-800 font-semibold" : ""
              }`}
            >
              Home
              {pathname === "/" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-800 rounded-full" />
              )}
            </Link>

            <Link
              href="/about-us"
              className={`hover:text-brand-800 transition py-1 relative ${
                pathname === "/about-us" ? "text-brand-800 font-semibold" : ""
              }`}
            >
              About
              {pathname === "/about-us" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-800 rounded-full" />
              )}
            </Link>

            <Link
              href="/products"
              className={`hover:text-brand-800 transition py-1 relative ${
                pathname.startsWith("/product") ? "text-brand-800 font-semibold" : ""
              }`}
            >
              Shop All Tea
              {pathname.startsWith("/product") && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-800 rounded-full" />
              )}
            </Link>

            {/* "Know More" Dropdown Menu (FAQs and Contact only) */}
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={() => setKnowMoreOpen(true)}
              onMouseLeave={() => setKnowMoreOpen(false)}
            >
              <button
                type="button"
                onClick={() => setKnowMoreOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 py-1 hover:text-brand-800 transition ${
                  knowMoreOpen || pathname === "/faqs" || pathname === "/contact"
                    ? "text-brand-800 font-semibold"
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
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
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

          {/* Right: Search, Account & Cart */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            {/* Desktop Search Bar */}
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
                className="w-52 md:w-64 lg:w-72 pl-10 pr-8 py-2 bg-stone-100/90 hover:bg-stone-100 focus:bg-white border border-stone-200 rounded-full text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-700/20 focus:border-brand-600 transition-all duration-200"
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

            {/* Desktop Account link */}
            {userEmail ? (
              <Link
                href="/account"
                className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-stone-700 hover:text-brand-800 py-1.5 px-3 rounded-full hover:bg-stone-100 transition"
              >
                <User className="w-4 h-4 text-stone-500" />
                <span className="hidden lg:inline truncate max-w-[100px]">
                  {userName || "Account"}
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-xs font-medium text-stone-700 hover:text-brand-800 py-1.5 px-3 rounded-full hover:bg-stone-100 transition hidden sm:inline-block"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Search Icon Button (Placed BEFORE Cart) */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="sm:hidden p-2 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-full transition"
              aria-label="Toggle mobile search"
            >
              <Search className="w-5 h-5 text-stone-700" />
            </button>

            {/* Cart Drawer Trigger */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 active:scale-95 text-white rounded-full px-3.5 py-1.5 sm:py-2 text-xs font-semibold transition-all shadow-sm"
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

      {/* 3. Mobile Expandable Search Bar (Activated on Mobile Search Icon Click) */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="sm:hidden bg-stone-50 border-b border-stone-200 px-4 py-2.5 overflow-hidden"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  window.location.href = `/products?q=${encodeURIComponent(
                    searchQuery.trim()
                  )}`;
                }
              }}
              className="relative flex items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search single-origin teas, spices..."
                  className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-stone-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-700/20 focus:border-brand-600"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 bg-stone-900 text-white text-xs font-semibold rounded-full shrink-0"
              >
                Go
              </button>
              <button
                type="button"
                onClick={() => setMobileSearchOpen(false)}
                className="p-1.5 text-stone-500 hover:text-stone-800"
                aria-label="Close search"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Enhanced Mobile Menu Drawer (Solid Opaque White Background) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="md:hidden border-t border-stone-200 bg-white px-5 py-5 space-y-4 shadow-2xl overflow-hidden"
          >
            {/* Primary Mobile Navigation Links */}
            <nav className="space-y-1">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between py-2.5 px-3 text-sm font-semibold rounded-xl transition ${
                  pathname === "/"
                    ? "bg-brand-50 text-brand-900"
                    : "text-stone-800 hover:bg-stone-50"
                }`}
              >
                <span>Home</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>

              <Link
                href="/about-us"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between py-2.5 px-3 text-sm font-semibold rounded-xl transition ${
                  pathname === "/about-us"
                    ? "bg-brand-50 text-brand-900"
                    : "text-stone-800 hover:bg-stone-50"
                }`}
              >
                <span>About</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>

              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between py-2.5 px-3 text-sm font-semibold rounded-xl transition ${
                  pathname.startsWith("/product")
                    ? "bg-brand-50 text-brand-900"
                    : "text-stone-800 hover:bg-stone-50"
                }`}
              >
                <span>Shop All Tea</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>

              {/* Know More Section (FAQs & Contact) */}
              <div className="pt-3 border-t border-stone-100 mt-2 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-3 block mb-1">
                  Know More
                </span>
                {knowMoreItems.map((item) => (
                  <Link
                    key={item.url}
                    href={item.url}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between py-2 px-3 text-xs rounded-xl transition ${
                      pathname === item.url
                        ? "bg-brand-50 text-brand-900 font-semibold"
                        : "text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                  </Link>
                ))}
              </div>

              {/* Account & Support Section */}
              <div className="pt-3 border-t border-stone-100 mt-2 space-y-1">
                <Link
                  href="/track-order"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 px-3 text-xs font-medium text-brand-800 hover:bg-brand-50 rounded-xl"
                >
                  <span>Track Order</span>
                  <ChevronRight className="w-3.5 h-3.5 text-brand-500" />
                </Link>

                {userEmail ? (
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 px-3 text-xs font-medium text-stone-800 hover:bg-stone-50 rounded-xl"
                  >
                    <span>My Account ({userName || userEmail})</span>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 px-3 text-xs font-semibold text-stone-800 hover:bg-stone-50 rounded-xl"
                  >
                    <span>Sign In to Account</span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
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
