-- Update Services: Remove prices and duplicate services
-- This keeps only the essential services without pricing

-- Delete all existing services
TRUNCATE public.services CASCADE;

-- Insert updated services (4 services only, no duplicates, no prices displayed)
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
        'Intervention rapide pour diagnostic et réparation de panne (hors pièces). Déplacement inclus sur Alger, Blida et Boumerdes.', 
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

-- Verify
SELECT id, name, price FROM public.services WHERE is_active = true;

