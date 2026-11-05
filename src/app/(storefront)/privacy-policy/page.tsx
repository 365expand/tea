import { CmsPageRenderer } from "@/components/storefront/CmsPageRenderer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Pure Pour Co.",
  description: "How Pure Pour Co. collects, uses and protects your data.",
};

export default function PrivacyPolicyPage() {
  const page = {
    title: "Privacy Policy",
    content_html: `
      <h2>Information We Collect</h2>
      <p>We collect only the personal information essential to process and ship your tea orders: your name, email address, delivery address, and phone number.</p>
      <h2>Payments &amp; Financial Security</h2>
      <p>Online payments are securely processed through Razorpay. We never store credit/debit card details, CVVs, or UPI PINs on our servers.</p>
      <h2>Data Usage &amp; Protection</h2>
      <p>Your delivery information is shared only with our partnered logistics carriers solely for order delivery. We do not sell, rent, or trade your personal information to third parties.</p>
      <h2>Contact</h2>
      <p>For data inquiries or deletion requests, please email us directly at support@chaileaf.in.</p>
    `,
  };

  return <CmsPageRenderer page={page} />;
}
