import type { PublicCampaign } from "./campaigns.functions";
import { publicClient } from "./supabase-public.server";

export async function loadCampaigns(slug?: string): Promise<PublicCampaign[]> {
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

  return (data ?? []).map((c) => {
      // Stable same-origin URL; the version changes whenever the photo is replaced.
      const photo_url = c.photo_path
        ? `/api/public/campaign-photo/${c.slug}?v=${encodeURIComponent(c.photo_path.split("/").pop() ?? "")}`
        : null;
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
  });
}

