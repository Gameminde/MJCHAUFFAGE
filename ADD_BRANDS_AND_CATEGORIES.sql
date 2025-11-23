-- Add Boiler Brands and Detailed Categories for E-commerce
-- Run this in Supabase SQL Editor

-- ========================================
-- PART 1: Add Brand/Origin Column to Manufacturers
-- ========================================

ALTER TABLE public.manufacturers ADD COLUMN IF NOT EXISTS country_code TEXT;
ALTER TABLE public.manufacturers ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- ========================================
-- PART 2: Insert Brands (Manufacturers) by Country
-- ========================================

-- Clear existing manufacturers (optional, remove if you have existing data)
-- TRUNCATE public.manufacturers CASCADE;

INSERT INTO public.manufacturers (name, slug, country_code, sort_order, is_active) VALUES
-- 🇩🇿 Algerian Brands
('Sonaric', 'sonaric', 'DZ', 1, true),
('ENIEM', 'eniem', 'DZ', 2, true),
('Condor', 'condor', 'DZ', 3, true),

-- 🇫🇷 French Brands
('Saunier Duval', 'saunier-duval', 'FR', 10, true),
('Chappée', 'chappee', 'FR', 11, true),
('ELM Leblanc', 'elm-leblanc', 'FR', 12, true),
('De Dietrich', 'de-dietrich', 'FR', 13, true),
('Atlantic', 'atlantic', 'FR', 14, true),
('Frisquet', 'frisquet', 'FR', 15, true),

-- 🇮🇹 Italian Brands
('Beretta', 'beretta', 'IT', 20, true),
('Riello', 'riello', 'IT', 21, true),
('Ariston', 'ariston', 'IT', 22, true),
('Ferroli', 'ferroli', 'IT', 23, true),
('Sime', 'sime', 'IT', 24, true),
('Unical', 'unical', 'IT', 25, true),
('Immergas', 'immergas', 'IT', 26, true),
('Biasi', 'biasi', 'IT', 27, true),
('Lamborghini Caloreclima', 'lamborghini-caloreclima', 'IT', 28, true),

-- 🇩🇪 German Brands
('Vaillant', 'vaillant', 'DE', 30, true),
('Viessmann', 'viessmann', 'DE', 31, true),
('Bosch', 'bosch', 'DE', 32, true),
('Buderus', 'buderus', 'DE', 33, true)
ON CONFLICT (slug) DO NOTHING;

-- ========================================
-- PART 3: Insert Product Categories (Hierarchical)
-- ========================================

-- Clear existing categories (optional)
-- TRUNCATE public.categories CASCADE;

-- MAIN CATEGORIES
INSERT INTO public.categories (name, slug, description, parent_id, sort_order, is_active) VALUES
('Hydraulique', 'hydraulique', 'Circulation de l''eau - Pompes, vannes, échangeurs', NULL, 1, true),
('Régulation & Électronique', 'regulation-electronique', 'Cartes mères, thermostats, sondes', NULL, 2, true),
('Combustion & Gaz', 'combustion-gaz', 'Blocs gaz, brûleurs, électrodes', NULL, 3, true),
('Maintenance & Consommables', 'maintenance-consommables', 'Kits de maintenance, anodes, purgeurs', NULL, 4, true)
ON CONFLICT (slug) DO NOTHING;

-- SUB-CATEGORIES: Hydraulique
INSERT INTO public.categories (name, slug, description, parent_id, sort_order, is_active) VALUES
('Pompes / Circulateurs', 'pompes-circulateurs', 'Le cœur du système hydraulique', 
    (SELECT id FROM public.categories WHERE slug = 'hydraulique'), 10, true),
('Vannes 3 Voies', 'vannes-3-voies', 'Moteur de vanne et corps de vanne', 
    (SELECT id FROM public.categories WHERE slug = 'hydraulique'), 11, true),
('Échangeurs à plaques', 'echangeurs-plaques', 'Pour l''eau chaude sanitaire', 
    (SELECT id FROM public.categories WHERE slug = 'hydraulique'), 12, true),
('Corps de chauffe', 'corps-de-chauffe', 'Échangeur principal', 
    (SELECT id FROM public.categories WHERE slug = 'hydraulique'), 13, true),
('Vases d''expansion', 'vases-expansion', 'Régulation de pression', 
    (SELECT id FROM public.categories WHERE slug = 'hydraulique'), 14, true),
('Débistats & Fluxostats', 'debistats-fluxostats', 'Détecteurs de débit', 
    (SELECT id FROM public.categories WHERE slug = 'hydraulique'), 15, true),
('Soupapes de sécurité', 'soupapes-securite', 'Protection 3 bars', 
    (SELECT id FROM public.categories WHERE slug = 'hydraulique'), 16, true),
