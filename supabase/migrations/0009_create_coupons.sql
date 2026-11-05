CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10, 2) NOT NULL,
  min_order_amount NUMERIC(10, 2) DEFAULT 0,
  max_discount_amount NUMERIC(10, 2) DEFAULT NULL,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ DEFAULT NULL,
  usage_limit INT DEFAULT NULL,
  used_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active coupons" ON public.coupons;
CREATE POLICY "Public can read active coupons" ON public.coupons FOR SELECT USING (is_active = true);

INSERT INTO public.coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount)
VALUES 
  ('WELCOME10', '10% off on your first artisanal harvest order', 'percentage', 10, 499, 200),
  ('PUREPOUR50', 'Flat ₹50 savings on minimum order ₹599', 'fixed', 50, 599, NULL),
  ('CHAI100', 'Special ₹100 off on festive orders above ₹999', 'fixed', 100, 999, NULL)
ON CONFLICT (code) DO NOTHING;

