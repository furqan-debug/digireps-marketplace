
-- Projects table
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.service_categories(id),
  title text NOT NULL,
  description text NOT NULL,
  budget numeric NOT NULL CHECK (budget >= 100),
  deadline timestamptz,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_projects_client ON public.projects(client_id);
CREATE INDEX idx_projects_category ON public.projects(category_id);
CREATE INDEX idx_projects_status ON public.projects(status);

-- Updated_at trigger
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read open projects
CREATE POLICY "Authenticated can view open projects"
  ON public.projects FOR SELECT TO authenticated
  USING (status = 'open' OR client_id = auth.uid() OR public.is_admin());

-- Clients can insert their own projects
CREATE POLICY "Clients can insert own projects"
  ON public.projects FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid() AND public.has_role(auth.uid(), 'client'));

-- Clients can update their own projects
CREATE POLICY "Clients can update own projects"
  ON public.projects FOR UPDATE TO authenticated
  USING (client_id = auth.uid() OR public.is_admin());

-- Only admin can delete
CREATE POLICY "Admin can delete projects"
  ON public.projects FOR DELETE TO authenticated
  USING (public.is_admin());

-- Project bids table
CREATE TABLE public.project_bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  freelancer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount >= 100),
  message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, freelancer_id)
);

CREATE INDEX idx_bids_project ON public.project_bids(project_id);
CREATE INDEX idx_bids_freelancer ON public.project_bids(freelancer_id);

-- RLS
ALTER TABLE public.project_bids ENABLE ROW LEVEL SECURITY;

-- Project owner, bid owner, and admin can view bids
CREATE POLICY "View bids"
  ON public.project_bids FOR SELECT TO authenticated
  USING (
    freelancer_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_bids.project_id
        AND projects.client_id = auth.uid()
    )
  );

-- Approved freelancers can insert their own bid
CREATE POLICY "Approved freelancers can bid"
  ON public.project_bids FOR INSERT TO authenticated
  WITH CHECK (
    freelancer_id = auth.uid()
    AND public.is_freelancer_approved(auth.uid())
  );

-- No edit/delete except admin
CREATE POLICY "No bid update"
  ON public.project_bids FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "No bid delete"
  ON public.project_bids FOR DELETE TO authenticated
  USING (public.is_admin());
