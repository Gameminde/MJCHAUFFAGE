-- 1. Fix Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Policies for customers
DROP POLICY IF EXISTS "Users can view their own customer profile" ON public.customers;
CREATE POLICY "Users can view their own customer profile"
ON public.customers FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own customer profile" ON public.customers;
CREATE POLICY "Users can insert their own customer profile"
ON public.customers FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own customer profile" ON public.customers;
CREATE POLICY "Users can update their own customer profile"
ON public.customers FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- 2. Fix Product Images RLS
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public product images are viewable by everyone" ON public.product_images;
CREATE POLICY "Public product images are viewable by everyone"
ON public.product_images FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert product images" ON public.product_images;
CREATE POLICY "Authenticated users can insert product images"
ON public.product_images FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update product images" ON public.product_images;
CREATE POLICY "Authenticated users can update product images"
ON public.product_images FOR UPDATE
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can delete product images" ON public.product_images;
CREATE POLICY "Authenticated users can delete product images"
ON public.product_images FOR DELETE
TO authenticated
USING (true);

-- 3. Storage Policies (for 'products' bucket)
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'products' );

DROP POLICY IF EXISTS "Authenticated Insert" ON storage.objects;
CREATE POLICY "Authenticated Insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'products' );

DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'products' );

DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'products' );

-- 4. Fix Orders Relationship
-- Ensure orders has customer_id
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_id') THEN
        ALTER TABLE public.orders ADD COLUMN customer_id UUID REFERENCES public.customers(id);
    END IF;
END $$;

-- 5. Fix Service Requests Schema
CREATE TABLE IF NOT EXISTS public.service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'request_number') THEN
        ALTER TABLE public.service_requests ADD COLUMN request_number TEXT UNIQUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'user_id') THEN
        ALTER TABLE public.service_requests ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'service_type_id') THEN
        ALTER TABLE public.service_requests ADD COLUMN service_type_id UUID REFERENCES public.service_types(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'description') THEN
        ALTER TABLE public.service_requests ADD COLUMN description TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'preferred_date') THEN
        ALTER TABLE public.service_requests ADD COLUMN preferred_date DATE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'preferred_time') THEN
        ALTER TABLE public.service_requests ADD COLUMN preferred_time TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'priority') THEN
        ALTER TABLE public.service_requests ADD COLUMN priority TEXT DEFAULT 'normal';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'equipment_details') THEN
        ALTER TABLE public.service_requests ADD COLUMN equipment_details TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'contact_name') THEN
        ALTER TABLE public.service_requests ADD COLUMN contact_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'contact_phone') THEN
        ALTER TABLE public.service_requests ADD COLUMN contact_phone TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'address') THEN
        ALTER TABLE public.service_requests ADD COLUMN address TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'status') THEN
        ALTER TABLE public.service_requests ADD COLUMN status TEXT DEFAULT 'PENDING';
    END IF;
END $$;

-- Enable RLS on service_requests
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Policies for service_requests
DROP POLICY IF EXISTS "Users can view their own requests" ON public.service_requests;
CREATE POLICY "Users can view their own requests"
ON public.service_requests FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own requests" ON public.service_requests;
CREATE POLICY "Users can insert their own requests"
ON public.service_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 6. User Sync Trigger (Ensure public.users and public.customers exist)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into public.users
    INSERT INTO public.users (id, email, first_name, last_name, role)
    VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data->>'full_name', -- Attempt to get name from metadata
        '',
        'CUSTOMER'
    )
    ON CONFLICT (id) DO NOTHING;

    -- Insert into public.customers
    INSERT INTO public.customers (user_id, email, first_name, last_name)
    VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data->>'full_name',
        ''
    )
    ON CONFLICT (user_id) DO NOTHING;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
