import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicSettings } from "@/lib/settings";
import { CartProvider } from "@/lib/cart";
import { StoreHeader } from "@/components/storefront/StoreHeader";
import { StoreFooter } from "@/components/storefront/StoreFooter";
import { CartDrawer } from "@/components/storefront/CartDrawer";

export const dynamic = "force-dynamic";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();

  const [{ data: { user } }, publicSettings] = await Promise.all([
    supabase.auth.getUser(),
    getPublicSettings(),
  ]);

  const general = publicSettings.general || {};
  const contact = publicSettings.contact || {};
  const social = publicSettings.social || {};
  const footer = publicSettings.footer || {};
  const shipping = publicSettings.shipping || { free_threshold: 999 };

  const headerMenus = [
    { label: "Home", url: "/" },
    { label: "Shop All Teas", url: "/products" },
    { label: "Collections", url: "/categories" },
    { label: "About Us", url: "/about-us" },
    { label: "FAQs", url: "/faqs" },
    { label: "Contact", url: "/contact" },
  ];

  const footerMenus = [
    { label: "About Us", url: "/about-us" },
    { label: "Track Order", url: "/track-order" },
    { label: "FAQs", url: "/faqs" },
    { label: "Contact", url: "/contact" },
    { label: "Privacy Policy", url: "/privacy-policy" },
    { label: "Terms & Conditions", url: "/terms-conditions" },
    { label: "Shipping & Return Policy", url: "/shipping-return-policy" },
  ];

  const announcementBanner = {
    title: `Free shipping across India on orders above ₹${shipping.free_threshold || 999}`,
    link_url: "/products",
  };

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans">
        <StoreHeader
          announcement={announcementBanner}
          generalSettings={general}
          headerMenus={headerMenus}
          userEmail={user?.email}
          userName={user?.user_metadata?.full_name}
        />
        <main className="flex-1">{children}</main>
        <CartDrawer freeShippingThreshold={shipping.free_threshold || 999} />
        <StoreFooter
          generalSettings={general}
          contactSettings={contact}
          socialSettings={social}
          footerSettings={footer}
          footerMenus={footerMenus}
        />
      </div>
    </CartProvider>
  );
}
