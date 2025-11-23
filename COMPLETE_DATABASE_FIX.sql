-- COMPLETE DATABASE FIX - Run this ONCE in Supabase SQL Editor
-- This fixes ALL database issues: schema, data, and foreign keys

-- ========================================
-- PART 1: Fix service_requests table schema
-- ========================================

-- 1. Ensure the table exists
CREATE TABLE IF NOT EXISTS public.service_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add missing columns (Safe to run multiple times)
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS request_number TEXT;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS service_type_id UUID;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS preferred_date DATE;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS preferred_time TIME;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'NORMAL';
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS equipment_details TEXT;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDING';

-- ========================================
-- PART 2: Fix services table and populate data
-- ========================================

-- 1. Ensure 'icon' column exists in services table
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS icon TEXT;

-- 2. Clear and populate services table
-- WARNING: This deletes existing services. Backup first if you have real data.
TRUNCATE public.services CASCADE;

INSERT INTO public.services (name, description, price, duration, icon, is_active)
VALUES 
    (
        'Installation Thermostat', 
        'Fourniture et pose d''un thermostat d''ambiance programmable. Optimisez votre confort et réduisez votre consommation.', 
        5000, 
        60, 
        'settings', 
        true
    ),
    (
        'Entretien Annuel', 
        'Nettoyage et vérification complète', 
        3500, 
        90, 
        'wrench', 
        true
    ),
    (
        'Réparation / Dépannage', 
        'Diagnostic et réparation de panne', 
        4000, 
        120, 
        'alert', 
        true
    ),
    (
        'Entretien Chaudière', 
        'Maintenance annuelle complète de votre chaudière gaz. Vérification des organes de sécurité, nettoyage du corps de chauffe.', 
        6000, 
        120, 
        'wrench', 
        true
    ),
    (
        'Dépannage Urgent', 
        'Intervention rapide pour diagnostic et réparation de panne (hors pièces). Déplacement inclus sur Alger.', 
        8000, 
        60, 
        'alert', 
        true
    ),
    (
        'Installation Chaudière', 
        'Installation complète de chaudière gaz', 
        25000, 
        480, 
        'settings', 
        true
    );

-- ========================================
-- PART 3: Add foreign key constraints AFTER data exists
-- ========================================

-- Drop existing constraints if they exist (to avoid conflicts)
ALTER TABLE public.service_requests DROP CONSTRAINT IF EXISTS service_requests_service_type_id_fkey;
ALTER TABLE public.service_requests DROP CONSTRAINT IF EXISTS service_requests_user_id_fkey;

-- Add foreign key constraints
ALTER TABLE public.service_requests 
    ADD CONSTRAINT service_requests_service_type_id_fkey 
    FOREIGN KEY (service_type_id) 
    REFERENCES public.services(id) 
    ON DELETE SET NULL;

ALTER TABLE public.service_requests 
    ADD CONSTRAINT service_requests_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES public.users(id) 
    ON DELETE SET NULL;

-- ========================================
-- PART 4: Force Schema Cache Reload
-- ========================================
NOTIFY pgrst, 'reload schema';

-- ========================================
-- VERIFICATION: Check that services exist
-- ========================================
SELECT COUNT(*) as service_count FROM public.services WHERE is_active = true;
-- You should see 6 services

