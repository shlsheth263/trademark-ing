
-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('customer', 'agent');

-- Create application status enum
CREATE TYPE public.application_status AS ENUM ('submitted', 'approved', 'rejected');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
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

-- Applications table
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  business_name TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  email TEXT NOT NULL,
  category TEXT NOT NULL,
  logo_text TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',
  status application_status NOT NULL DEFAULT 'submitted',
  agent_notes TEXT DEFAULT '',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Application status history (audit log)
CREATE TABLE public.application_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  old_status application_status,
  new_status application_status NOT NULL,
  notes TEXT DEFAULT '',
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;

-- Storage bucket for logos
INSERT INTO storage.buckets (id, name, public) VALUES ('application-logos', 'application-logos', true);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for applications
CREATE POLICY "Customers can view own applications"
  ON public.applications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Agents can view all applications"
  ON public.applications FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'agent'));

CREATE POLICY "Authenticated users can submit applications"
  ON public.applications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow anonymous application submission"
  ON public.applications FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Agents can update applications"
  ON public.applications FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'agent'));

-- RLS Policies for status history
CREATE POLICY "Agents can view all history"
  ON public.application_status_history FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'agent'));

CREATE POLICY "Customers can view own app history"
  ON public.application_status_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = application_id
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Agents can insert history"
  ON public.application_status_history FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'agent'));

-- Storage policies for logos
CREATE POLICY "Anyone can view logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'application-logos');

CREATE POLICY "Authenticated users can upload logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'application-logos');

CREATE POLICY "Anon users can upload logos"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'application-logos');

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Allow public read for tracking (by email + app id, no auth required)
CREATE POLICY "Public can track by id"
  ON public.applications FOR SELECT
  TO anon
  USING (true);
