import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export type PublicCampaign = {
  id: string;
  slug: string;
  title: string;
  kind: Database["public"]["Enums"]["campaign_kind"];
  status: Database["public"]["Enums"]["campaign_status"];
  beneficiary_display_name: string;
  category: string;
  story: string;
  campaign_message: string | null;
  goal_cad: number;
  photo_url: string | null;
  photo_alt: string | null;
  published_at: string | null;
  raised_cad: number;
  donation_count: number;
  allocations: { label: string; amount_cad: number }[];
};

export const listPublishedCampaigns = createServerFn({ method: "GET" }).handler(async () => {
  const { loadCampaigns } = await import("./campaigns.server");
  return loadCampaigns();
});

export const getPublishedCampaign = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => z.object({ slug: z.string().min(1).max(80) }).parse(input))
  .handler(async ({ data }) => {
    const { loadCampaigns } = await import("./campaigns.server");
    const [campaign] = await loadCampaigns(data.slug);
    return campaign ?? null;
  });

export const campaignsQuery = () =>
  queryOptions({ queryKey: ["campaigns", "published"], queryFn: () => listPublishedCampaigns(), staleTime: 60_000 });

export const campaignQuery = (slug: string) =>
  queryOptions({ queryKey: ["campaigns", "published", slug], queryFn: () => getPublishedCampaign({ data: { slug } }), staleTime: 60_000 });
