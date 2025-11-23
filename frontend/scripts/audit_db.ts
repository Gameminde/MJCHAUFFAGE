
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jqrwunmxblzebmvmugju.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function audit() {
  console.log('🔍 Starting Supabase Audit...\n');

  // 1. Check Tables Existence
  console.log('📊 Checking Tables...');
  const { data: tables, error: tablesError } = await supabase
    .from('products')
    .select('count')
    .limit(1)
    .single(); // Just to check if connection works and table exists
  
  if (tablesError) {
    console.error('❌ Error accessing database:', tablesError.message);
    return;
  }
  console.log('✅ Database connection successful.\n');

  // 2. Check Storage Buckets
  console.log('🗄️ Checking Storage Buckets...');
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  if (bucketsError) {
    console.error('❌ Error listing buckets:', bucketsError.message);
  } else {
    console.log('Found Buckets:', buckets.map(b => b.name).join(', '));
  }

  const productsBucket = buckets?.find(b => b.name === 'products');
  let storageFiles = [];
  
  if (productsBucket) {
    const { data: files, error: filesError } = await supabase.storage.from('products').list();
    if (filesError) {
      console.error('❌ Error listing files in "products" bucket:', filesError.message);
    } else {
      storageFiles = files || [];
      console.log(`✅ Found ${storageFiles.length} files in "products" bucket:`);
      storageFiles.forEach(f => console.log(`   - ${f.name}`));
    }
  } else {
    console.warn('⚠️ "products" bucket not found! Images might not load.');
  }
  console.log('');

  // 3. Audit Products & Images
  console.log('🖼️ Auditing Product Images...');
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select(`
      id, 
      name, 
      product_images (id, url)
    `);

  if (prodError) {
    console.error('❌ Error fetching products:', prodError.message);
    return;
  }
  
  console.log('Products found:');
  products.forEach(p => {
      console.log(`- [${p.id}] ${p.name} (Images: ${p.product_images?.length || 0})`);
  });

  let totalImages = 0;
  let localhostImages = 0;
  let relativeImages = 0;
  let brokenLinks = 0;
  let fixedCandidates = 0;

  for (const p of products) {
    const images = p.product_images || [];
    totalImages += images.length;

    for (const img of images) {
      // Check for Localhost
      if (img.url.includes('localhost') || img.url.includes('127.0.0.1')) {
        console.log(`⚠️ [Localhost URL] Product "${p.name}": ${img.url}`);
        localhostImages++;
      }
      
      // Check for Relative Paths (which might be valid filenames if in storage)
      else if (!img.url.startsWith('http')) {
        // Assume it's a filename
        relativeImages++;
        
        // Check if it exists in storage
        const cleanName = img.url.replace(/^\/files\//, '').replace(/^\//, '');
        const exists = storageFiles.find(f => f.name === cleanName);
        
        if (!exists) {
          console.log(`❌ [Missing File] Product "${p.name}": "${img.url}" not found in storage bucket.`);
          brokenLinks++;
        } else {
           // It exists in storage but stored as relative path/filename
           // This is actually OK if our frontend handles it, but we can standardize.
        }
      }
    }
  }

  // 4. Audit Customers
  console.log('\n👥 Auditing Customers...');
  const { count: customerCount, error: custError } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true });
    
  if (custError) console.error('❌ Error counting customers:', custError.message);
  else console.log(`- Total Customers: ${customerCount}`);

  // 5. Audit Orders
  console.log('\n📦 Auditing Orders...');
  const { count: orderCount, error: orderError } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });

  if (orderError) console.error('❌ Error counting orders:', orderError.message);
  else console.log(`- Total Orders: ${orderCount}`);

  console.log('\n📋 Summary:');
  console.log(`- Total Products: ${products.length}`);
  console.log(`- Total Images Entries: ${totalImages}`);
  console.log(`- Localhost URLs (Broken): ${localhostImages}`);
  console.log(`- Relative/Filenames: ${relativeImages}`);
  console.log(`- Missing Files in Storage: ${brokenLinks}`);
}

audit().catch(console.error);

