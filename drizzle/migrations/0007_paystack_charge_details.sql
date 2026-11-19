ALTER TABLE public.donations
  ADD COLUMN charge_currency text CHECK (charge_currency IS NULL OR charge_currency IN ('NGN', 'USD')),
  ADD COLUMN charge_amount_minor bigint CHECK (charge_amount_minor IS NULL OR charge_amount_minor > 0),
  ADD COLUMN fx_rate_per_cad numeric(18,8) CHECK (fx_rate_per_cad IS NULL OR fx_rate_per_cad > 0),
  ADD COLUMN fx_rate_date timestamptz,
  ADD COLUMN donor_message text CHECK (donor_message IS NULL OR char_length(donor_message) <= 500);
ALTER TABLE public.donations ALTER COLUMN provider SET DEFAULT 'paystack';
CREATE INDEX IF NOT EXISTS donations_status_env_idx ON public.donations(status, environment, completed_at DESC);