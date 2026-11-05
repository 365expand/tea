-- 0008: Database Performance Optimization & Composite Indexing
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. Fast fuzzy search index for products (name and SKU)
CREATE INDEX IF NOT EXISTS products_name_trgm_idx ON public.products USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS products_sku_trgm_idx ON public.products USING gin (sku gin_trgm_ops);

-- 2. Composite indexes for high-throughput storefront catalog queries
CREATE INDEX IF NOT EXISTS products_status_featured_created_idx
  ON public.products(status, is_featured, created_at DESC);

CREATE INDEX IF NOT EXISTS products_category_status_idx
  ON public.products(category_id, status, created_at DESC);

-- 3. Composite index for product reviews
CREATE INDEX IF NOT EXISTS reviews_product_status_featured_idx
  ON public.reviews(product_id, status, is_featured, created_at DESC);

-- 4. Customer and order optimization
CREATE INDEX IF NOT EXISTS customer_addresses_user_default_idx
  ON public.customer_addresses(user_id, is_default);

CREATE INDEX IF NOT EXISTS orders_customer_status_created_idx
  ON public.orders(customer_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS invoices_order_idx
  ON public.invoices(order_id);

-- 5. Run ANALYZE to update PostgreSQL query planner statistics
ANALYZE public.products;
ANALYZE public.categories;
ANALYZE public.reviews;
ANALYZE public.orders;
ANALYZE public.order_items;
ANALYZE public.customers;

