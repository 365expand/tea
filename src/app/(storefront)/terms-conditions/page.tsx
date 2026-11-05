import { CmsPageRenderer } from "@/components/storefront/CmsPageRenderer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Pure Pour Co.",
  description: "The terms that apply when you shop with Pure Pour Co.",
};

export default function TermsConditionsPage() {
  const page = {
    title: "Terms & Conditions",
    content_html: `
      <h2>General Terms</h2>
      <p>By placing an order on Chai &amp; Leaf, you agree to these Terms &amp; Conditions.</p>
      <h2>Pricing &amp; Taxes</h2>
      <p>All prices are listed in Indian Rupees (INR) and are inclusive of applicable GST taxes. We reserve the right to modify prices without prior notice.</p>
      <h2>Orders &amp; Cancellation</h2>
      <p>Orders are accepted subject to product availability and payment verification. Chai &amp; Leaf reserves the right to decline or cancel orders in cases of stock shortages or inaccurate pricing, in which case full refunds are issued immediately.</p>
      <h2>Natural Variations</h2>
      <p>Because teas are seasonal agricultural produce, natural variations in leaf appearance, liquor color, and seasonal notes can occur across flushes.</p>
    `,
  };

  return <CmsPageRenderer page={page} />;
}
