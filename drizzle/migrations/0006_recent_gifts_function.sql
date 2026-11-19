CREATE OR REPLACE FUNCTION public.get_recent_gifts(_limit integer DEFAULT 50)
RETURNS TABLE(amount_cad numeric, completed_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT d.amount_cad, d.completed_at
  FROM public.donations d
  WHERE d.status = 'completed' AND d.environment = 'live' AND d.completed_at IS NOT NULL
  ORDER BY d.completed_at DESC
  LIMIT LEAST(GREATEST(COALESCE(_limit, 50), 1), 100)
$$;
REVOKE ALL ON FUNCTION public.get_recent_gifts(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_recent_gifts(integer) TO anon, authenticated, service_role;