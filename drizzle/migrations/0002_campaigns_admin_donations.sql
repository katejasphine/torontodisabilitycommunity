-- Roles
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Organizer becomes admin only once her email address is verified
CREATE OR REPLACE FUNCTION public.grant_admin_for_organizer()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND lower(NEW.email) = 'katejasphine@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.grant_admin_for_organizer() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER on_auth_user_created_grant_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.grant_admin_for_organizer();

CREATE TRIGGER on_auth_user_confirmed_grant_admin
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.grant_admin_for_organizer();

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users
WHERE lower(email) = 'katejasphine@gmail.com' AND email_confirmed_at IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Campaigns
CREATE TYPE public.campaign_status AS ENUM ('draft', 'published', 'closed');

CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND char_length(slug) <= 80),
  title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 160),
  beneficiary_display_name text NOT NULL CHECK (char_length(btrim(beneficiary_display_name)) BETWEEN 1 AND 80),
  category public.assistance_type NOT NULL,
  story text NOT NULL CHECK (char_length(btrim(story)) BETWEEN 1 AND 8000),
  campaign_message text CHECK (campaign_message IS NULL OR char_length(campaign_message) <= 500),
  goal_cad numeric(12,2) NOT NULL CHECK (goal_cad > 0 AND goal_cad <= 1000000),
  status public.campaign_status NOT NULL DEFAULT 'draft',
  photo_path text,
  photo_alt text CHECK (photo_alt IS NULL OR char_length(photo_alt) <= 300),
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.campaigns TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO authenticated;
GRANT ALL ON public.campaigns TO service_role;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published campaigns are public" ON public.campaigns
  FOR SELECT TO anon, authenticated USING (status IN ('published', 'closed'));
CREATE POLICY "Admins manage campaigns" ON public.campaigns
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.campaign_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  label text NOT NULL CHECK (char_length(btrim(label)) BETWEEN 1 AND 120),
  amount_cad numeric(12,2) NOT NULL CHECK (amount_cad > 0),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX campaign_allocations_campaign_idx ON public.campaign_allocations(campaign_id);
GRANT SELECT ON public.campaign_allocations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaign_allocations TO authenticated;
GRANT ALL ON public.campaign_allocations TO service_role;
ALTER TABLE public.campaign_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allocations of published campaigns are public" ON public.campaign_allocations
  FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id AND c.status IN ('published', 'closed')));
