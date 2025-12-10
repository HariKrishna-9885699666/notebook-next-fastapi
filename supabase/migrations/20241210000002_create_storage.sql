-- Create storage bucket for note images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'note-images',
    'note-images',
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS policies
-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload images to their folder"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'note-images' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Allow authenticated users to view their own images
CREATE POLICY "Users can view their own images"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'note-images' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Allow public read access to images (for displaying in notes)
CREATE POLICY "Public can view images"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'note-images');

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete their own images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'note-images' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Allow authenticated users to update their own images
CREATE POLICY "Users can update their own images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'note-images' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );
