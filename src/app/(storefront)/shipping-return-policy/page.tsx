import { CmsPageRenderer } from "@/components/storefront/CmsPageRenderer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping & Return Policy | Pure Pour Co.",
  description: "Delivery timelines, shipping charges and our return policy.",
};

export default function ShippingReturnPolicyPage() {
  const page = {
    title: "Shipping & Return Policy",
    content_html: `
      <h2>Shipping &amp; Delivery</h2>
      <p>Orders are carefully packed and dispatched within 24 to 48 hours on business days. Standard delivery across major Indian cities takes 3 to 7 business days.</p>
      <p>Free standard shipping is automatically applied at checkout for orders above the free delivery threshold. A flat delivery fee applies to lower-value orders.</p>
      <h2>Returns &amp; Replacements</h2>
      <p>Because tea is an ingestible consumable product, opened packs cannot be returned for hygiene and safety reasons.</p>
      <p>If your package arrives physically damaged, leaking, or with incorrect items, please contact our support team within 48 hours of delivery with photographic evidence. We will promptly dispatch a replacement or issue a full refund to your original payment method.</p>
    `,
  };

  return <CmsPageRenderer page={page} />;
}
