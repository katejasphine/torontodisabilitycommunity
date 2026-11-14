import { Link } from "@tanstack/react-router";
import { BadgeCheck, Users } from "lucide-react";
import { FundProgress } from "@/components/site/FundProgress";
import { CAMPAIGN_KIND_LABELS, categoryLabel, type CampaignKind } from "@/lib/campaigns";
import type { PublicCampaign } from "@/lib/campaigns.functions";

export function CampaignKindBadge({ kind }: { kind: CampaignKind }) {
  const Icon = kind === "individual" ? BadgeCheck : Users;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-primary-foreground">
      <Icon aria-hidden="true" className="size-3.5" />
      {CAMPAIGN_KIND_LABELS[kind]}
    </span>
  );
}

export function CategoryTag({ category }: { category: string }) {
  return (
    <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
      {categoryLabel(category)}
    </span>
  );
}

export function CampaignCard({ campaign }: { campaign: PublicCampaign }) {
  const headingId = `campaign-${campaign.slug}`;
  return (
    <article
      aria-labelledby={headingId}
      className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card transition-shadow focus-within:shadow-lift hover:shadow-lift"
    >
      {campaign.photo_url ? (
        <img
          src={campaign.photo_url}
          alt={campaign.photo_alt ?? ""}
          loading="lazy"
          className="aspect-[16/10] w-full object-cover"
        />
      ) : (
        <div aria-hidden="true" className="aspect-[16/10] w-full bg-sky-wash" />
      )}
      <div className="flex flex-1 flex-col p-6 md:p-7">
        <div className="flex flex-wrap gap-2">
          <CampaignKindBadge kind={campaign.kind} />
          <CategoryTag category={campaign.category} />
        </div>
        <h3 id={headingId} className="mt-4 text-2xl font-semibold">
          <Link
            to="/campaigns/$slug"
            params={{ slug: campaign.slug }}
            className="rounded-md after:absolute after:inset-0 focus-visible:outline-none"
          >
            {campaign.title}
          </Link>
        </h3>
        <p className="mt-1 text-sm font-bold text-muted-foreground">For: {campaign.beneficiary_display_name}</p>
        {campaign.campaign_message && <p className="mt-3 text-muted-foreground">{campaign.campaign_message}</p>}
        <div className="mt-auto pt-6">
          <FundProgress
            raised={campaign.raised_cad}
            goal={campaign.goal_cad}
            supporters={campaign.donation_count}
            label={campaign.title}
          />
        </div>
      </div>
    </article>
  );
}
