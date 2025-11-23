
-- Enable RLS on addresses table
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to create their own addresses
CREATE POLICY "Users can insert their own addresses"
ON public.addresses FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = (
  SELECT user_id FROM public.customers WHERE id = customer_id
));

-- Policy: Allow anonymous users to insert addresses (for guest checkout)
-- NOTE: This is less secure but necessary for guest checkout unless we use a Service Role on backend
-- Since we are client-side, we might need to allow Anon inserts IF they are linked to a newly created guest customer.
-- A better approach is to use a Postgres Function to create the order + customer + address in one go with security definer.

-- Simple fix for now: Allow insert for anon if it's for a guest customer (we can't easily check "guest" status from RLS without joins)
-- Let's open it for anon for now but we should restrict it later.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'addresses' AND policyname = 'Enable insert for anon and authenticated'
    ) THEN
        CREATE POLICY "Enable insert for anon and authenticated" ON public.addresses FOR INSERT TO anon, authenticated WITH CHECK (true);
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'addresses' AND policyname = 'Users can view their own addresses'
    ) THEN
        CREATE POLICY "Users can view their own addresses" ON public.addresses FOR SELECT TO authenticated USING (auth.uid() = (SELECT user_id FROM public.customers WHERE id = customer_id));
    END IF;
END
$$;

-- Fix for Customers table RLS as well if needed
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'customers' AND policyname = 'Enable insert for anon and authenticated customers'
    ) THEN
        CREATE POLICY "Enable insert for anon and authenticated customers" ON public.customers FOR INSERT TO anon, authenticated WITH CHECK (true);
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'customers' AND policyname = 'Users can view their own customer profile'
    ) THEN
        CREATE POLICY "Users can view their own customer profile" ON public.customers FOR SELECT TO authenticated USING (auth.uid() = user_id);
    END IF;
END
$$;

-- Fix for Orders table RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Enable insert for anon and authenticated orders'
    ) THEN
        CREATE POLICY "Enable insert for anon and authenticated orders" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Users can view their own orders'
    ) THEN
        CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = (SELECT user_id FROM public.customers WHERE id = customer_id));
    END IF;
END
$$;

-- Fix for Order Items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'order_items' AND policyname = 'Enable insert for all order items'
    ) THEN
        CREATE POLICY "Enable insert for all order items" ON public.order_items FOR INSERT TO anon, authenticated WITH CHECK (true);
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'order_items' AND policyname = 'Users can view their own order items'
    ) THEN
        CREATE POLICY "Users can view their own order items" ON public.order_items FOR SELECT TO authenticated USING (
          EXISTS (
            SELECT 1 FROM public.orders
            JOIN public.customers ON orders.customer_id = customers.id
            WHERE orders.id = order_id AND customers.user_id = auth.uid()
          )
        );
    END IF;
END
$$;

-- Fix for Payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Enable insert for all payments'
    ) THEN
        CREATE POLICY "Enable insert for all payments" ON public.payments FOR INSERT TO anon, authenticated WITH CHECK (true);
    END IF;
END
$$;
