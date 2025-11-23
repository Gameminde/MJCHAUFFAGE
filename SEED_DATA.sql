-- 1. Fix Admin User Role
-- Ensure the user exists in public.users and has ADMIN role
INSERT INTO public.users (id, email, role, first_name, last_name, is_active)
SELECT id, email, 'ADMIN', 'Admin', 'User', true
FROM auth.users
WHERE email = 'admin@mjchauffage.com'
ON CONFLICT (id) DO UPDATE
SET role = 'ADMIN', is_active = true;

-- 2. Seed Categories
INSERT INTO public.categories (name, slug, description) VALUES
('Chaudières', 'chaudieres', 'Chaudières à gaz et électriques'),
('Chauffe-bains', 'chauffe-bains', 'Chauffe-bains pour eau chaude sanitaire'),
('Radiateurs', 'radiateurs', 'Radiateurs aluminium et fonte'),
('Pièces de rechange', 'pieces-de-rechange', 'Pièces détachées pour chaudières'),
('Accessoires', 'accessoires', 'Accessoires d''installation')
ON CONFLICT (slug) DO NOTHING;

-- 3. Seed Manufacturers
INSERT INTO public.manufacturers (name, slug) VALUES
('Saunier Duval', 'saunier-duval'),
('Chaffoteaux', 'chaffoteaux'),
('Junkers', 'junkers'),
('Beretta', 'beretta'),
('Riello', 'riello'),
('Global', 'global')
ON CONFLICT (slug) DO NOTHING;

-- 4. Seed Products (Sample)
WITH cat_chaudieres AS (SELECT id FROM public.categories WHERE slug = 'chaudieres'),
     man_saunier AS (SELECT id FROM public.manufacturers WHERE slug = 'saunier-duval')
INSERT INTO public.products (
    name, slug, sku, description, price, category_id, manufacturer_id, stock_quantity, is_active, is_featured
)
SELECT 
    'Saunier Duval ThemaFast Condens', 
    'saunier-duval-themafast-condens', 
    'SD-THEMA-001', 
    'Chaudière murale à condensation gaz.', 
    145000, 
    cat_chaudieres.id, 
    man_saunier.id, 
    10, 
    true, 
    true
FROM cat_chaudieres, man_saunier
ON CONFLICT (slug) DO NOTHING;

-- 5. Seed Product Images
WITH prod AS (SELECT id FROM public.products WHERE slug = 'saunier-duval-themafast-condens')
INSERT INTO public.product_images (product_id, url, alt_text)
SELECT id, 'https://mjchauffage.com/wp-content/uploads/2021/03/ThemaFast-Condens-1.jpg', 'ThemaFast Condens'
FROM prod;
