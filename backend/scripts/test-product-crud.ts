import { PrismaClient } from '@prisma/client';
import { ProductService } from './src/services/productService';

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  console.log('🔌 Testing database connection...');
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test basic query
    const userCount = await prisma.user.count();
    console.log(`📊 Users in database: ${userCount}`);
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

async function createSampleData() {
  console.log('📝 Creating sample data...');
  
  try {
    // Create a manufacturer
    const manufacturer = await prisma.manufacturer.upsert({
      where: { slug: 'test-manufacturer' },
      update: {},
      create: {
        name: 'Test Manufacturer',
        slug: 'test-manufacturer',
        description: 'Test manufacturer for API testing',
        isActive: true,
      },
    });
    console.log('✅ Manufacturer created:', manufacturer.name);

    // Create a category
    const category = await prisma.category.upsert({
      where: { slug: 'test-category' },
      update: {},
      create: {
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test category for API testing',
        isActive: true,
      },
    });
    console.log('✅ Category created:', category.name);

    // Create a test product
    const product = await prisma.product.upsert({
      where: { slug: 'test-product-api' },
      update: {},
      create: {
        name: 'Test Product for API',
        slug: 'test-product-api',
        sku: 'TEST-API-001',
        description: 'This is a test product for API validation',
        shortDescription: 'Test product for API',
        categoryId: category.id,
        manufacturerId: manufacturer.id,
        price: 299.99,
        costPrice: 199.99,
        stockQuantity: 50,
        minStock: 10,
        weight: 5.5,
        dimensions: { length: 30, width: 20, height: 15 },
        specifications: {
          material: 'Steel',
          warranty: '2 years',
          color: 'White',
        },
        features: ['Durable', 'Energy efficient', 'Easy installation'],
        isActive: true,
        isFeatured: true,
      },
    });
    console.log('✅ Product created:', product.name);

    return { manufacturer, category, product };
  } catch (error) {
    console.error('❌ Failed to create sample data:', error);
    throw error;
  }
}

async function testProductCRUD() {
  console.log('\n🧪 Testing Product CRUD Operations...\n');

  try {
    // Test 1: Get all products
    console.log('1. Testing getProducts()');
    const productsResult = await ProductService.getProducts(
      {},
      { page: 1, limit: 10 },
      { field: 'createdAt', order: 'desc' }
    );
    console.log('✅ getProducts() - Success');
    console.log(`   Found ${productsResult.products.length} products`);
    console.log(`   Total: ${productsResult.pagination.total}`);

    // Test 2: Get categories
    console.log('\n2. Testing getCategories()');
    const categories = await ProductService.getCategories(true);
    console.log('✅ getCategories() - Success');
    console.log(`   Found ${categories.length} categories`);

    // Test 3: Get manufacturers
    console.log('\n3. Testing getManufacturers()');
    const manufacturers = await ProductService.getManufacturers();
    console.log('✅ getManufacturers() - Success');
    console.log(`   Found ${manufacturers.length} manufacturers`);

    // Test 4: Get featured products
    console.log('\n4. Testing getFeaturedProducts()');
    const featuredProducts = await ProductService.getFeaturedProducts(5);
    console.log('✅ getFeaturedProducts() - Success');
    console.log(`   Found ${featuredProducts.length} featured products`);

    // Test 5: Search products
    console.log('\n5. Testing searchProducts()');
    const searchResults = await ProductService.searchProducts('test', 5);
    console.log('✅ searchProducts() - Success');
    console.log(`   Found ${searchResults.length} search results`);

    // Test 6: Get product by ID (if we have products)
    if (productsResult.products.length > 0) {
      console.log('\n6. Testing getProductById()');
      const firstProduct = productsResult.products[0];
      const productDetail = await ProductService.getProductById(firstProduct.id, true);
      console.log('✅ getProductById() - Success');
      console.log(`   Product: ${productDetail?.name}`);
      console.log(`   Related products: ${productDetail?.relatedProducts?.length || 0}`);
    }

    // Test 7: Create a new product
    console.log('\n7. Testing createProduct()');
    const newProductData = {
      name: 'API Test Product New',
      slug: 'api-test-product-new',
      sku: 'API-TEST-NEW-001',
      description: 'New product created via API test',
      categoryId: categories[0]?.id || '',
      manufacturerId: manufacturers[0]?.id || '',
      price: 199.99,
      stockQuantity: 25,
      isActive: true,
    };

    if (newProductData.categoryId && newProductData.manufacturerId) {
      const newProduct = await ProductService.createProduct(newProductData);
      console.log('✅ createProduct() - Success');
      console.log(`   Created: ${newProduct.name}`);

      // Test 8: Update the product
      console.log('\n8. Testing updateProduct()');
      const updatedProduct = await ProductService.updateProduct(newProduct.id, {
        price: 249.99,
        stockQuantity: 30,
        isFeatured: true,
      });
      console.log('✅ updateProduct() - Success');
      console.log(`   Updated price: ${updatedProduct?.price}`);

      // Test 9: Update inventory
      console.log('\n9. Testing updateInventory()');
      const inventoryResult = await ProductService.updateInventory(
        newProduct.id,
        10,
        'STOCK_IN',
        'API test stock increase'
      );
      console.log('✅ updateInventory() - Success');
      console.log(`   New quantity: ${inventoryResult?.newQuantity}`);

      // Test 10: Delete product (soft delete)
      console.log('\n10. Testing deleteProduct()');
      const deleteResult = await ProductService.deleteProduct(newProduct.id);
      console.log('✅ deleteProduct() - Success');
      console.log(`   Deleted: ${deleteResult}`);
    } else {
      console.log('⚠️  Skipping create/update/delete tests - no categories or manufacturers found');
    }

    console.log('\n🎉 All Product CRUD tests completed successfully!');

  } catch (error) {
    console.error('❌ Product CRUD test failed:', error);
    throw error;
  }
}

async function main() {
  try {
    // Test database connection
    const isConnected = await testDatabaseConnection();
    if (!isConnected) {
      console.log('❌ Cannot proceed without database connection');
      return;
    }

    // Create sample data if needed
    await createSampleData();

    // Test product CRUD operations
    await testProductCRUD();

  } catch (error) {
    console.error('❌ Test suite failed:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database disconnected');
  }
}

main();