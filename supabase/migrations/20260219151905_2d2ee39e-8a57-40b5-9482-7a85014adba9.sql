
-- Create portfolio storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('portfolio', 'portfolio', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

-- RLS: Anyone can view portfolio images (they're public)
CREATE POLICY "Public portfolio images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio');

-- RLS: Only approved freelancers can upload to their own folder
CREATE POLICY "Freelancers can upload portfolio"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'portfolio'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS: Freelancers can delete their own uploads
CREATE POLICY "Freelancers can delete own portfolio"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'portfolio'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
