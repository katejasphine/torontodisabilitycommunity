import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Campaign } from "@/lib/site";
import { FundProgress } from "./FundProgress";
import { SampleBadge } from "./Notice";

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-border bg-card p-6 shadow-card">
      <div className="flex flex-wrap items-center gap-2">
        {campaign.isSample && <SampleBadge />}
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
          {campaign.category}
        </span>
      </div>
      <h3 className="mt-4 text-2xl font-semibold">
        <Link to="/campaigns/$slug" params={{ slug: campaign.slug }} className="hover:underline underline-offset-4">
          {campaign.title}
        </Link>
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">{campaign.beneficiary}</p>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
        <MapPin aria-hidden="true" className="size-4" /> {campaign.location}
      </p>
      <p className="mt-4 flex-1 text-foreground">{campaign.summary}</p>
      <div className="mt-6">
        <FundProgress raised={campaign.raised} goal={campaign.goal} supporters={campaign.supporters} label={campaign.title} />
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/donate" search={{ campaign: campaign.slug }}>Donate</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/campaigns/$slug" params={{ slug: campaign.slug }}>Read more</Link>
        </Button>
      </div>
    </article>
  );
}
