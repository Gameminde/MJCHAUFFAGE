-- Fix Services Table Data and Schema
-- This script populates the services table to resolve Foreign Key errors (Code: 23503).

-- 1. Ensure 'icon' column exists in services table (used by frontend)
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS icon TEXT;

-- 2. Insert Default Services
-- We delete existing entries to avoid ID conflicts and ensure fresh data that matches our frontend expectations.
-- WARNING: This deletes existing services. If you have real data, back it up first.
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

-- 3. Force Schema Cache Reload
NOTIFY pgrst, 'reload schema';

