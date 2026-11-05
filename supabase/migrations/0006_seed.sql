-- 0006: Baseline configuration, roles, CMS and email templates.
-- This seed intentionally contains no fake products, orders or statistics.

INSERT INTO public.admin_roles (name, description, permissions, is_system) VALUES
  ('super_admin', 'Full access to every module and setting.', '["*"]'::jsonb, true),
  ('admin', 'Manage catalog, orders, customers, CMS and finance.', '["dashboard","catalog","reviews","customers","orders","finance","cms","settings"]'::jsonb, true),
  ('manager', 'Manage catalog, orders, customers and CMS.', '["dashboard","catalog","reviews","customers","orders","cms"]'::jsonb, true),
  ('staff', 'Process orders and moderate reviews.', '["dashboard","orders","reviews"]'::jsonb, true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.settings (key, value, group_name, is_public) VALUES
  ('general', $json${"website_name":"Chai & Leaf","tagline":"Single-origin teas, honestly sourced","logo_url":"","favicon_url":"","currency":"INR","timezone":"Asia/Kolkata","support_email":""}$json$::jsonb, 'general', true),
  ('seo', $json${"default_meta_title":"Chai & Leaf | Single-origin Indian teas","default_meta_description":"Shop fresh single-origin teas, blends and brewing essentials with honest sourcing and fast delivery across India.","default_meta_keywords":"tea, chai, loose leaf tea, Indian tea, buy tea online","default_og_image":""}$json$::jsonb, 'seo', true),
  ('social', $json${"facebook":"","instagram":"","youtube":"","twitter":"","pinterest":""}$json$::jsonb, 'social', true),
  ('contact', $json${"email":"hello@chaileaf.in","phone":"","whatsapp":"","address":""}$json$::jsonb, 'contact', true),
  ('business', $json${"business_name":"Chai & Leaf","address":"","gstin":"","invoice_prefix":"INV","invoice_start":1,"hsn_default":"0902","tax_enabled":true,"default_tax_rate":5,"show_gst":false,"place_of_supply":"India","invoice_terms":"Goods once sold are not returnable except as per the return policy.","invoice_notes":"Thank you for shopping with us."}$json$::jsonb, 'business', false),
  ('payment', $json${"razorpay_enabled":false,"razorpay_key_id":"","cod_enabled":true,"payment_mode":"test","cod_instructions":"Pay in cash when your order is delivered."}$json$::jsonb, 'payment', false),
  ('smtp', $json${"enabled":false,"host":"","port":587,"username":"","encryption":"tls","from_name":"Chai & Leaf","from_email":""}$json$::jsonb, 'smtp', false),
  ('shipping', $json${"default_charge":60,"free_threshold":999,"delivery_info":"Orders are dispatched within 1-2 business days. Delivery usually takes 3-7 business days.","cod_available":true}$json$::jsonb, 'shipping', true),
  ('footer', $json${"about_text":"Small-batch teas sourced directly from growers, packed fresh and shipped across India.","copyright_text":"Chai & Leaf. All rights reserved.","newsletter_text":"Brewing notes and new harvests, once a month."}$json$::jsonb, 'footer', true)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.document_counters (key, last_value) VALUES ('invoice', 0)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.email_templates (key, name, subject, body_html, description) VALUES
  ('order_confirmation', 'Order Confirmation', 'We received your order {{order_number}}', $html$<h2>Thank you, {{customer_name}}!</h2><p>Your order <strong>{{order_number}}</strong> has been received and is awaiting confirmation.</p><p>Order total: <strong>{{order_total}}</strong></p><p>{{items_table}}</p><p>You can view your order here: <a href="{{order_url}}">{{order_url}}</a></p><p>— {{site_name}}</p>$html$, 'Sent when a new order is placed.'),
  ('payment_confirmation', 'Payment Confirmation', 'Payment received for {{order_number}}', $html$<h2>Payment received</h2><p>Hi {{customer_name}}, we have received your payment of <strong>{{order_total}}</strong> for order {{order_number}}.</p><p>We will begin processing your order shortly.</p><p>— {{site_name}}</p>$html$, 'Sent after a successful online payment or COD collection.'),
  ('order_processing', 'Order Processing', 'Your order {{order_number}} is being packed', $html$<h2>We are packing your order</h2><p>Hi {{customer_name}}, order {{order_number}} is now being processed.</p><p>— {{site_name}}</p>$html$, 'Sent when an order moves to processing.'),
  ('order_shipped', 'Order Shipped', 'Your order {{order_number}} has shipped', $html$<h2>On its way</h2><p>Hi {{customer_name}}, your order {{order_number}} has been shipped.</p><p>Courier: {{courier_name}}<br/>Tracking number: {{tracking_number}}<br/>Track: <a href="{{tracking_url}}">{{tracking_url}}</a></p><p>— {{site_name}}</p>$html$, 'Sent when an order is shipped.'),
  ('order_delivered', 'Order Delivered', 'Your order {{order_number}} was delivered', $html$<h2>Delivered</h2><p>Hi {{customer_name}}, order {{order_number}} has been delivered. We hope you enjoy it.</p><p>— {{site_name}}</p>$html$, 'Sent when an order is delivered.'),
  ('order_cancelled', 'Order Cancelled', 'Your order {{order_number}} was cancelled', $html$<h2>Order cancelled</h2><p>Hi {{customer_name}}, order {{order_number}} has been cancelled.</p><p>If you have already paid, our team will process any eligible refund.</p><p>— {{site_name}}</p>$html$, 'Sent when an order is cancelled.'),
  ('refund_confirmation', 'Refund Confirmation', 'Refund processed for {{order_number}}', $html$<h2>Refund processed</h2><p>Hi {{customer_name}}, a refund of <strong>{{refund_amount}}</strong> has been processed for order {{order_number}}.</p><p>— {{site_name}}</p>$html$, 'Sent when a refund is recorded.')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.cms_pages (key, title, slug, content_html, seo_title, seo_description, status) VALUES
  ('about-us', 'About Us', 'about-us', $html$<p>Chai &amp; Leaf began with a simple idea: make honest, fresh tea easy to buy online.</p><p>We work with small growers and trusted blenders, pack in small batches, and keep our blends free from unnecessary flavourings. Every product page tells you what is inside, where it comes from, and how to brew it.</p><p>Our catalogue is deliberately small. If a tea does not meet our standard, we do not list it.</p>$html$, 'About Chai & Leaf', 'Learn how Chai & Leaf sources, blends and packs fresh tea.', 'published'),
  ('how-to-make-chai', 'How to Make Chai', 'how-to-make-chai', $html$<h2>How to make a proper cup of chai</h2><ol><li><strong>Measure.</strong> Use one heaped teaspoon of tea per cup, or follow the ratio on the pack.</li><li><strong>Boil the water.</strong> Bring fresh water to a rolling boil. Use 150 ml per cup.</li><li><strong>Add spices.</strong> Add crushed ginger, cardamom or your chai masala and boil for one minute.</li><li><strong>Add tea.</strong> Add the leaves and boil for 2-3 minutes. Do not overboil or it turns bitter.</li><li><strong>Add milk.</strong> Pour in 60-80 ml of milk and bring to a gentle boil. Simmer for 2 minutes.</li><li><strong>Strain and rest.</strong> Strain into a warm cup and let it rest for 30 seconds before drinking.</li></ol><p>For a lighter cup, reduce the milk and steep the leaves for a shorter time.</p>$html$, 'How to Make Chai', 'A simple step-by-step guide to brewing perfect Indian chai.', 'published'),
  ('why-choose-us', 'Why Choose Us', 'why-choose-us', $html$<h2>Why choose Chai &amp; Leaf</h2><ul><li><strong>Fresh batches.</strong> We pack in small quantities so the tea reaches you fresh.</li><li><strong>Clear sourcing.</strong> Every listing names the garden, region or blend.</li><li><strong>No hidden fillers.</strong> Ingredients are listed in full on every product page.</li><li><strong>Honest pricing.</strong> No inflated MRPs or permanent discounts.</li><li><strong>Real support.</strong> Questions about brewing or an order go to a person, not a bot.</li></ul><p>If something is not right, tell us. We would rather fix it than lose your trust.</p>$html$, 'Why Choose Chai & Leaf', 'Fresh batches, clear sourcing and honest pricing.', 'published'),
  ('privacy-policy', 'Privacy Policy', 'privacy-policy', $html$<h2>Privacy Policy</h2><p>We collect only the information needed to process your order and improve the store: your name, email, phone, delivery address and order history.</p><p>Payments are processed by our payment provider. We do not store card numbers or UPI credentials on our servers.</p><p>We use cookies for cart and login sessions. We do not sell personal data.</p><p>To request access, correction or deletion of your data, contact us at the email listed on the Contact page.</p>$html$, 'Privacy Policy', 'How Chai & Leaf collects, uses and protects your data.', 'published'),
  ('terms-conditions', 'Terms & Conditions', 'terms-conditions', $html$<h2>Terms &amp; Conditions</h2><p>By placing an order you agree to these terms.</p><p>All prices are in Indian Rupees and include applicable taxes unless stated otherwise. Product availability and prices may change without notice.</p><p>Orders are subject to stock availability and payment authorisation. We may cancel an order if a product is unavailable or if we suspect fraud, and any amount paid will be refunded.</p><p>Product images are indicative. Natural teas may vary in appearance between harvests.</p>$html$, 'Terms & Conditions', 'The terms that apply when you shop with Chai & Leaf.', 'published'),
  ('shipping-return-policy', 'Shipping & Return Policy', 'shipping-return-policy', $html$<h2>Shipping</h2><p>Orders are dispatched within 1-2 business days. Delivery usually takes 3-7 business days depending on your location.</p><p>Shipping is free on orders above the threshold shown at checkout. A flat shipping charge applies to smaller orders.</p><h2>Returns</h2><p>Because tea is a food product, opened packs cannot be returned. If your order arrives damaged, incorrect or sealed but unsuitable, contact us within 48 hours of delivery with photos of the pack and we will arrange a replacement or refund.</p><p>Refunds are processed to the original payment method. COD refunds are made by bank transfer.</p>$html$, 'Shipping & Return Policy', 'Delivery timelines, shipping charges and our return policy.', 'published'),
  ('contact-us', 'Contact Us', 'contact-us', $html$<p>Questions about an order, a blend or brewing? Send us a message using the form and we will reply within one business day.</p>$html$, 'Contact Us', 'Get in touch with the Chai & Leaf team.', 'published')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.cms_faqs (question, answer, category, display_order) VALUES
  ('How should I store my tea?', 'Keep tea in an airtight container away from light, heat and strong smells. Whole leaf teas stay fresh for 6-12 months; blends with spices are best within 6 months.', 'Product', 1),
  ('Do you ship across India?', 'Yes. We ship to serviceable pin codes across India. Delivery usually takes 3-7 business days after dispatch.', 'Shipping', 2),
  ('Can I pay cash on delivery?', 'COD is available when enabled at checkout. The option appears automatically for eligible pin codes.', 'Payments', 3),
  ('Can I return an opened pack?', 'Tea is a food product, so opened packs cannot be returned. If your order is damaged or incorrect, contact us within 48 hours and we will make it right.', 'Returns', 4),
  ('How much tea should I use per cup?', 'Use one heaped teaspoon (about 2.5 g) per 150 ml of water. Adjust to taste, and follow the ratio printed on the pack.', 'Brewing', 5),
  ('Are your teas natural?', 'Our single-origin teas are pure leaf. Blends list every ingredient on the product page. We do not use artificial colours.', 'Product', 6),
  ('How do I track my order?', 'Use the Track Order page with your order number and the email used at checkout, or open the order from your account.', 'Orders', 7),
  ('How do I contact support?', 'Use the Contact page or email the address listed there. We reply within one business day.', 'Support', 8)
ON CONFLICT DO NOTHING;

INSERT INTO public.homepage_sections (key, section_type, title, subtitle, content_html, cta_label, cta_url, display_order, is_active) VALUES
  ('hero', 'hero', 'Fresh tea, honestly sourced', 'Single-origin leaves and small-batch blends, packed close to harvest and shipped across India.', '', 'Shop all teas', '/products', 1, true),
  ('featured', 'featured_products', 'Featured this season', 'A short list of what we are drinking right now.', '', 'View all', '/products', 2, true),
  ('categories', 'categories', 'Shop by category', 'Find your everyday cup or something new.', '', '', '', 3, true),
  ('why-us', 'content', 'Why Chai & Leaf', 'Small batches, clear sourcing and no filler.', $html$<p>We keep the range small so every tea is worth drinking. Ingredients are listed in full, harvests are named where possible, and packs are filled in small batches.</p>$html$, 'Read our story', '/why-choose-us', 4, true),
  ('brew-guide', 'content', 'How to make the perfect cup', 'A simple method for a balanced, aromatic chai.', $html$<p>Measure one heaped teaspoon per cup, boil with spices, add milk and simmer gently. Full instructions, including ratios, are on our brewing guide.</p>$html$, 'Brewing guide', '/how-to-make-chai', 5, true),
  ('reviews', 'reviews', 'What customers say', 'Verified reviews from people who bought and brewed.', '', '', '', 6, true)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.banners (title, subtitle, link_url, placement, display_order, is_active) VALUES
  ('Free shipping above ₹999', 'Applied automatically at checkout.', '/products', 'announcement', 1, true)
ON CONFLICT DO NOTHING;

INSERT INTO public.navigation_menus (location, label, url, display_order, is_active, target) VALUES
  ('header', 'Home', '/', 1, true, '_self'),
  ('header', 'Shop', '/products', 2, true, '_self'),
  ('header', 'How to Make Chai', '/how-to-make-chai', 3, true, '_self'),
  ('header', 'Why Choose Us', '/why-choose-us', 4, true, '_self'),
  ('header', 'FAQs', '/faqs', 5, true, '_self'),
  ('header', 'Contact', '/contact', 6, true, '_self'),
  ('footer', 'About Us', '/about-us', 1, true, '_self'),
  ('footer', 'Track Order', '/track-order', 2, true, '_self'),
  ('footer', 'FAQs', '/faqs', 3, true, '_self'),
  ('footer', 'Contact', '/contact', 4, true, '_self'),
  ('footer', 'Privacy Policy', '/privacy-policy', 5, true, '_self'),
  ('footer', 'Terms & Conditions', '/terms-conditions', 6, true, '_self'),
  ('footer', 'Shipping & Returns', '/shipping-return-policy', 7, true, '_self')
ON CONFLICT DO NOTHING;

INSERT INTO public.customers (id, email, full_name, phone)
SELECT u.id, COALESCE(u.email, ''), COALESCE(u.raw_user_meta_data->>'full_name', split_part(COALESCE(u.email,''), '@', 1)), u.raw_user_meta_data->>'phone'
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.admin_users (user_id, role_id, full_name, email, is_active)
SELECT u.id, r.id, COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)), u.email, true
FROM auth.users u
CROSS JOIN public.admin_roles r
WHERE r.name = 'super_admin'
  AND lower(u.email) IN ('admin@hiyori.com', 'admin@nextstore.com')
ON CONFLICT (user_id) DO NOTHING;
