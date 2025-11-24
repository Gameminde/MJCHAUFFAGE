-- Add min_stock column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS min_stock INTEGER DEFAULT 5;

-- Update existing records to have default value if null (though DEFAULT handles new inserts)
UPDATE public.products 
SET min_stock = 5 
WHERE min_stock IS NULL;

-- Create index for performance on low stock queries
CREATE INDEX IF NOT EXISTS idx_products_min_stock ON public.products(min_stock);
