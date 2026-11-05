-- 0007: Drop CMS and related content tables
DROP TABLE IF EXISTS public.contact_messages CASCADE;
DROP TABLE IF EXISTS public.banners CASCADE;
DROP TABLE IF EXISTS public.navigation_menus CASCADE;
DROP TABLE IF EXISTS public.cms_faqs CASCADE;
DROP TABLE IF EXISTS public.cms_pages CASCADE;
DROP TABLE IF EXISTS public.homepage_sections CASCADE;

-- Drop obsolete CMS types if created
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contact_status') THEN
    DROP TYPE public.contact_status CASCADE;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'page_status') THEN
    DROP TYPE public.page_status CASCADE;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'banner_placement') THEN
    DROP TYPE public.banner_placement CASCADE;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'menu_location') THEN
    DROP TYPE public.menu_location CASCADE;
  END IF;
END $$;

