CREATE OR REPLACE FUNCTION public.get_impact_stats()
RETURNS TABLE(
  active_campaigns bigint,
  approved_requests bigint,
  online_raised_cad numeric,
  online_donation_count bigint,
  general_fund_raised_cad numeric,
  general_fund_donation_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    (SELECT COUNT(*) FROM public.campaigns WHERE status = 'published'),
    (SELECT COUNT(*) FROM public.assistance_requests WHERE status = 'approved'),
    (SELECT COALESCE(SUM(amount_cad), 0) FROM public.donations WHERE status = 'completed' AND environment = 'live'),
    (SELECT COUNT(*) FROM public.donations WHERE status = 'completed' AND environment = 'live'),
    (SELECT COALESCE(SUM(amount_cad), 0) FROM public.donations WHERE status = 'completed' AND environment = 'live' AND campaign_id IS NULL),
    (SELECT COUNT(*) FROM public.donations WHERE status = 'completed' AND environment = 'live' AND campaign_id IS NULL)
$$;

REVOKE ALL ON FUNCTION public.get_impact_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_impact_stats() TO anon, authenticated, service_role;