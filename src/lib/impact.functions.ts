import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { buildImpactSummary, type ImpactSummary } from "./impact";

/** Live impact figures: published campaigns, approved requests and confirmed live payments. */
export const getImpactSummary = createServerFn({ method: "GET" }).handler(async (): Promise<ImpactSummary> => {
  const { publicClient } = await import("./supabase-public.server");
  const { data, error } = await publicClient().rpc("get_impact_stats");
  if (error) throw new Error(`Couldn't load impact figures: ${error.message}`);
  const row = data?.[0];
  return buildImpactSummary({
    active_campaigns: Number(row?.active_campaigns ?? 0),
    approved_requests: Number(row?.approved_requests ?? 0),
    online_raised_cad: Number(row?.online_raised_cad ?? 0),
    online_donation_count: Number(row?.online_donation_count ?? 0),
    general_fund_raised_cad: Number(row?.general_fund_raised_cad ?? 0),
    general_fund_donation_count: Number(row?.general_fund_donation_count ?? 0),
  });
});

export const impactQuery = () =>
  queryOptions({ queryKey: ["impact"], queryFn: () => getImpactSummary(), staleTime: 60_000 });
