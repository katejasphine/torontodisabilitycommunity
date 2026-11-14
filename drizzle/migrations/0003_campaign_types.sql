CREATE TYPE public.campaign_kind AS ENUM ('individual', 'community_appeal');

ALTER TABLE public.campaigns
  ADD COLUMN kind public.campaign_kind NOT NULL DEFAULT 'individual';

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
    -- Individual campaigns tell one person's story: identity and consent must be on file
    IF NEW.kind = 'individual' THEN
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