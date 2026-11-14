CREATE TYPE public.assistance_type AS ENUM (
  'mobility_equipment','wheelchairs_assistive_devices','accessible_transportation',
  'housing_accessibility','essential_living_expenses','daily_support','other'
);

CREATE TABLE public.assistance_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 1 AND 120),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 255),
  general_location text NOT NULL CHECK (char_length(general_location) BETWEEN 1 AND 120),
  assistance_type public.assistance_type NOT NULL,
  circumstances text NOT NULL CHECK (char_length(circumstances) BETWEEN 20 AND 4000),
  estimated_need_cad numeric(10,2) CHECK (estimated_need_cad IS NULL OR (estimated_need_cad >= 0 AND estimated_need_cad <= 1000000)),
  consent_given boolean NOT NULL CHECK (consent_given = true),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','flagged')),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.assistance_requests TO anon, authenticated;
GRANT ALL ON public.assistance_requests TO service_role;
ALTER TABLE public.assistance_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit an assistance request"
  ON public.assistance_requests FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending' AND consent_given = true);

CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 255),
  subject text NOT NULL CHECK (char_length(subject) BETWEEN 1 AND 200),
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 4000),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can send a contact message"
  ON public.contact_messages FOR INSERT TO anon, authenticated
  WITH CHECK (true);