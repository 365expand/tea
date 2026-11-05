CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(200),
  message TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON public.contact_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_created_at ON public.contact_inquiries(created_at DESC);

ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can submit contact inquiry" ON public.contact_inquiries;
CREATE POLICY "Public can submit contact inquiry" ON public.contact_inquiries
  FOR INSERT
  WITH CHECK (true);

-- Update default contact email in settings from legacy chaileaf.in to purepour.co
UPDATE public.settings
SET value = jsonb_set(
  COALESCE(value, '{}'::jsonb),
  '{email}',
  '"care@purepour.co"'
)
WHERE key = 'contact' AND (value->>'email' IS NULL OR value->>'email' LIKE '%chaileaf%');

-- Seed a sample customer message for instant visibility
INSERT INTO public.contact_inquiries (name, email, phone, subject, message, status)
VALUES
  (
    'Arjun Sharma',
    'arjun.sharma@example.com',
    '+91 98112 34567',
    'Corporate Gifting & Wholesale Inquiry',
    'Hello Pure Pour team, we are planning festive gifting for our corporate partners (approx 120 custom wooden tea boxes). Could you please share bulk pricing and available single-estate second flush selections?',
    'unread'
  ),
  (
    'Meera Sen',
    'meera.sen@example.com',
    '+91 94331 89012',
    'Brewing Guide for Assam Orthodox',
    'I recently received the Golden Tip Assam Orthodox. Could you recommend the ideal water temperature and steeping duration for cold brew infusion? Loving the aroma so far!',
    'read'
  );

