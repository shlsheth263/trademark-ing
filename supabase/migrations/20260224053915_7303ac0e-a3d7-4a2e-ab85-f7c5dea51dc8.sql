
-- Create storage bucket for trademark reference images
INSERT INTO storage.buckets (id, name, public)
VALUES ('trademark-images', 'trademark-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public read access for trademark images"
ON storage.objects FOR SELECT
USING (bucket_id = 'trademark-images');

-- Allow authenticated users (agents) to upload
CREATE POLICY "Authenticated users can upload trademark images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'trademark-images' AND auth.role() = 'authenticated');
