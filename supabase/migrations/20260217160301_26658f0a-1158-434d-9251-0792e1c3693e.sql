
-- =============================================
-- ENUMS
-- =============================================
CREATE TYPE public.app_role AS ENUM ('client', 'freelancer', 'admin');
CREATE TYPE public.freelancer_level AS ENUM ('verified', 'pro', 'elite');
CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.order_status AS ENUM ('pending', 'accepted', 'in_progress', 'delivered', 'completed', 'disputed', 'refunded');
CREATE TYPE public.escrow_status AS ENUM ('none', 'held', 'released', 'refunded');

-- =============================================
-- TABLES
-- =============================================

-- User roles (separate from profiles per security requirements)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT NOT NULL DEFAULT '',
  country TEXT DEFAULT '',
  timezone TEXT DEFAULT '',
  company TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  skills TEXT[] DEFAULT '{}',
  experience_years INT DEFAULT 0,
  hourly_rate NUMERIC(10,2) DEFAULT 0,
  freelancer_level freelancer_level DEFAULT 'verified',
  application_status application_status DEFAULT NULL,
  is_suspended BOOLEAN NOT NULL DEFAULT false,
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Service categories (seeded)
CREATE TABLE public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

-- Freelancer ↔ Service link
CREATE TABLE public.freelancer_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.service_categories(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (freelancer_id, category_id)
);
ALTER TABLE public.freelancer_services ENABLE ROW LEVEL SECURITY;

-- Portfolio items
CREATE TABLE public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  freelancer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.service_categories(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  budget NUMERIC(10,2) NOT NULL,
  deadline TIMESTAMPTZ,
  status order_status NOT NULL DEFAULT 'pending',
  escrow_status escrow_status NOT NULL DEFAULT 'none',
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 10.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Violations
CREATE TABLE public.violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  message_content TEXT DEFAULT '',
  violation_type TEXT NOT NULL DEFAULT 'contact_sharing',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.violations ENABLE ROW LEVEL SECURITY;

-- Ratings
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reviewee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (order_id, reviewer_id)
);
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SECURITY DEFINER FUNCTIONS
-- =============================================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Check if user is admin (shorthand)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- Check if freelancer is approved and not suspended
CREATE OR REPLACE FUNCTION public.is_freelancer_approved(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id
      AND application_status = 'approved'
      AND is_suspended = false
  )
$$;

-- Check if user is participant in an order
CREATE OR REPLACE FUNCTION public.is_order_participant(_order_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.orders
    WHERE id = _order_id
      AND (client_id = auth.uid() OR freelancer_id = auth.uid())
  )
$$;

-- =============================================
-- RLS POLICIES
-- =============================================

-- user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "No direct role insert" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (false);

CREATE POLICY "No direct role update" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (false);

CREATE POLICY "No direct role delete" ON public.user_roles
  FOR DELETE TO authenticated
  USING (false);

-- profiles
CREATE POLICY "Users can view own profile or approved freelancers" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_admin()
    OR (application_status = 'approved' AND is_suspended = false)
  );

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "No profile delete" ON public.profiles
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- service_categories
CREATE POLICY "Anyone can view categories" ON public.service_categories
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admin can manage categories" ON public.service_categories
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- freelancer_services
CREATE POLICY "Anyone can view freelancer services" ON public.freelancer_services
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Freelancers can manage own services" ON public.freelancer_services
  FOR INSERT TO authenticated
  WITH CHECK (freelancer_id = auth.uid() OR public.is_admin());

CREATE POLICY "Freelancers can delete own services" ON public.freelancer_services
  FOR DELETE TO authenticated
  USING (freelancer_id = auth.uid() OR public.is_admin());

-- portfolio_items
CREATE POLICY "View portfolio of approved freelancers or own" ON public.portfolio_items
  FOR SELECT TO authenticated
  USING (
    freelancer_id = auth.uid()
    OR public.is_admin()
    OR public.is_freelancer_approved(freelancer_id)
  );

CREATE POLICY "Freelancers can insert own portfolio" ON public.portfolio_items
  FOR INSERT TO authenticated
  WITH CHECK (freelancer_id = auth.uid() OR public.is_admin());

CREATE POLICY "Freelancers can update own portfolio" ON public.portfolio_items
  FOR UPDATE TO authenticated
  USING (freelancer_id = auth.uid() OR public.is_admin());

CREATE POLICY "Freelancers can delete own portfolio" ON public.portfolio_items
  FOR DELETE TO authenticated
  USING (freelancer_id = auth.uid() OR public.is_admin());

-- orders
CREATE POLICY "View own orders" ON public.orders
  FOR SELECT TO authenticated
  USING (client_id = auth.uid() OR freelancer_id = auth.uid() OR public.is_admin());

CREATE POLICY "Clients can create orders" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid() OR public.is_admin());

CREATE POLICY "Participants can update orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (client_id = auth.uid() OR freelancer_id = auth.uid() OR public.is_admin());

CREATE POLICY "No order delete" ON public.orders
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- messages
CREATE POLICY "View messages for own orders" ON public.messages
  FOR SELECT TO authenticated
  USING (public.is_order_participant(order_id) OR public.is_admin());

CREATE POLICY "Send messages to own orders" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND public.is_order_participant(order_id));

CREATE POLICY "No message edit" ON public.messages
  FOR UPDATE TO authenticated
  USING (false);

CREATE POLICY "No message delete" ON public.messages
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- violations
CREATE POLICY "Admin can view violations" ON public.violations
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "System can insert violations" ON public.violations
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR user_id = auth.uid());

CREATE POLICY "No violation update" ON public.violations
  FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "No violation delete" ON public.violations
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ratings
CREATE POLICY "View ratings" ON public.ratings
  FOR SELECT TO authenticated
  USING (reviewer_id = auth.uid() OR reviewee_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can rate their orders" ON public.ratings
  FOR INSERT TO authenticated
  WITH CHECK (reviewer_id = auth.uid() AND public.is_order_participant(order_id));

CREATE POLICY "No rating edit" ON public.ratings
  FOR UPDATE TO authenticated
  USING (false);

CREATE POLICY "Admin can delete ratings" ON public.ratings
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- =============================================
-- TRIGGERS
-- =============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- AUTO-CREATE PROFILE + ROLE ON SIGNUP
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role app_role;
BEGIN
  -- Determine role from metadata (default to 'client')
  _role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'client'
  );

  -- Prevent self-assignment of admin role
  IF _role = 'admin' THEN
    _role := 'client';
  END IF;

  -- Create profile
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', ''));

  -- Assign role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- SEED SERVICE CATEGORIES
-- =============================================

INSERT INTO public.service_categories (name, description) VALUES
  ('Web Development', 'Full-stack and frontend web development services'),
  ('UI/UX Design', 'User interface and experience design'),
  ('Video Editing', 'Professional video editing and post-production'),
  ('Copywriting', 'Content writing, copywriting, and editing'),
  ('Mobile Development', 'iOS and Android mobile app development');

-- =============================================
-- ENABLE REALTIME FOR MESSAGES
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
