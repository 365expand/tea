import { FaqsClient, FaqItem } from "./FaqsClient";
import type { Metadata } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Pure Pour Co.",
  description:
    "Explore common questions regarding our single-origin tea harvests, brewing rituals, shipping timelines, and quality guarantees.",
};

export const dynamic = "force-dynamic";

const FALLBACK_FAQS: FaqItem[] = [
  {
    id: "faq-1",
    question: "How should I store my whole leaf tea to preserve peak freshness?",
    answer:
      "Keep your tea in an airtight, opaque container in a cool, dark, and dry pantry away from sunlight, heat, and aromatic kitchen spices. Stored properly, high-grade whole leaf orthodox teas maintain optimum flavor and aroma for 12 to 18 months.",
    display_order: 1,
  },
  {
    id: "faq-2",
    question: "Where are Pure Pour Co. teas sourced from?",
    answer:
      "Every batch of tea is ethically sourced directly from heritage single-estate gardens in Assam (Upper Brahmaputra Valley), Darjeeling's misty high-altitude slopes, Kangra, and the Nilgiri hills. We harvest in small, seasonal flushes to ensure unblended terroir purity.",
    display_order: 2,
  },
  {
    id: "faq-3",
    question: "What is the recommended brewing temperature and steeping time?",
    answer:
      "For delicate Green and White teas, use fresh water at 75°C–80°C and steep for 2–3 minutes. For Single-Estate Black orthodox teas, brew at 90°C–95°C for 3–4 minutes. For traditional Kadak CTC milk chai, simmer crushed leaves with water, fresh ginger, and spices for 3 minutes before adding milk and jaggery.",
    display_order: 3,
  },
  {
    id: "faq-4",
    question: "How long does delivery take and do you ship across India?",
    answer:
      "Yes, we ship across all serviceable pin codes throughout India. Metro city orders typically arrive within 2–4 business days, while other regional destinations take 4–6 business days. Express tracking updates are provided via email as soon as your parcel is dispatched.",
    display_order: 4,
  },
  {
    id: "faq-5",
    question: "Is Cash on Delivery (COD) supported?",
    answer:
      "Yes, we provide Cash on Delivery (COD) across eligible pin codes with no hidden surcharges. You can also pay securely online via UPI, Credit/Debit Cards, and Net Banking.",
    display_order: 5,
  },
  {
    id: "faq-6",
    question: "Are your teas free of artificial flavorings and chemical preservatives?",
    answer:
      "Absolutely. Pure Pour Co. adheres to a strict clean-ingredient promise. Our single-origin orthodox teas contain 100% pure camellia sinensis leaves. Our spiced blends utilize hand-crushed whole botanicals like green cardamom, cinnamon bark, cloves, and ginger root with zero artificial spray flavors or synthetic preservatives.",
    display_order: 6,
  },
  {
    id: "faq-7",
    question: "What is your return and replacement policy?",
    answer:
      "As tea is an edible consumable, we cannot accept returns on opened packets. However, if your package arrives damaged, unsealed, or incorrect, please reach out via our Contact page or support email within 48 hours with a photo of the package, and our team will immediately dispatch a free replacement or initiate a full refund.",
    display_order: 7,
  },
  {
    id: "faq-8",
    question: "Can I re-steep whole leaf teas?",
    answer:
      "Yes! High-elevation orthodox whole leaves and whole leaf green teas can typically be steeped 2 to 3 times. With each successive steep, increase the steeping time by 30 to 45 seconds to reveal deeper flavor notes without bitterness.",
    display_order: 8,
  },
  {
    id: "faq-9",
    question: "How do I track my active order?",
    answer:
      "Once your order is packed and dispatched from our Guwahati packing facility, you will receive an email with your courier tracking link. You can also track your shipment anytime through our 'Track Order' page using your Order Number and email.",
    display_order: 9,
  },
  {
    id: "faq-10",
    question: "Do you offer gift packaging or corporate orders?",
    answer:
      "Yes, we curate custom handcrafted tea gift boxes and bulk corporate orders for festive occasions and celebrations. Please reach out through our Contact page or write to us at support@purepour.co for personalized corporate gifting catalogs.",
    display_order: 10,
  },
];

export default async function FaqsPage() {
  const supabase = createSupabaseAdminClient();
  const { data: dbFaqs } = await supabase
    .from("faqs")
    .select("id, question, answer, display_order")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  const faqs: FaqItem[] = dbFaqs && dbFaqs.length > 0 ? (dbFaqs as FaqItem[]) : FALLBACK_FAQS;

  return <FaqsClient initialFaqs={faqs} />;
}
