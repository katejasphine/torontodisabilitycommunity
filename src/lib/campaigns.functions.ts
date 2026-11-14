import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
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

function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

async function loadCampaigns(slug?: string): Promise<PublicCampaign[]> {
  const sb = publicClient();
  let q = sb
    .from("campaigns")
    .select(
      "id, slug, title, kind, status, beneficiary_display_name, category, story, campaign_message, goal_cad, photo_path, photo_alt, published_at, campaign_allocations(label, amount_cad, sort_order)",
    )
    .in("status", ["published", "closed"])
    .order("published_at", { ascending: false });
  if (slug) q = q.eq("slug", slug);
  const [{ data, error }, progress] = await Promise.all([q, sb.rpc("get_campaign_progress")]);
  if (error) throw new Error(`Couldn't load campaigns: ${error.message}`);
  if (progress.error) throw new Error(`Couldn't load campaign progress: ${progress.error.message}`);
  const byId = new Map((progress.data ?? []).map((p) => [p.campaign_id, p]));

  return Promise.all(
    (data ?? []).map(async (c) => {
      let photo_url: string | null = null;
      if (c.photo_path) {
        const signed = await sb.storage.from("campaign-photos").createSignedUrl(c.photo_path, 60 * 60 * 6);
        if (signed.data?.signedUrl) {
          // Signed URLs point at the server-side address; rewrite to the browser-facing one.
          const browserBase = process.env["VITE_SUPABASE_URL"] ?? process.env["SUPABASE_URL"]!;
          photo_url = signed.data.signedUrl.replace(process.env["SUPABASE_URL"]!, browserBase);
        }
      }
      const p = byId.get(c.id);
      return {
        id: c.id,
        slug: c.slug,
        title: c.title,
        kind: c.kind,
        status: c.status,
        beneficiary_display_name: c.beneficiary_display_name,
        category: c.category,
        story: c.story,
        campaign_message: c.campaign_message,
        goal_cad: Number(c.goal_cad),
        photo_url,
        photo_alt: c.photo_alt,
        published_at: c.published_at,
        raised_cad: Number(p?.raised_cad ?? 0),
        donation_count: Number(p?.donation_count ?? 0),
        allocations: [...(c.campaign_allocations ?? [])]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((a) => ({ label: a.label, amount_cad: Number(a.amount_cad) })),
      };
    }),
  );
}

export const listPublishedCampaigns = createServerFn({ method: "GET" }).handler(() => loadCampaigns());

export const getPublishedCampaign = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => z.object({ slug: z.string().min(1).max(80) }).parse(input))
  .handler(async ({ data }) => {
    const [campaign] = await loadCampaigns(data.slug);
    return campaign ?? null;
  });

export const campaignsQuery = () =>
  queryOptions({ queryKey: ["campaigns", "published"], queryFn: () => listPublishedCampaigns(), staleTime: 60_000 });

export const campaignQuery = (slug: string) =>
  queryOptions({ queryKey: ["campaigns", "published", slug], queryFn: () => getPublishedCampaign({ data: { slug } }), staleTime: 60_000 });
