-- Migration to enhance portfolio items
ALTER TABLE public.portfolio_items
  ADD COLUMN IF NOT EXISTS role TEXT,
  ADD COLUMN IF NOT EXISTS skills_deliverables TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS external_link TEXT,
  ADD COLUMN IF NOT EXISTS file_url TEXT,
  ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'image',
  ADD COLUMN IF NOT EXISTS project_data JSONB DEFAULT '[]'::jsonb;

-- Ensure profiles has avatar_url (it should already, but being safe)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;