('Disconnecteurs', 'disconnecteurs', 'Robinets de remplissage', 
    (SELECT id FROM public.categories WHERE slug = 'hydraulique'), 17, true)
ON CONFLICT (slug) DO NOTHING;

-- SUB-CATEGORIES: Régulation & Électronique
INSERT INTO public.categories (name, slug, description, parent_id, sort_order, is_active) VALUES
('Cartes Mères / Circuits Imprimés', 'cartes-meres', 'Cerveau de la chaudière', 
    (SELECT id FROM public.categories WHERE slug = 'regulation-electronique'), 20, true),
('Thermostats', 'thermostats', 'D''ambiance ou de sécurité', 
    (SELECT id FROM public.categories WHERE slug = 'regulation-electronique'), 21, true),
('Sondes de température', 'sondes-temperature', 'NTC/CTN', 
    (SELECT id FROM public.categories WHERE slug = 'regulation-electronique'), 22, true),
('Pressostats Eau', 'pressostats-eau', 'Manocontacts', 
    (SELECT id FROM public.categories WHERE slug = 'regulation-electronique'), 23, true),
('Afficheurs / Écrans LCD', 'afficheurs-ecrans', 'Interface utilisateur', 
    (SELECT id FROM public.categories WHERE slug = 'regulation-electronique'), 24, true)
ON CONFLICT (slug) DO NOTHING;

-- SUB-CATEGORIES: Combustion & Gaz
INSERT INTO public.categories (name, slug, description, parent_id, sort_order, is_active) VALUES
('Blocs Gaz / Vannes Gaz', 'blocs-gaz', 'Régulation du gaz', 
    (SELECT id FROM public.categories WHERE slug = 'combustion-gaz'), 30, true),
('Brûleurs', 'bruleurs', 'Chambre de combustion', 
    (SELECT id FROM public.categories WHERE slug = 'combustion-gaz'), 31, true),
('Électrodes', 'electrodes', 'D''allumage et d''ionisation', 
    (SELECT id FROM public.categories WHERE slug = 'combustion-gaz'), 32, true),
('Injecteurs Gaz', 'injecteurs-gaz', 'Gaz Naturel / Butane', 
    (SELECT id FROM public.categories WHERE slug = 'combustion-gaz'), 33, true),
('Pressostats Air', 'pressostats-air', 'Pour chaudières à ventouse', 
    (SELECT id FROM public.categories WHERE slug = 'combustion-gaz'), 34, true),
('Extracteurs de fumée / Ventilateurs', 'extracteurs-fumee', 'Évacuation des gaz', 
    (SELECT id FROM public.categories WHERE slug = 'combustion-gaz'), 35, true)
ON CONFLICT (slug) DO NOTHING;

-- SUB-CATEGORIES: Maintenance & Consommables
INSERT INTO public.categories (name, slug, description, parent_id, sort_order, is_active) VALUES
('Kits de maintenance', 'kits-maintenance', 'Pochettes de joints', 
    (SELECT id FROM public.categories WHERE slug = 'maintenance-consommables'), 40, true),
('Anodes', 'anodes', 'Pour ballons intégrés', 
    (SELECT id FROM public.categories WHERE slug = 'maintenance-consommables'), 41, true),
('Purgeurs automatiques', 'purgeurs-automatiques', 'Évacuation d''air', 
    (SELECT id FROM public.categories WHERE slug = 'maintenance-consommables'), 42, true),
('Thermomanomètres', 'thermomanometres', 'Cadran pression et température', 
    (SELECT id FROM public.categories WHERE slug = 'maintenance-consommables'), 43, true)
ON CONFLICT (slug) DO NOTHING;

-- ========================================
-- PART 4: Verification Queries
-- ========================================

-- Check Brands by Country
SELECT country_code, COUNT(*) as brand_count, STRING_AGG(name, ', ') as brands
FROM public.manufacturers 
WHERE is_active = true 
GROUP BY country_code 
ORDER BY country_code;

-- Check Main Categories
SELECT name, slug, 
    (SELECT COUNT(*) FROM public.categories c2 WHERE c2.parent_id = c1.id) as subcategory_count
FROM public.categories c1 
WHERE parent_id IS NULL 
ORDER BY sort_order;

-- Check All Categories (Hierarchical)
SELECT 
    CASE WHEN parent_id IS NULL THEN '📁 ' ELSE '  └─ ' END || name as category_tree,
    slug
FROM public.categories 
ORDER BY 
    COALESCE(parent_id, id),
    sort_order;

-- Force Schema Cache Reload
NOTIFY pgrst, 'reload schema';

