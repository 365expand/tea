-- 0003: Functions, triggers and transactional business logic.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'admin_roles','admin_users','customers','categories','subcategories','products',
    'ingredients','product_faqs','reviews','customer_addresses','orders','payments',
    'refunds','expenses','cms_pages','cms_faqs','homepage_sections','banners',
    'navigation_menus','settings','email_templates','stock_movements'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', t);
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(p_user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users au
    WHERE au.user_id = p_user AND au.is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(p_user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users au
    JOIN public.admin_roles ar ON ar.id = au.role_id
    WHERE au.user_id = p_user AND au.is_active = true AND ar.name = 'super_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.customers (id, email, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.next_document_number(p_key text, p_prefix text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_value bigint;
BEGIN
  INSERT INTO public.document_counters (key, last_value)
  VALUES (p_key, 1)
  ON CONFLICT (key) DO UPDATE
    SET last_value = public.document_counters.last_value + 1, updated_at = now()
  RETURNING last_value INTO v_value;
  RETURN p_prefix || lpad(v_value::text, 6, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.next_order_number()
RETURNS text LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT public.next_document_number('order', 'TEA-');
$$;

CREATE OR REPLACE FUNCTION public.next_invoice_number()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_prefix text;
BEGIN
  SELECT COALESCE(value->>'invoice_prefix', 'INV') INTO v_prefix
  FROM public.settings WHERE key = 'business';
  IF v_prefix IS NULL OR length(trim(v_prefix)) = 0 THEN v_prefix := 'INV'; END IF;
  RETURN public.next_document_number('invoice', v_prefix || '-');
END;
$$;

CREATE OR REPLACE FUNCTION public.place_order(p_payload jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_customer_id uuid := NULLIF(p_payload->>'customer_id','')::uuid;
  v_customer public.customers%ROWTYPE;
  v_item jsonb;
  v_product public.products%ROWTYPE;
  v_qty integer;
  v_unit_price numeric(12,2);
  v_line_total numeric(12,2);
  v_tax_amount numeric(12,2);
  v_subtotal numeric(12,2) := 0;
  v_tax_total numeric(12,2) := 0;
  v_shipping numeric(12,2) := 0;
  v_free_threshold numeric(12,2) := 0;
  v_default_shipping numeric(12,2) := 0;
  v_grand numeric(12,2) := 0;
  v_order_id uuid;
  v_order_number text;
  v_invoice_number text;
  v_payment_method public.payment_method;
  v_shipping_addr jsonb;
  v_billing_addr jsonb;
  v_count integer := 0;
  v_new_stock integer;
BEGIN
  IF v_customer_id IS NULL THEN
    RAISE EXCEPTION 'A signed-in customer is required';
  END IF;

  SELECT * INTO v_customer FROM public.customers WHERE id = v_customer_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Customer profile not found';
  END IF;

  IF jsonb_typeof(p_payload->'items') <> 'array' OR jsonb_array_length(p_payload->'items') = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item';
  END IF;

  v_payment_method := COALESCE(NULLIF(p_payload->>'payment_method',''), 'cod')::public.payment_method;
  v_shipping_addr := COALESCE(p_payload->'shipping_address', '{}'::jsonb);
  v_billing_addr := COALESCE(p_payload->'billing_address', v_shipping_addr);

  IF COALESCE(v_shipping_addr->>'full_name','') = '' OR COALESCE(v_shipping_addr->>'line1','') = ''
     OR COALESCE(v_shipping_addr->>'city','') = '' OR COALESCE(v_shipping_addr->>'state','') = ''
     OR COALESCE(v_shipping_addr->>'postal_code','') = '' THEN
    RAISE EXCEPTION 'A complete shipping address is required';
  END IF;

  SELECT COALESCE(value->>'default_charge','0')::numeric, COALESCE(value->>'free_threshold','0')::numeric
  INTO v_default_shipping, v_free_threshold
  FROM public.settings WHERE key = 'shipping';

  v_order_number := public.next_order_number();

  INSERT INTO public.orders (
    order_number, customer_id, customer_email, customer_name, customer_phone,
    payment_method, payment_status, status, customer_note, currency
  ) VALUES (
    v_order_number, v_customer_id, v_customer.email,
    COALESCE(NULLIF(p_payload->>'customer_name',''), v_customer.full_name, 'Customer'),
    COALESCE(NULLIF(p_payload->>'customer_phone',''), v_customer.phone),
    v_payment_method, 'pending', 'pending', NULLIF(p_payload->>'customer_note',''), 'INR'
  ) RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_payload->'items')
  LOOP
    v_qty := COALESCE((v_item->>'quantity')::integer, 0);
    IF v_qty <= 0 THEN RAISE EXCEPTION 'Invalid item quantity'; END IF;

    SELECT * INTO v_product FROM public.products
    WHERE id = (v_item->>'product_id')::uuid AND status = 'active'
    FOR UPDATE;

    IF NOT FOUND THEN RAISE EXCEPTION 'Product is unavailable'; END IF;
    IF v_product.stock_quantity < v_qty THEN
      RAISE EXCEPTION 'Insufficient stock for %', v_product.name;
    END IF;

    v_unit_price := COALESCE(v_product.sale_price, v_product.regular_price);
    v_line_total := round(v_unit_price * v_qty, 2);
    v_tax_amount := round(v_line_total - (v_line_total / (1 + (v_product.tax_rate / 100))), 2);

    INSERT INTO public.order_items (
      order_id, product_id, product_name, product_sku, product_image,
      unit_price, quantity, tax_rate, tax_amount, line_total, net_quantity, hsn_code
    ) VALUES (
      v_order_id, v_product.id, v_product.name, v_product.sku, v_product.featured_image_url,
      v_unit_price, v_qty, v_product.tax_rate, v_tax_amount, v_line_total,
      v_product.net_quantity, v_product.hsn_code
    );

    v_new_stock := v_product.stock_quantity - v_qty;
    UPDATE public.products SET stock_quantity = v_new_stock WHERE id = v_product.id;

    INSERT INTO public.stock_movements (
      product_id, type, quantity_change, quantity_before, quantity_after,
      reference_type, reference_id, note
    ) VALUES (
      v_product.id, 'sale', -v_qty, v_product.stock_quantity, v_new_stock,
      'order', v_order_id, 'Stock reserved for order ' || v_order_number
    );

    v_subtotal := v_subtotal + v_line_total;
    v_tax_total := v_tax_total + v_tax_amount;
    v_count := v_count + 1;
  END LOOP;

  IF v_count = 0 THEN RAISE EXCEPTION 'Order must contain at least one item'; END IF;

  IF v_free_threshold > 0 AND v_subtotal >= v_free_threshold THEN
    v_shipping := 0;
  ELSE
    v_shipping := v_default_shipping;
  END IF;

  v_grand := round(v_subtotal + v_shipping, 2);

  UPDATE public.orders SET
    subtotal = v_subtotal,
    shipping_total = v_shipping,
    tax_total = v_tax_total,
    grand_total = v_grand
  WHERE id = v_order_id;

  INSERT INTO public.order_addresses (order_id, type, full_name, phone, line1, line2, city, state, postal_code, country)
  VALUES (
    v_order_id, 'shipping',
    COALESCE(v_shipping_addr->>'full_name', v_customer.full_name, 'Customer'),
    NULLIF(v_shipping_addr->>'phone',''),
    v_shipping_addr->>'line1',
    NULLIF(v_shipping_addr->>'line2',''),
    v_shipping_addr->>'city',
    v_shipping_addr->>'state',
    v_shipping_addr->>'postal_code',
    COALESCE(NULLIF(v_shipping_addr->>'country',''), 'India')
  );

  INSERT INTO public.order_addresses (order_id, type, full_name, phone, line1, line2, city, state, postal_code, country)
  VALUES (
    v_order_id, 'billing',
    COALESCE(v_billing_addr->>'full_name', v_shipping_addr->>'full_name', v_customer.full_name, 'Customer'),
    NULLIF(v_billing_addr->>'phone',''),
    COALESCE(v_billing_addr->>'line1', v_shipping_addr->>'line1'),
    NULLIF(v_billing_addr->>'line2',''),
    COALESCE(v_billing_addr->>'city', v_shipping_addr->>'city'),
    COALESCE(v_billing_addr->>'state', v_shipping_addr->>'state'),
    COALESCE(v_billing_addr->>'postal_code', v_shipping_addr->>'postal_code'),
    COALESCE(NULLIF(v_billing_addr->>'country',''), 'India')
  );

  INSERT INTO public.order_status_history (order_id, from_status, to_status, note)
  VALUES (v_order_id, NULL, 'pending', 'Order placed');

  v_invoice_number := public.next_invoice_number();
  INSERT INTO public.invoices (
    order_id, invoice_number, invoice_date, gstin, place_of_supply, is_gst,
    subtotal, tax_total, shipping_total, discount_total, grand_total
  )
  SELECT
    v_order_id, v_invoice_number, CURRENT_DATE,
    NULLIF(s.value->>'gstin',''),
    COALESCE(NULLIF(s.value->>'place_of_supply',''), 'India'),
    COALESCE((s.value->>'show_gst')::boolean, false),
    v_subtotal, v_tax_total, v_shipping, 0, v_grand
  FROM public.settings s WHERE s.key = 'business';

  IF NOT FOUND THEN
    INSERT INTO public.invoices (order_id, invoice_number, subtotal, tax_total, shipping_total, discount_total, grand_total)
    VALUES (v_order_id, v_invoice_number, v_subtotal, v_tax_total, v_shipping, 0, v_grand);
  END IF;

  UPDATE public.customers SET
    email = v_customer.email,
    full_name = COALESCE(v_customer.full_name, v_customer.email),
    phone = COALESCE(v_customer.phone, NULLIF(p_payload->>'customer_phone','')),
    total_orders = total_orders + 1,
    total_spent = total_spent + v_grand
  WHERE id = v_customer_id;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'invoice_number', v_invoice_number,
    'subtotal', v_subtotal,
    'shipping_total', v_shipping,
    'tax_total', v_tax_total,
    'grand_total', v_grand,
    'payment_method', v_payment_method
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.confirm_order_payment(
  p_order_id uuid,
  p_provider text,
  p_provider_order_id text,
  p_provider_payment_id text,
  p_amount numeric,
  p_signature_verified boolean,
  p_raw jsonb DEFAULT NULL,
  p_method text DEFAULT NULL
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_payment_id uuid;
  v_existing public.payments%ROWTYPE;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found'; END IF;

  IF p_provider_payment_id IS NOT NULL THEN
    SELECT * INTO v_existing FROM public.payments WHERE provider_payment_id = p_provider_payment_id;
    IF FOUND THEN
      RETURN jsonb_build_object('duplicate', true, 'payment_id', v_existing.id, 'order_id', v_existing.order_id);
    END IF;
  END IF;

  IF round(p_amount,2) < round(v_order.grand_total,2) THEN
    RAISE EXCEPTION 'Payment amount is less than order total';
  END IF;

  INSERT INTO public.payments (
    order_id, provider, provider_order_id, provider_payment_id, amount,
    currency, status, method, signature_verified, raw_response, paid_at
  ) VALUES (
    p_order_id, COALESCE(p_provider,'razorpay'), p_provider_order_id, p_provider_payment_id,
    round(p_amount,2), v_order.currency, 'paid', p_method, p_signature_verified, p_raw, now()
  ) RETURNING id INTO v_payment_id;

  UPDATE public.orders SET
    payment_status = 'paid',
    status = CASE WHEN status = 'pending' THEN 'confirmed'::public.order_status ELSE status END,
    confirmed_at = COALESCE(confirmed_at, now())
  WHERE id = p_order_id;

  IF v_order.status = 'pending' THEN
    INSERT INTO public.order_status_history (order_id, from_status, to_status, note)
    VALUES (p_order_id, 'pending', 'confirmed', 'Payment confirmed');
  END IF;

  INSERT INTO public.transactions (order_id, payment_id, type, direction, amount, description)
  VALUES (p_order_id, v_payment_id, 'payment', 'credit', round(p_amount,2), 'Online payment received');

  RETURN jsonb_build_object('duplicate', false, 'payment_id', v_payment_id, 'order_id', p_order_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_cod_collected(p_order_id uuid, p_actor uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_payment_id uuid;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found'; END IF;
  IF v_order.payment_method <> 'cod' THEN RAISE EXCEPTION 'Order is not a COD order'; END IF;

  IF v_order.payment_status = 'paid' THEN
    RETURN jsonb_build_object('duplicate', true, 'order_id', p_order_id);
  END IF;

  INSERT INTO public.payments (order_id, provider, amount, currency, status, method, signature_verified, paid_at)
  VALUES (p_order_id, 'cod', v_order.grand_total, v_order.currency, 'paid', 'COD', false, now())
  RETURNING id INTO v_payment_id;

  UPDATE public.orders SET
    payment_status = 'paid',
    status = CASE WHEN status = 'pending' THEN 'confirmed'::public.order_status ELSE status END,
    confirmed_at = COALESCE(confirmed_at, now())
  WHERE id = p_order_id;

  IF v_order.status = 'pending' THEN
    INSERT INTO public.order_status_history (order_id, from_status, to_status, note)
    VALUES (p_order_id, 'pending', 'confirmed', 'COD payment collected');
  END IF;

  INSERT INTO public.transactions (order_id, payment_id, type, direction, amount, description, created_by)
  VALUES (p_order_id, v_payment_id, 'cod_collection', 'credit', v_order.grand_total, 'COD amount collected', p_actor);

  RETURN jsonb_build_object('duplicate', false, 'payment_id', v_payment_id, 'order_id', p_order_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.record_refund(
  p_order_id uuid,
  p_amount numeric,
  p_reason text DEFAULT NULL,
  p_provider_refund_id text DEFAULT NULL,
  p_actor uuid DEFAULT NULL
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_paid numeric(12,2);
  v_refunded numeric(12,2);
  v_refund_id uuid;
  v_payment_id uuid;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found'; END IF;
  IF p_amount <= 0 THEN RAISE EXCEPTION 'Refund amount must be positive'; END IF;

  SELECT COALESCE(SUM(amount),0) INTO v_paid FROM public.payments
  WHERE order_id = p_order_id AND status <> 'failed';
  SELECT COALESCE(SUM(amount),0) INTO v_refunded FROM public.refunds
  WHERE order_id = p_order_id AND status = 'processed';

  IF p_amount > (v_paid - v_refunded) THEN
    RAISE EXCEPTION 'Refund exceeds remaining collected amount';
  END IF;

  SELECT id INTO v_payment_id FROM public.payments
  WHERE order_id = p_order_id AND status <> 'failed'
  ORDER BY created_at DESC LIMIT 1;

  INSERT INTO public.refunds (order_id, payment_id, amount, reason, status, provider_refund_id, processed_by, processed_at)
  VALUES (p_order_id, v_payment_id, round(p_amount,2), p_reason, 'processed', p_provider_refund_id, p_actor, now())
  RETURNING id INTO v_refund_id;

  INSERT INTO public.transactions (order_id, payment_id, refund_id, type, direction, amount, description, created_by)
  VALUES (p_order_id, v_payment_id, v_refund_id, 'refund', 'debit', round(p_amount,2), COALESCE(p_reason,'Refund issued'), p_actor);

  IF (v_refunded + p_amount) >= v_paid THEN
    UPDATE public.payments SET status = 'refunded' WHERE id = v_payment_id;
    UPDATE public.orders SET payment_status = 'refunded' WHERE id = p_order_id;
  ELSE
    UPDATE public.payments SET status = 'partially_refunded' WHERE id = v_payment_id;
    UPDATE public.orders SET payment_status = 'partially_refunded' WHERE id = p_order_id;
  END IF;

  RETURN jsonb_build_object('refund_id', v_refund_id, 'order_id', p_order_id, 'amount', round(p_amount,2));
END;
$$;

CREATE OR REPLACE FUNCTION public.update_order_status(
  p_order_id uuid,
  p_new_status public.order_status,
  p_note text DEFAULT NULL,
  p_actor uuid DEFAULT NULL
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_item public.order_items%ROWTYPE;
  v_allowed boolean := false;
  v_restored boolean;
  v_new_stock integer;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found'; END IF;

  IF v_order.status = p_new_status THEN
    RETURN jsonb_build_object('changed', false, 'status', v_order.status);
  END IF;

  v_allowed := CASE v_order.status
    WHEN 'pending' THEN p_new_status IN ('confirmed','cancelled')
    WHEN 'confirmed' THEN p_new_status IN ('processing','cancelled')
    WHEN 'processing' THEN p_new_status IN ('shipped','cancelled')
    WHEN 'shipped' THEN p_new_status IN ('delivered','returned')
    WHEN 'delivered' THEN p_new_status IN ('returned')
    ELSE false
  END;

  IF NOT v_allowed THEN
    RAISE EXCEPTION 'Invalid status transition from % to %', v_order.status, p_new_status;
  END IF;

  UPDATE public.orders SET
    status = p_new_status,
    shipped_at = CASE WHEN p_new_status = 'shipped' THEN now() ELSE shipped_at END,
    delivered_at = CASE WHEN p_new_status = 'delivered' THEN now() ELSE delivered_at END,
    cancelled_at = CASE WHEN p_new_status = 'cancelled' THEN now() ELSE cancelled_at END
  WHERE id = p_order_id;

  INSERT INTO public.order_status_history (order_id, from_status, to_status, changed_by, note)
  VALUES (p_order_id, v_order.status, p_new_status, p_actor, p_note);

  IF p_new_status IN ('cancelled','returned') THEN
    SELECT EXISTS (
      SELECT 1 FROM public.stock_movements
      WHERE reference_type = 'order' AND reference_id = p_order_id
        AND type IN ('cancellation','return')
    ) INTO v_restored;

    IF NOT v_restored THEN
      FOR v_item IN SELECT * FROM public.order_items WHERE order_id = p_order_id AND product_id IS NOT NULL
      LOOP
        SELECT stock_quantity INTO v_new_stock FROM public.products WHERE id = v_item.product_id FOR UPDATE;
        IF FOUND THEN
          INSERT INTO public.stock_movements (
            product_id, type, quantity_change, quantity_before, quantity_after,
            reference_type, reference_id, note, created_by
          ) VALUES (
            v_item.product_id,
            CASE WHEN p_new_status = 'returned' THEN 'return'::public.stock_movement_type ELSE 'cancellation'::public.stock_movement_type END,
            v_item.quantity, v_new_stock, v_new_stock + v_item.quantity,
            'order', p_order_id, 'Stock restored after order ' || v_order.order_number, p_actor
          );
          UPDATE public.products SET stock_quantity = v_new_stock + v_item.quantity WHERE id = v_item.product_id;
        END IF;
      END LOOP;
    END IF;
  END IF;

  RETURN jsonb_build_object('changed', true, 'status', p_new_status);
END;
$$;

CREATE OR REPLACE FUNCTION public.adjust_product_stock(
  p_product_id uuid,
  p_change integer,
  p_note text DEFAULT NULL,
  p_actor uuid DEFAULT NULL
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_before integer;
  v_after integer;
BEGIN
  IF p_change = 0 THEN RAISE EXCEPTION 'Stock change cannot be zero'; END IF;
  SELECT stock_quantity INTO v_before FROM public.products WHERE id = p_product_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Product not found'; END IF;
  v_after := v_before + p_change;
  IF v_after < 0 THEN RAISE EXCEPTION 'Stock cannot be negative'; END IF;

  UPDATE public.products SET stock_quantity = v_after WHERE id = p_product_id;
  INSERT INTO public.stock_movements (
    product_id, type, quantity_change, quantity_before, quantity_after, reference_type, note, created_by
  ) VALUES (p_product_id, 'adjustment', p_change, v_before, v_after, 'manual', p_note, p_actor);

  RETURN jsonb_build_object('product_id', p_product_id, 'stock_quantity', v_after);
END;
$$;

CREATE OR REPLACE FUNCTION public.track_order(p_order_number text, p_email text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_items jsonb;
  v_history jsonb;
BEGIN
  SELECT * INTO v_order FROM public.orders
  WHERE upper(order_number) = upper(trim(p_order_number))
    AND lower(customer_email) = lower(trim(p_email));
  IF NOT FOUND THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'name', oi.product_name, 'quantity', oi.quantity, 'image', oi.product_image,
    'line_total', oi.line_total
  ) ORDER BY oi.created_at), '[]'::jsonb) INTO v_items
  FROM public.order_items oi WHERE oi.order_id = v_order.id;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'status', h.to_status, 'note', h.note, 'at', h.created_at
  ) ORDER BY h.created_at), '[]'::jsonb) INTO v_history
  FROM public.order_status_history h WHERE h.order_id = v_order.id;

  RETURN jsonb_build_object(
    'found', true,
    'order_number', v_order.order_number,
    'status', v_order.status,
    'payment_status', v_order.payment_status,
    'grand_total', v_order.grand_total,
    'created_at', v_order.created_at,
    'courier_name', v_order.courier_name,
    'tracking_number', v_order.tracking_number,
    'tracking_url', v_order.tracking_url,
    'items', v_items,
    'history', v_history
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.set_app_secret(p_name text, p_secret text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, vault AS $$
DECLARE v_id uuid;
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' AND current_user NOT IN ('postgres','service_role') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  SELECT id INTO v_id FROM vault.secrets WHERE name = p_name;
  IF v_id IS NULL THEN
    PERFORM vault.create_secret(p_secret, p_name);
  ELSE
    PERFORM vault.update_secret(v_id, p_secret);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_app_secret(p_name text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, vault AS $$
DECLARE v_secret text;
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' AND current_user NOT IN ('postgres','service_role') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  SELECT decrypted_secret INTO v_secret FROM vault.decrypted_secrets WHERE name = p_name;
  RETURN v_secret;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_app_secret(p_name text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, vault AS $$
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' AND current_user NOT IN ('postgres','service_role') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  DELETE FROM vault.secrets WHERE name = p_name;
END;
$$;

REVOKE ALL ON FUNCTION public.place_order(jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.confirm_order_payment(uuid,text,text,text,numeric,boolean,jsonb,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.mark_cod_collected(uuid,uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_refund(uuid,numeric,text,text,uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_order_status(uuid,public.order_status,text,uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.adjust_product_stock(uuid,integer,text,uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_app_secret(text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_app_secret(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_app_secret(text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.track_order(text,text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.next_order_number() TO service_role;
GRANT EXECUTE ON FUNCTION public.next_invoice_number() TO service_role;
GRANT EXECUTE ON FUNCTION public.place_order(jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.confirm_order_payment(uuid,text,text,text,numeric,boolean,jsonb,text) TO service_role;
GRANT EXECUTE ON FUNCTION public.mark_cod_collected(uuid,uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.record_refund(uuid,numeric,text,text,uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.update_order_status(uuid,public.order_status,text,uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.adjust_product_stock(uuid,integer,text,uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.set_app_secret(text,text) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_app_secret(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_app_secret(text) TO service_role;
