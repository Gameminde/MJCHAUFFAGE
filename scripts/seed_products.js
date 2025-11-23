const { createClient } = require('@supabase/supabase-js');

// Configuration
const PROJECT_URL = 'https://jqrwunmxblzebmvmugju.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impxcnd1bm14Ymx6ZWJtdm11Z2p1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzczODA2NiwiZXhwIjoyMDc5MzE0MDY2fQ.nHeaptGDRi0MAYHcYvtsxcy_Xwc0gYBwj8l6gpbOwtU';

async function seedProducts() {
    const supabase = createClient(PROJECT_URL, SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    console.log('🌱 Seeding Products...');

    // 1. Get Category and Manufacturer IDs
    const { data: category } = await supabase.from('categories').select('id').eq('slug', 'chaudieres').single();
    const { data: manufacturer } = await supabase.from('manufacturers').select('id').eq('slug', 'saunier-duval').single();

    if (!category || !manufacturer) {
        console.error('❌ Prerequisites missing: Run setup_supabase.js first to seed categories and manufacturers.');
        return;
    }

    // 2. Define Products
    const products = [
        {
            name: 'Saunier Duval ThemaFast Condens',
            slug: 'saunier-duval-themafast-condens',
            sku: 'SD-THEMA-001',
            description: 'Chaudière murale à condensation gaz pour chauffage et eau chaude sanitaire.',
            short_description: 'Performance et confort sanitaire immédiat.',
            price: 145000,
            category_id: category.id,
            manufacturer_id: manufacturer.id,
            stock_quantity: 10,
            is_active: true,
            is_featured: true,
            images: [
                { url: 'https://mjchauffage.com/wp-content/uploads/2021/03/ThemaFast-Condens-1.jpg', alt_text: 'ThemaFast Condens Front' }
            ]
        },
        {
            name: 'Saunier Duval ThemaClassic',
            slug: 'saunier-duval-themaclassic',
            sku: 'SD-THEMA-002',
            description: 'Chaudière bas NOx pour raccordement cheminée ou VMC.',
            short_description: 'La référence en chaudière cheminée.',
            price: 98000,
            category_id: category.id,
            manufacturer_id: manufacturer.id,
            stock_quantity: 5,
            is_active: true,
            is_featured: false,
            images: [
                { url: 'https://mjchauffage.com/wp-content/uploads/2021/03/ThemaClassic-1.jpg', alt_text: 'ThemaClassic Front' }
            ]
        }
    ];

    for (const p of products) {
        const { images, ...productData } = p;

        // Insert Product
        const { data: product, error: prodError } = await supabase
            .from('products')
            .upsert(productData, { onConflict: 'slug' })
            .select()
            .single();

        if (prodError) {
            console.error(`❌ Error seeding product ${p.name}:`, prodError);
            continue;
        }

        console.log(`✅ Product seeded: ${product.name}`);

        // Insert Images
        if (images && images.length > 0) {
            const imageInserts = images.map(img => ({
                product_id: product.id,
                url: img.url,
                alt_text: img.alt_text
            }));

            const { error: imgError } = await supabase
                .from('product_images')
                .upsert(imageInserts, { onConflict: 'id' }); // Note: This might duplicate if we don't have a unique constraint on url/product_id, but good enough for seeding

            if (imgError) console.error(`❌ Error seeding images for ${p.name}:`, imgError);
            else console.log(`   📸 Images linked.`);
        }
    }
}

seedProducts();
