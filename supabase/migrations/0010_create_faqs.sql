CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active faqs" ON public.faqs;
CREATE POLICY "Public can read active faqs" ON public.faqs FOR SELECT USING (is_active = true);

INSERT INTO public.faqs (question, answer, display_order, is_active)
VALUES
  (
    'How should I store my whole leaf tea to preserve peak freshness?',
    'Keep your tea in an airtight, opaque container in a cool, dark, and dry pantry away from sunlight, heat, and aromatic kitchen spices. Stored properly, high-grade whole leaf orthodox teas maintain optimum flavor and aroma for 12 to 18 months.',
    1,
    true
  ),
  (
    'Where are Pure Pour Co. teas sourced from?',
    'Every batch of tea is ethically sourced directly from heritage single-estate gardens in Assam (Upper Brahmaputra Valley), Darjeeling''s misty high-altitude slopes, Kangra, and the Nilgiri hills. We harvest in small, seasonal flushes to ensure unblended terroir purity.',
    2,
    true
  ),
  (
    'What is the recommended brewing temperature and steeping time?',
    'For delicate Green and White teas, use fresh water at 75°C–80°C and steep for 2–3 minutes. For Single-Estate Black orthodox teas, brew at 90°C–95°C for 3–4 minutes. For traditional Kadak CTC milk chai, simmer crushed leaves with water, fresh ginger, and spices for 3 minutes before adding milk and jaggery.',
    3,
    true
  ),
  (
    'How long does delivery take and do you ship across India?',
    'Yes, we ship across all serviceable pin codes throughout India. Metro city orders typically arrive within 2–4 business days, while other regional destinations take 4–6 business days. Express tracking updates are provided via email as soon as your parcel is dispatched.',
    4,
    true
  ),
  (
    'Is Cash on Delivery (COD) supported?',
    'Yes, we provide Cash on Delivery (COD) across eligible pin codes with no hidden surcharges. You can also pay securely online via UPI, Credit/Debit Cards, and Net Banking.',
    5,
    true
  ),
  (
    'Are your teas free of artificial flavorings and chemical preservatives?',
    'Absolutely. Pure Pour Co. adheres to a strict clean-ingredient promise. Our single-origin orthodox teas contain 100% pure camellia sinensis leaves. Our spiced blends utilize hand-crushed whole botanicals like green cardamom, cinnamon bark, cloves, and ginger root with zero artificial spray flavors or synthetic preservatives.',
    6,
    true
  ),
  (
    'What is your return and replacement policy?',
    'As tea is an edible consumable, we cannot accept returns on opened packets. However, if your package arrives damaged, unsealed, or incorrect, please reach out via our Contact page or support email within 48 hours with a photo of the package, and our team will immediately dispatch a free replacement or initiate a full refund.',
    7,
    true
  ),
  (
    'Can I re-steep whole leaf teas?',
    'Yes! High-elevation orthodox whole leaves and whole leaf green teas can typically be steeped 2 to 3 times. With each successive steep, increase the steeping time by 30 to 45 seconds to reveal deeper flavor notes without bitterness.',
    8,
    true
  ),
  (
    'How do I track my active order?',
    'Once your order is packed and dispatched from our Guwahati packing facility, you will receive an email with your courier tracking link. You can also track your shipment anytime through our ''Track Order'' page using your Order Number and email.',
    9,
    true
  ),
  (
    'Do you offer gift packaging or corporate orders?',
    'Yes, we curate custom handcrafted tea gift boxes and bulk corporate orders for festive occasions and celebrations. Please reach out through our Contact page or write to us at support@purepour.co for personalized corporate gifting catalogs.',
    10,
    true
  );

