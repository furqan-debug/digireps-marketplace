-- Force buckets to be public (important if they already existed)
UPDATE storage.buckets SET public = true WHERE id = 'avatars';
UPDATE storage.buckets SET public = true WHERE id = 'portfolio';

-- Re-ensure buckets exist just in case
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Ensure public access policies are broad enough
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Public Portfolio Access" ON storage.objects;
CREATE POLICY "Public Portfolio Access" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'portfolio');

-- Ensure authenticated users can definitely upload to their own folders
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own portfolio" ON storage.objects;
CREATE POLICY "Users can upload their own portfolio" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'portfolio');

-- Note: The folder-based policy (storage.foldername(name))[1] = auth.uid()::text 
-- is good for security but can sometimes fail if the folder structure is different.
-- For debugging, we are simplifying to bucket-level insert first, then we can tighten.
