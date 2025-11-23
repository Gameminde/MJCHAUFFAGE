-- Fix Service Requests Table Schema
-- This script ensures all required columns exist, even if the table was created incorrectly previously.

-- 1. Ensure the table exists
CREATE TABLE IF NOT EXISTS public.service_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add missing columns (Safe to run multiple times)
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS request_number TEXT;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS service_type_id UUID REFERENCES public.services(id);
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id);
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS preferred_date DATE;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS preferred_time TIME; -- Keeping this in DB for flexibility, even if not used in UI
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'NORMAL';
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS equipment_details TEXT;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDING';

-- 3. Force Schema Cache Reload for Supabase API
NOTIFY pgrst, 'reload schema';

