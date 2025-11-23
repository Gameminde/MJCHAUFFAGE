-- Final Update: Remove Installation Thermostat and keep only 4 essential services
-- Run this in Supabase SQL Editor

-- Delete all existing services
TRUNCATE public.services CASCADE;

-- Insert only the 4 essential services (NO Installation Thermostat, NO Entretien Annuel)
INSERT INTO public.services (name, description, price, duration, icon, is_active)
VALUES 
    (
        'Entretien Chaudière', 
        'Maintenance annuelle complète de votre chaudière gaz. Vérification des organes de sécurité, nettoyage du corps de chauffe, contrôle de la combustion.', 
        0, 
        120, 
        'wrench', 
        true
    ),
    (
        'Réparation / Dépannage', 
        'Diagnostic et réparation de panne. Prix déterminé selon l''état et l''urgence.', 
        0, 
        120, 
        'alert', 
        true
    ),
    (
        'Dépannage Urgent', 
        'Intervention rapide pour diagnostic et réparation de panne (hors pièces). Déplacement inclus sur Alger, Blida et Boumerdès.', 
        0, 
        60, 
        'alert', 
        true
    ),
    (
        'Installation Chaudière', 
        'Installation complète de chaudière gaz. Devis sur mesure selon votre besoin.', 
        0, 
        480, 
        'settings', 
        true
    );

-- Force Schema Cache Reload
NOTIFY pgrst, 'reload schema';

-- Verify: You should see exactly 4 services
SELECT id, name, price, duration FROM public.services WHERE is_active = true ORDER BY name;

