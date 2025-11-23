-- 1. Enable RLS on all critical tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 2. Policies for public.users
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" 
ON public.users FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" 
ON public.users FOR SELECT 
TO authenticated 
USING (
  -- Check if the requesting user is an admin (by email or role in metadata)
  auth.jwt() ->> 'email' = 'admin@mjchauffage.com' 
  OR 
  (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin'
);

DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
CREATE POLICY "Admins can update all users" 
ON public.users FOR UPDATE
TO authenticated 
USING (
  auth.jwt() ->> 'email' = 'admin@mjchauffage.com'
);

-- 3. Policies for public.customers
DROP POLICY IF EXISTS "Users can view their own customer profile" ON public.customers;
CREATE POLICY "Users can view their own customer profile" 
ON public.customers FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all customers" ON public.customers;
CREATE POLICY "Admins can view all customers" 
ON public.customers FOR SELECT 
TO authenticated 
USING (
  auth.jwt() ->> 'email' = 'admin@mjchauffage.com'
);

-- 4. Policies for service_requests (Appointments)
DROP POLICY IF EXISTS "Users can insert their own requests" ON public.service_requests;
CREATE POLICY "Users can insert their own requests" 
ON public.service_requests FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own requests" ON public.service_requests;
CREATE POLICY "Users can view their own requests" 
ON public.service_requests FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all requests" ON public.service_requests;
CREATE POLICY "Admins can view all requests" 
ON public.service_requests FOR SELECT 
TO authenticated 
USING (
  auth.jwt() ->> 'email' = 'admin@mjchauffage.com'
);

-- 5. Re-run Backfill with UPDATE to ensure data is synced
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT * FROM auth.users LOOP
    -- Upsert into public.users
    INSERT INTO public.users (id, email, first_name, last_name, role, is_active, created_at, updated_at)
    VALUES (
      user_record.id,
      user_record.email,
      COALESCE(user_record.raw_user_meta_data->>'full_name', user_record.raw_user_meta_data->>'name', ''),
      '',
      CASE WHEN user_record.email = 'admin@mjchauffage.com' THEN 'ADMIN' ELSE 'CUSTOMER' END,
      true,
      user_record.created_at,
      user_record.updated_at
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      role = EXCLUDED.role;

    -- Upsert into public.customers
    INSERT INTO public.customers (user_id, email, first_name, last_name, created_at, updated_at)
    VALUES (
      user_record.id,
      user_record.email,
      COALESCE(user_record.raw_user_meta_data->>'full_name', user_record.raw_user_meta_data->>'name', ''),
      '',
      user_record.created_at,
      user_record.updated_at
    )
    ON CONFLICT (user_id) DO UPDATE SET
      email = EXCLUDED.email;
  END LOOP;
END;
$$;
