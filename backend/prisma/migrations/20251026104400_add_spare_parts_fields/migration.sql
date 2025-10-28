-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "internal_ref" TEXT,
    "ean" TEXT,
    "description" TEXT,
    "short_description" TEXT,
    "technical_sheet" TEXT,
    "category_id" TEXT NOT NULL,
    "manufacturer_id" TEXT,
    "part_type" TEXT,
    "compatible_models" TEXT,
    "compatible_brands" TEXT,
    "original_part" BOOLEAN NOT NULL DEFAULT true,
    "price" DECIMAL NOT NULL,
    "price_ht" DECIMAL,
    "cost_price" DECIMAL,
    "sale_price" DECIMAL,
    "tax_rate" DECIMAL NOT NULL DEFAULT 19,
    "stock_quantity" INTEGER NOT NULL DEFAULT 0,
    "min_stock" INTEGER NOT NULL DEFAULT 5,
    "max_stock" INTEGER,
    "reorder_point" INTEGER,
    "delivery_delay" INTEGER,
    "supplier" TEXT,
    "weight" DECIMAL,
    "dimensions" TEXT,
    "volume" DECIMAL,
    "specifications" TEXT,
    "features" TEXT,
    "warranty" INTEGER,
    "condition" TEXT NOT NULL DEFAULT 'NEW',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_digital" BOOLEAN NOT NULL DEFAULT false,
    "is_on_sale" BOOLEAN NOT NULL DEFAULT false,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "meta_keywords" TEXT,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "sales_count" INTEGER NOT NULL DEFAULT 0,
    "average_rating" DECIMAL DEFAULT 0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "products_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "manufacturers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_products" ("category_id", "cost_price", "created_at", "description", "dimensions", "features", "id", "is_active", "is_digital", "is_featured", "manufacturer_id", "max_stock", "meta_description", "meta_title", "min_stock", "name", "price", "sale_price", "short_description", "sku", "slug", "specifications", "stock_quantity", "updated_at", "weight") SELECT "category_id", "cost_price", "created_at", "description", "dimensions", "features", "id", "is_active", "is_digital", "is_featured", "manufacturer_id", "max_stock", "meta_description", "meta_title", "min_stock", "name", "price", "sale_price", "short_description", "sku", "slug", "specifications", "stock_quantity", "updated_at", "weight" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");
CREATE UNIQUE INDEX "products_ean_key" ON "products"("ean");
CREATE INDEX "products_sku_idx" ON "products"("sku");
CREATE INDEX "products_category_id_idx" ON "products"("category_id");
CREATE INDEX "products_manufacturer_id_idx" ON "products"("manufacturer_id");
CREATE INDEX "products_part_type_idx" ON "products"("part_type");
CREATE INDEX "products_price_idx" ON "products"("price");
CREATE INDEX "products_stock_quantity_idx" ON "products"("stock_quantity");
CREATE INDEX "products_is_active_idx" ON "products"("is_active");
CREATE INDEX "products_is_featured_idx" ON "products"("is_featured");
CREATE INDEX "products_is_on_sale_idx" ON "products"("is_on_sale");
CREATE INDEX "products_created_at_idx" ON "products"("created_at");
CREATE INDEX "products_average_rating_idx" ON "products"("average_rating");
CREATE INDEX "products_sales_count_idx" ON "products"("sales_count");
CREATE INDEX "products_category_id_is_active_stock_quantity_idx" ON "products"("category_id", "is_active", "stock_quantity");
CREATE INDEX "products_manufacturer_id_is_active_price_idx" ON "products"("manufacturer_id", "is_active", "price");
CREATE INDEX "products_is_active_is_featured_stock_quantity_idx" ON "products"("is_active", "is_featured", "stock_quantity");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "cart_items_customer_id_idx" ON "cart_items"("customer_id");

-- CreateIndex
CREATE INDEX "cart_items_product_id_idx" ON "cart_items"("product_id");
