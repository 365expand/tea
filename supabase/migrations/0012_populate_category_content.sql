-- 0012: Populate Rich Category Content & Subcategories

-- 1. Update Black Teas
UPDATE public.categories
SET
  image_url = '/images/categories/black-teas.jpg',
  description_html = '<p>Handcrafted orthodox whole leaves and brisk golden CTC teas from the misty valleys of Upper Assam, Darjeeling, and the Nilgiri hills. Rich in natural malty depth, golden tips, and nuanced floral muscatel notes.</p>',
  seo_title = 'Single-Origin Black Teas & Assam CTC | Pure Pour Co.',
  seo_description = 'Explore rare high-mountain orthodox black teas and hearty morning CTC chai harvests ethically sourced from India premier tea gardens.'
WHERE slug = 'black-teas';

-- 2. Update Chai & Spice Blends
UPDATE public.categories
SET
  image_url = '/images/categories/chai-spices.jpg',
  description_html = '<p>Artisanal heritage spiced teas celebrating royal Indian recipes. Whole green cardamom pods, cinnamon bark, cloves, and ginger root blended with strong single-estate Assam tea for an authentic, warming brew.</p>',
  seo_title = 'Artisan Masala Chai & Spiced Infusions | Pure Pour Co.',
  seo_description = 'Handcrafted Indian spiced chais, royal Kashmiri Kahwa, and herbal botanicals made exclusively with freshly crushed whole spices and unblended tea leaves.'
WHERE slug = 'chai-and-spices';

-- 3. Update Green & White Teas
UPDATE public.categories
SET
  image_url = '/images/categories/green-white-teas.jpg',
  description_html = '<p>Delicate spring flush green leaves and rare silver needle white tea buds hand-plucked at dawn. Clean, grassy, subtly sweet, and abundant in natural antioxidants without any bitter astringency.</p>',
  seo_title = 'Himalayan Green & Silver Needle White Teas | Pure Pour Co.',
  seo_description = 'Shop delicate spring flush green tea and sun-dried silver needle white tea buds harvested from high-elevation Himalayan estates.'
WHERE slug = 'green-and-white-teas';

-- 4. Insert Subcategories
DO $$
DECLARE
  black_id UUID;
  chai_id UUID;
  green_id UUID;
  sub_kadak_id UUID;
  sub_kahwa_id UUID;
  sub_darjeeling_id UUID;
  sub_masala_id UUID;
BEGIN
  SELECT id INTO black_id FROM public.categories WHERE slug = 'black-teas' LIMIT 1;
  SELECT id INTO chai_id FROM public.categories WHERE slug = 'chai-and-spices' LIMIT 1;
  SELECT id INTO green_id FROM public.categories WHERE slug = 'green-and-white-teas' LIMIT 1;

  IF black_id IS NOT NULL THEN
    INSERT INTO public.subcategories (category_id, name, slug, description_html, display_order, is_active)
    VALUES
      (black_id, 'Single-Estate Orthodox', 'single-estate-orthodox', 'Full whole-leaf orthodox teas showcasing unadulterated estate terroir and golden tips.', 1, true),
      (black_id, 'Kadak Breakfast CTC', 'kadak-breakfast-ctc', 'Robust, granulated Assam CTC designed for a brisk morning cup with milk.', 2, true),
      (black_id, 'Darjeeling First & Second Flush', 'darjeeling-flushes', 'Champagne of teas boasting delicate muscatel grapes and spring floral aromas.', 3, true)
    ON CONFLICT (category_id, slug) DO UPDATE
      SET name = EXCLUDED.name, description_html = EXCLUDED.description_html;
  END IF;

  IF chai_id IS NOT NULL THEN
    INSERT INTO public.subcategories (category_id, name, slug, description_html, display_order, is_active)
    VALUES
      (chai_id, 'Artisan Masala Chai', 'artisan-masala-chai', 'Bold crushed spices paired with high-grown black tea for everyday indulgence.', 1, true),
      (chai_id, 'Royal Kashmiri Kahwa', 'royal-kashmiri-kahwa', 'Traditional saffron, almond, green cardamom, and green tea brew from the valley.', 2, true),
      (chai_id, 'Herbal & Botanical Blends', 'herbal-botanicals', 'Caffeine-free and soothing blends of tulsi, lemongrass, chamomile, and ginger.', 3, true)
    ON CONFLICT (category_id, slug) DO UPDATE
      SET name = EXCLUDED.name, description_html = EXCLUDED.description_html;
  END IF;

  IF green_id IS NOT NULL THEN
    INSERT INTO public.subcategories (category_id, name, slug, description_html, display_order, is_active)
    VALUES
      (green_id, 'High-Altitude Green Leaves', 'high-altitude-green', 'Pan-fired and steamed green whole leaves rich in gentle sweetness and theanine.', 1, true),
      (green_id, 'Silver Needle White Tea', 'silver-needle-white', 'Downy white buds gently withered under the morning sun with velvety mouthfeel.', 2, true),
      (green_id, 'Floral & Jasmine Infusions', 'floral-jasmine-infusions', 'Scented naturally with fresh blossoms without artificial spray flavors.', 3, true)
    ON CONFLICT (category_id, slug) DO UPDATE
      SET name = EXCLUDED.name, description_html = EXCLUDED.description_html;
  END IF;

  -- 5. Associate existing products with their appropriate subcategories
  SELECT id INTO sub_kadak_id FROM public.subcategories WHERE slug = 'kadak-breakfast-ctc' LIMIT 1;
  IF sub_kadak_id IS NOT NULL THEN
    UPDATE public.products SET subcategory_id = sub_kadak_id WHERE slug = 'assam-golden-ctc-breakfast-tea';
  END IF;

  SELECT id INTO sub_kahwa_id FROM public.subcategories WHERE slug = 'royal-kashmiri-kahwa' LIMIT 1;
  IF sub_kahwa_id IS NOT NULL THEN
    UPDATE public.products SET subcategory_id = sub_kahwa_id WHERE slug = 'royal-kashmiri-kahwa-green-tea';
  END IF;

  SELECT id INTO sub_darjeeling_id FROM public.subcategories WHERE slug = 'darjeeling-flushes' LIMIT 1;
  IF sub_darjeeling_id IS NOT NULL THEN
    UPDATE public.products SET subcategory_id = sub_darjeeling_id WHERE slug = 'darjeeling-first-flush-wonder-orthodox';
  END IF;

  SELECT id INTO sub_masala_id FROM public.subcategories WHERE slug = 'artisan-masala-chai' LIMIT 1;
  IF sub_masala_id IS NOT NULL THEN
    UPDATE public.products SET subcategory_id = sub_masala_id WHERE slug = 'artisan-idukki-cardamom-masala-chai';
  END IF;

END $$;

