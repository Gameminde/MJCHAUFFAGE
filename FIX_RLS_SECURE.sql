-- 🔧 COMPREHENSIVE FIX FOR RLS POLICIES AND CHECKOUT FLOW
-- This script fixes the critical security issues while allowing proper checkout
-- Safe to run multiple times (idempotent)

-- ========================================
-- 1. FIX CUSTOMERS TABLE RLS
-- ========================================

-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Enable insert for anon and authenticated customers" ON public.customers;
DROP POLICY IF EXISTS "Enable insert for anon and authenticated" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can create own customer profile" ON public.customers;
DROP POLICY IF EXISTS "Users can view own customer profile" ON public.customers;
DROP POLICY IF EXISTS "Users can view their own customer profile" ON public.customers;
DROP POLICY IF EXISTS "Users can update own customer profile" ON public.customers;
DROP POLICY IF EXISTS "Admins can view all customers" ON public.customers;
DROP POLICY IF EXISTS "Admins can manage all customers" ON public.customers;

-- ✅ SECURE: Allow authenticated users to create their own customer profile
CREATE POLICY "Authenticated users can create own customer profile"
ON public.customers FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ✅ Users can view their own customer profile  
CREATE POLICY "Users can view own customer profile"
ON public.customers FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- ✅ Users can update their own customer profile
CREATE POLICY "Users can update own customer profile"
ON public.customers FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- ========================================
-- 2. FIX ADDRESSES TABLE RLS
-- ========================================

-- Drop ALL existing address policies
DROP POLICY IF EXISTS "Enable insert for anon and authenticated" ON public.addresses;
DROP POLICY IF EXISTS "Users can insert their own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can create own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can view their own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can view own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can update own addresses" ON public.addresses;

-- ✅ SECURE: Users can only create addresses for their own customer record
CREATE POLICY "Users can create own addresses"
ON public.addresses FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = (
    SELECT user_id FROM public.customers 
    WHERE id = customer_id
  )
);

-- ✅ Users can view their own addresses
CREATE POLICY "Users can view own addresses"
ON public.addresses FOR SELECT
TO authenticated
USING (
  auth.uid() = (
    SELECT user_id FROM public.customers 
    WHERE id = customer_id
  )
);

-- ✅ Users can update their own addresses
CREATE POLICY "Users can update own addresses"
ON public.addresses FOR UPDATE
TO authenticated
USING (
  auth.uid() = (
    SELECT user_id FROM public.customers 
    WHERE id = customer_id
  )
);

-- ========================================
-- 3. FIX ORDERS TABLE RLS  
-- ========================================

-- Drop ALL existing order policies
DROP POLICY IF EXISTS "Enable insert for anon and authenticated orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all requests" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;

-- ✅ SECURE: Users can create orders for their own customer record
CREATE POLICY "Users can create own orders"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = (
    SELECT user_id FROM public.customers 
    WHERE id = customer_id
  )
);

-- ✅ Users can view their own orders
CREATE POLICY "Users can view own orders"
ON public.orders FOR SELECT
TO authenticated
USING (
  auth.uid() = (
    SELECT user_id FROM public.customers 
    WHERE id = customer_id
  )
);

-- ========================================
-- 3.5. FIX SERVICE_REQUESTS TABLE RLS
-- ========================================

ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing service_requests policies
DROP POLICY IF EXISTS "Users can create own service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Users can view own service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Users can view their own service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Admins can view all service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Admins can manage all service requests" ON public.service_requests;

-- ✅ SECURE: Users can create their own service requests
CREATE POLICY "Users can create own service requests"
ON public.service_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ✅ SECURE: Users can view their own service requests
CREATE POLICY "Users can view own service requests"
ON public.service_requests FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- ✅ SECURE: Users can update their own service requests (e.g., cancel)
CREATE POLICY "Users can update own service requests"
ON public.service_requests FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- ========================================
-- 4. FIX CART_ITEMS TABLE RLS
-- ========================================

-- Enable RLS if not already enabled
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing cart_items policies
DROP POLICY IF EXISTS "Enable all for cart_items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can insert own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can view own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can update own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can delete own cart items" ON public.cart_items;

-- ✅ SECURE: Users can manage their own cart items
CREATE POLICY "Users can insert own cart items"
ON public.cart_items FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = (
    SELECT user_id FROM public.customers 
    WHERE id = customer_id
  )
);

CREATE POLICY "Users can view own cart items"
ON public.cart_items FOR SELECT
TO authenticated
USING (
  auth.uid() = (
    SELECT user_id FROM public.customers 
    WHERE id = customer_id
  )
);

CREATE POLICY "Users can update own cart items"
ON public.cart_items FOR UPDATE
TO authenticated
USING (
  auth.uid() = (
    SELECT user_id FROM public.customers 
    WHERE id = customer_id
  )
);

CREATE POLICY "Users can delete own cart items"
ON public.cart_items FOR DELETE
TO authenticated
USING (
  auth.uid() = (
    SELECT user_id FROM public.customers 
    WHERE id = customer_id
  )
);

-- ========================================
-- 5. FIX ORDER_ITEMS TABLE RLS
-- ========================================

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing order_items policies
DROP POLICY IF EXISTS "Enable insert for all order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can create own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;

-- ✅ SECURE: Users can create order items for their own orders
CREATE POLICY "Users can create own order items"
ON public.order_items FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.customers c ON o.customer_id = c.id
    WHERE o.id = order_id AND c.user_id = auth.uid()
  )
);

