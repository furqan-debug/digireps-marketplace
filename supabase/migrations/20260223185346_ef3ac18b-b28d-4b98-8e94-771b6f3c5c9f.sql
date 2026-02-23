
CREATE OR REPLACE FUNCTION public.protect_admin_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- If caller is NOT admin, protect admin-controlled fields
  IF NOT public.is_admin() THEN
    -- Allow freelancers to submit their OWN profile (set status to 'submitted')
    -- only when current status is NULL, 'draft', or 'revision_required'
    IF NEW.application_status IS DISTINCT FROM OLD.application_status THEN
      IF NEW.application_status = 'submitted'
         AND NEW.user_id = auth.uid()
         AND (OLD.application_status IS NULL
              OR OLD.application_status = 'draft'
              OR OLD.application_status = 'revision_required') THEN
        -- Allow this specific transition
        NULL;
      ELSE
        -- Block all other status changes
        NEW.application_status := OLD.application_status;
      END IF;
    END IF;

    -- Always block non-admin changes to these fields
    NEW.is_suspended := OLD.is_suspended;
    NEW.freelancer_level := OLD.freelancer_level;
    NEW.admin_feedback := OLD.admin_feedback;
  END IF;
  RETURN NEW;
END;
$function$;
