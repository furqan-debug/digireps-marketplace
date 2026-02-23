
-- 1.1 Extend application_status enum with new values
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'draft';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'submitted';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'under_review';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'revision_required';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'suspended';

-- 1.2 New columns on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS work_experience jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS education jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS languages jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS availability_status text DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS preferred_pricing_model text,
  ADD COLUMN IF NOT EXISTS response_time_expectation text,
  ADD COLUMN IF NOT EXISTS admin_feedback text,
  ADD COLUMN IF NOT EXISTS profile_completion_score integer DEFAULT 0;

-- 1.3 Admin field protection trigger
-- Prevents non-admin users from modifying sensitive fields
CREATE OR REPLACE FUNCTION public.protect_admin_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- If caller is NOT admin, reset admin-controlled fields to their old values
  IF NOT public.is_admin() THEN
    NEW.application_status := OLD.application_status;
    NEW.is_suspended := OLD.is_suspended;
    NEW.freelancer_level := OLD.freelancer_level;
    NEW.admin_feedback := OLD.admin_feedback;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_admin_fields_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_admin_fields();

-- 1.4 Profile completeness function
CREATE OR REPLACE FUNCTION public.calculate_profile_completeness(p public.profiles)
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  score integer := 0;
  portfolio_count integer;
BEGIN
  -- display_name filled (10 pts)
  IF p.display_name IS NOT NULL AND p.display_name <> '' THEN
    score := score + 10;
  END IF;

  -- avatar_url filled (10 pts)
  IF p.avatar_url IS NOT NULL AND p.avatar_url <> '' THEN
    score := score + 10;
  END IF;

  -- bio >= 50 chars (15 pts)
  IF p.bio IS NOT NULL AND length(p.bio) >= 50 THEN
    score := score + 15;
  END IF;

  -- headline filled (5 pts)
  IF p.headline IS NOT NULL AND p.headline <> '' THEN
    score := score + 5;
  END IF;

  -- skills >= 3 items (15 pts)
  IF p.skills IS NOT NULL AND array_length(p.skills, 1) >= 3 THEN
    score := score + 15;
  END IF;

  -- At least 1 work_experience entry (15 pts)
  IF p.work_experience IS NOT NULL AND jsonb_array_length(p.work_experience) > 0 THEN
    score := score + 15;
  END IF;

  -- At least 1 education entry (5 pts)
  IF p.education IS NOT NULL AND jsonb_array_length(p.education) > 0 THEN
    score := score + 5;
  END IF;

  -- At least 1 language entry (5 pts)
  IF p.languages IS NOT NULL AND jsonb_array_length(p.languages) > 0 THEN
    score := score + 5;
  END IF;

  -- At least 1 certification entry (5 pts)
  IF p.certifications IS NOT NULL AND jsonb_array_length(p.certifications) > 0 THEN
    score := score + 5;
  END IF;

  -- At least 1 portfolio item (15 pts)
  SELECT count(*) INTO portfolio_count
  FROM public.portfolio_items
  WHERE freelancer_id = p.user_id;

  IF portfolio_count > 0 THEN
    score := score + 15;
  END IF;

  RETURN score;
END;
$$;

-- 1.4b Trigger to auto-calculate profile completeness on insert/update
CREATE OR REPLACE FUNCTION public.update_profile_completeness()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.profile_completion_score := public.calculate_profile_completeness(NEW);
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profile_completeness_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_completeness();