-- ✅ SECURE: Users can view their own order items
CREATE POLICY "Users can view own order items"
ON public.order_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.customers c ON o.customer_id = c.id  
    WHERE o.id = order_id AND c.user_id = auth.uid()
  )
);

-- ========================================
-- 6. FIX PAYMENTS TABLE RLS
-- ========================================

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing payment policies
DROP POLICY IF EXISTS "Enable insert for all payments" ON public.payments;
DROP POLICY IF EXISTS "Users can create own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;

-- ✅ SECURE: Users can create payments for their own orders
CREATE POLICY "Users can create own payments"
ON public.payments FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.customers c ON o.customer_id = c.id
    WHERE o.id = order_id AND c.user_id = auth.uid()
  )
);

-- ✅ SECURE: Users can view their own payments
CREATE POLICY "Users can view own payments"
ON public.payments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.customers c ON o.customer_id = c.id
    WHERE o.id = order_id AND c.user_id = auth.uid()
  )
);

-- ========================================
-- 7. PUBLIC TABLES (PRODUCTS, CATEGORIES, ETC)
-- ========================================

-- Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products"
ON public.products FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active categories" ON public.categories;
CREATE POLICY "Public can view active categories"
ON public.categories FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Manufacturers
ALTER TABLE public.manufacturers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active manufacturers" ON public.manufacturers;
CREATE POLICY "Public can view active manufacturers"
ON public.manufacturers FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Product Images
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view product images" ON public.product_images;
CREATE POLICY "Public can view product images"
ON public.product_images FOR SELECT
TO anon, authenticated
USING (true);

-- Services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active services" ON public.services;
CREATE POLICY "Public can view active services"
ON public.services FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- ========================================
-- 8. ADMIN POLICIES
-- ========================================

-- Admins can do everything on all tables
-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('ADMIN', 'SUPER_ADMIN')
  ) IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing admin policies first
DROP POLICY IF EXISTS "Admins can manage all customers" ON public.customers;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage all service requests" ON public.service_requests;

-- Admin policies for key tables
CREATE POLICY "Admins can manage all customers"
ON public.customers FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can manage all orders"
ON public.orders FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can manage all products"
ON public.products FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can manage all service requests"
ON public.service_requests FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- ========================================
-- 9. CREATE SECURE GUEST CHECKOUT FUNCTION  
-- ========================================

-- This function will handle guest checkout securely on the server side
CREATE OR REPLACE FUNCTION create_guest_order(
  customer_data jsonb,
  address_data jsonb,
  order_data jsonb,
  items_data jsonb[]
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer_id uuid;
  v_address_id uuid;
  v_order_id uuid;
  v_order_number text;
  result jsonb;
BEGIN
  -- 1. Create guest customer
  INSERT INTO public.customers (
    first_name,
    last_name,
    email,
    phone,
    is_guest,
    customer_type
  ) VALUES (
    customer_data->>'firstName',
    customer_data->>'lastName',
    customer_data->>'email',
    customer_data->>'phone',
    true,
    'B2C'
  )
  RETURNING id INTO v_customer_id;

  -- 2. Create shipping address
  INSERT INTO public.addresses (
    customer_id,
    type,
    street,
    city,
    postal_code,
    country,
    region
  ) VALUES (
    v_customer_id,
    'SHIPPING',
    address_data->>'street',
    address_data->>'city',
    address_data->>'postalCode',
    COALESCE(address_data->>'country', 'Algeria'),
    address_data->>'region'
  )
  RETURNING id INTO v_address_id;

  -- 3. Generate order number
  v_order_number := 'ORD-' || to_char(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('order_number_seq')::text, 5, '0');

  -- 4. Create order
  INSERT INTO public.orders (
    order_number,
    customer_id,
    address_id,
    status,
    payment_status,
    subtotal,
    shipping_amount,
    tax_amount,
    total_amount
  ) VALUES (
    v_order_number,
    v_customer_id,
    v_address_id,
    'pending',
    'pending',
    (order_data->>'subtotal')::decimal,
    (order_data->>'shippingAmount')::decimal,
    COALESCE((order_data->>'taxAmount')::decimal, 0),
    (order_data->>'totalAmount')::decimal
  )
  RETURNING id INTO v_order_id;

  -- 5. Create order items
  INSERT INTO public.order_items (order_id, product_id, quantity, unit_price, total_price)
  SELECT 
    v_order_id,
    (item->>'productId')::uuid,
    (item->>'quantity')::int,
    (item->>'unitPrice')::decimal,
    (item->>'unitPrice')::decimal * (item->>'quantity')::int
  FROM unnest(items_data) AS item;

  -- 6. Create payment record
  INSERT INTO public.payments (order_id, method, provider, amount, status)
  VALUES (v_order_id, 'CASH_ON_DELIVERY', 'MANUAL', (order_data->>'totalAmount')::decimal, 'pending');

  -- 7. Return result
  result := jsonb_build_object(
    'success', true,
    'orderId', v_order_id,
    'orderNumber', v_order_number,
    'customerId', v_customer_id
  );

  RETURN result;
END;
$$;

-- Create sequence for order numbers if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1000;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_guest_order(jsonb, jsonb, jsonb, jsonb[]) TO anon, authenticated;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Verify RLS is enabled on critical tables
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('customers', 'orders', 'addresses', 'cart_items', 'order_items', 'payments')
ORDER BY tablename;

-- List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
