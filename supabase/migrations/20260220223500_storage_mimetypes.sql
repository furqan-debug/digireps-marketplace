-- Ensure the portfolio bucket allows PDFs and other common files
-- Setting allowed_mime_types to NULL allows all types
UPDATE storage.buckets 
SET allowed_mime_types = NULL 
WHERE id = 'portfolio';

-- Also ensure avatars allows all image types just in case
UPDATE storage.buckets
SET allowed_mime_types = '{image/*}'
WHERE id = 'avatars';