CREATE POLICY "Admins manage allocations" ON public.campaign_allocations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Private beneficiary verification and consent (admins only)
CREATE TABLE public.campaign_verifications (
  campaign_id uuid PRIMARY KEY REFERENCES public.campaigns(id) ON DELETE CASCADE,
  legal_name text CHECK (legal_name IS NULL OR char_length(legal_name) <= 160),
  contact_email text CHECK (contact_email IS NULL OR char_length(contact_email) <= 255),
  contact_phone text CHECK (contact_phone IS NULL OR char_length(contact_phone) <= 40),
  identity_verified boolean NOT NULL DEFAULT false,
  verification_method text CHECK (verification_method IS NULL OR char_length(verification_method) <= 300),
  verification_notes text CHECK (verification_notes IS NULL OR char_length(verification_notes) <= 4000),
  consent_given boolean NOT NULL DEFAULT false,
  consent_date date,
  consent_scope text CHECK (consent_scope IS NULL OR char_length(consent_scope) <= 1000),
  verified_by uuid,
  verified_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaign_verifications TO authenticated;
GRANT ALL ON public.campaign_verifications TO service_role;
ALTER TABLE public.campaign_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage verifications" ON public.campaign_verifications
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TYPE public.campaign_document_kind AS ENUM ('consent_form', 'identity', 'quote_or_invoice', 'assessment', 'other');

CREATE TABLE public.campaign_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  kind public.campaign_document_kind NOT NULL,
  file_path text NOT NULL UNIQUE,
  file_name text NOT NULL CHECK (char_length(file_name) BETWEEN 1 AND 255),
  uploaded_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX campaign_documents_campaign_idx ON public.campaign_documents(campaign_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaign_documents TO authenticated;
GRANT ALL ON public.campaign_documents TO service_role;
ALTER TABLE public.campaign_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage campaign documents" ON public.campaign_documents
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Donation records: written only by trusted server code after the payment provider confirms
CREATE TYPE public.donation_status AS ENUM ('pending', 'completed', 'refunded', 'failed');

CREATE TABLE public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE RESTRICT,
  amount_cad numeric(12,2) NOT NULL CHECK (amount_cad > 0),
  currency text NOT NULL DEFAULT 'CAD' CHECK (currency = 'CAD'),
  status public.donation_status NOT NULL DEFAULT 'pending',
  environment text NOT NULL DEFAULT 'sandbox' CHECK (environment IN ('sandbox', 'live')),
  provider text NOT NULL DEFAULT 'stripe',
  provider_payment_id text UNIQUE,
  donor_display_name text CHECK (donor_display_name IS NULL OR char_length(donor_display_name) <= 80),
  is_anonymous boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
CREATE INDEX donations_campaign_idx ON public.donations(campaign_id);
GRANT SELECT ON public.donations TO authenticated;
GRANT ALL ON public.donations TO service_role;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view donations" ON public.donations
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Public progress: only completed live payments count
CREATE OR REPLACE FUNCTION public.get_campaign_progress()
RETURNS TABLE (campaign_id uuid, raised_cad numeric, donation_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT c.id,
         COALESCE(SUM(d.amount_cad) FILTER (WHERE d.status = 'completed' AND d.environment = 'live'), 0),
         COUNT(d.id) FILTER (WHERE d.status = 'completed' AND d.environment = 'live')
  FROM public.campaigns c
  LEFT JOIN public.donations d ON d.campaign_id = c.id
  WHERE c.status IN ('published', 'closed')
  GROUP BY c.id
$$;
REVOKE EXECUTE ON FUNCTION public.get_campaign_progress() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_campaign_progress() TO anon, authenticated, service_role;

-- Publishing rules: verified identity, documented consent, consent form on file, allocations = goal
CREATE OR REPLACE FUNCTION public.enforce_campaign_publish_rules()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v public.campaign_verifications%ROWTYPE;
  alloc_total numeric;
  consent_docs integer;
BEGIN
  NEW.updated_at := now();
  IF NEW.status = 'published' THEN
    SELECT * INTO v FROM public.campaign_verifications WHERE campaign_id = NEW.id;
    IF NOT FOUND OR NOT v.identity_verified OR v.verified_at IS NULL THEN
      RAISE EXCEPTION 'The beneficiary''s identity must be verified before publishing.';
    END IF;
    IF NOT v.consent_given OR v.consent_date IS NULL THEN
      RAISE EXCEPTION 'Documented beneficiary consent (with date) is required before publishing.';
    END IF;
    SELECT count(*) INTO consent_docs FROM public.campaign_documents
      WHERE campaign_id = NEW.id AND kind = 'consent_form';
    IF consent_docs = 0 THEN
      RAISE EXCEPTION 'Upload the signed consent form before publishing.';
    END IF;
    SELECT COALESCE(SUM(amount_cad), 0) INTO alloc_total FROM public.campaign_allocations
      WHERE campaign_id = NEW.id;
    IF alloc_total <> NEW.goal_cad THEN
      RAISE EXCEPTION 'The proposed use of funds must add up exactly to the fundraising goal.';
    END IF;
    IF NEW.published_at IS NULL THEN
      NEW.published_at := now();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.enforce_campaign_publish_rules() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER campaigns_enforce_publish_rules
  BEFORE INSERT OR UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.enforce_campaign_publish_rules();

-- Storage: both buckets are private
CREATE POLICY "Admins manage campaign photos" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'campaign-photos' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'campaign-photos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Photos of published campaigns are viewable" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (
    bucket_id = 'campaign-photos'
    AND EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.photo_path = storage.objects.name AND c.status IN ('published', 'closed')
    )
  );

CREATE POLICY "Admins manage campaign documents" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'campaign-documents' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'campaign-documents' AND public.has_role(auth.uid(), 'admin'));