-- Relax project insertion RLS policy so freelancers can also post projects
DROP POLICY IF EXISTS "Clients can insert own projects" ON public.projects;

CREATE POLICY "Users can insert own projects"
  ON public.projects FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid());
