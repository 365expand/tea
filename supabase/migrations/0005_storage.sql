-- 0005: Storage buckets and policies.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-images', 'product-images', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('category-images', 'category-images', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('ingredient-images', 'ingredient-images', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('review-images', 'review-images', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('cms-media', 'cms-media', true, 52428800, NULL),
  ('branding', 'branding', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/svg+xml','image/x-icon']),
  ('shipping-documents', 'shipping-documents', false, 26214400, NULL),
  ('invoices', 'invoices', false, 26214400, NULL)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS public_media_read ON storage.objects;
CREATE POLICY public_media_read ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id IN ('product-images','category-images','ingredient-images','review-images','cms-media','branding'));

DROP POLICY IF EXISTS admin_media_write ON storage.objects;
CREATE POLICY admin_media_write ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('product-images','category-images','ingredient-images','cms-media','branding','shipping-documents','invoices') AND public.is_admin(auth.uid()));

DROP POLICY IF EXISTS admin_media_update ON storage.objects;
CREATE POLICY admin_media_update ON storage.objects FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS admin_media_delete ON storage.objects;
CREATE POLICY admin_media_delete ON storage.objects FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS customer_review_image_insert ON storage.objects;
CREATE POLICY customer_review_image_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'review-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS private_documents_read ON storage.objects;
CREATE POLICY private_documents_read ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id IN ('shipping-documents','invoices') AND public.is_admin(auth.uid()));
