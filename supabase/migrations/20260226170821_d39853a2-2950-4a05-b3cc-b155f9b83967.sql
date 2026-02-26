-- Step 1: Performance indexes on foreign keys
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON public.orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_freelancer_id ON public.orders(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_orders_category_id ON public.orders(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

CREATE INDEX IF NOT EXISTS idx_messages_order_id ON public.messages(order_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_ratings_reviewee_id ON public.ratings(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_ratings_reviewer_id ON public.ratings(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_ratings_order_id ON public.ratings(order_id);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_violations_user_id ON public.violations(user_id);
CREATE INDEX IF NOT EXISTS idx_violations_order_id ON public.violations(order_id);

CREATE INDEX IF NOT EXISTS idx_freelancer_services_freelancer_id ON public.freelancer_services(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_freelancer_services_category_id ON public.freelancer_services(category_id);

CREATE INDEX IF NOT EXISTS idx_portfolio_items_freelancer_id ON public.portfolio_items(freelancer_id);

-- Step 2: Add is_read to messages
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false;

-- Step 3: Create order_milestones table
CREATE TABLE IF NOT EXISTS public.order_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  title text NOT NULL,
  amount numeric NOT NULL,
  due_date timestamptz,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.order_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants and admin can view milestones"
  ON public.order_milestones FOR SELECT
  USING (is_order_participant(order_id) OR is_admin());

CREATE POLICY "Clients can create milestones"
  ON public.order_milestones FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_id AND client_id = auth.uid()
    ) OR is_admin()
  );

CREATE POLICY "Participants can update milestones"
  ON public.order_milestones FOR UPDATE
  USING (is_order_participant(order_id) OR is_admin());

CREATE POLICY "No milestone delete"
  ON public.order_milestones FOR DELETE
  USING (is_admin());

-- Step 4: Create disputes table
CREATE TABLE IF NOT EXISTS public.disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  opened_by uuid NOT NULL,
  reason text NOT NULL,
  admin_resolution text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants and admin can view disputes"
  ON public.disputes FOR SELECT
  USING (is_order_participant(order_id) OR is_admin());

CREATE POLICY "Participants can open disputes"
  ON public.disputes FOR INSERT
  WITH CHECK (
    opened_by = auth.uid() AND is_order_participant(order_id)
  );

CREATE POLICY "Admin can update disputes"
  ON public.disputes FOR UPDATE
  USING (is_admin());

CREATE POLICY "No dispute delete"
  ON public.disputes FOR DELETE
  USING (is_admin());

-- Step 5: Create platform_settings table
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_rate numeric NOT NULL DEFAULT 10.00,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read platform settings"
  ON public.platform_settings FOR SELECT
  USING (true);

CREATE POLICY "Admin can update platform settings"
  ON public.platform_settings FOR UPDATE
  USING (is_admin());

CREATE POLICY "No settings insert"
  ON public.platform_settings FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "No settings delete"
  ON public.platform_settings FOR DELETE
  USING (false);

-- Seed default settings row
INSERT INTO public.platform_settings (commission_rate) VALUES (10.00);

-- Commission copy trigger: on order INSERT, copy commission from platform_settings
CREATE OR REPLACE FUNCTION public.set_order_commission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  SELECT commission_rate INTO NEW.commission_rate
  FROM public.platform_settings
  LIMIT 1;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_set_order_commission
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_order_commission();