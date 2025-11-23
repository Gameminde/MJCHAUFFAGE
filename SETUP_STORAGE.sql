-- Enable the storage extension if not already enabled (usually enabled by default)
-- CREATE EXTENSION IF NOT EXISTS "storage";

-- Create a public storage bucket for products
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Set up access policies for the products bucket

-- 1. Allow public read access to everyone
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'products' );

-- 2. Allow authenticated users (admins) to upload images
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'products' );

-- 3. Allow authenticated users to update their images
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'products' );

-- 4. Allow authenticated users to delete their images
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'products' );
