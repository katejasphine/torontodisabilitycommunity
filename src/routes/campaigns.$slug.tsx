import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FundProgress } from "@/components/site/FundProgress";
import { Notice, SampleBadge } from "@/components/site/Notice";
import { findCampaign } from "@/lib/site";

export const Route = createFileRoute("/campaigns/$slug")({
  loader: ({ params }) => {
    const campaign = findCampaign(params.slug);
    if (!campaign) throw notFound();
    return { campaign };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.campaign.title} — Toronto Disability Community Support` },
          { name: "description", content: loaderData.campaign.summary },
          { property: "og:title", content: loaderData.campaign.title },
          { property: "og:description", content: loaderData.campaign.summary },
          { property: "og:type", content: "article" },
          { name: "twitter:card", content: "summary_large_image" },
        ]
      : [{ title: "Campaign unavailable" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <div className="container-page py-24">
      <h1 className="text-4xl font-semibold">Campaign not found</h1>
      <p className="mt-3 text-muted-foreground">This campaign may have ended or not been published yet.</p>
      <Button asChild className="mt-6"><Link to="/campaigns">Browse campaigns</Link></Button>
    </div>
  ),
  component: CampaignPage,
});

function CampaignPage() {
  const { campaign } = Route.useLoaderData();
  return (
    <div className="container-page py-14">
      <Link to="/campaigns" className="text-primary underline underline-offset-4">← All campaigns</Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <article>
          <div className="flex flex-wrap gap-2">
            {campaign.isSample && <SampleBadge />}
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">{campaign.category}</span>
          </div>
          <h1 className="mt-4 text-4xl font-semibold md:text-5xl">{campaign.title}</h1>
          <p className="mt-3 text-muted-foreground">{campaign.beneficiary}</p>
          <p className="mt-1 flex items-center gap-1.5 text-muted-foreground"><MapPin aria-hidden="true" className="size-4" /> {campaign.location}</p>
          <div className="mt-8 grid aspect-video place-items-center rounded-3xl border-2 border-dashed border-border bg-paper p-6 text-center text-muted-foreground">
            Photos will appear here only with the person's permission.
          </div>
          <h2 className="mt-10 text-2xl font-semibold">Their story</h2>
          <div className="mt-4 space-y-4 text-lg">
            {campaign.story.map((p) => <p key={p}>{p}</p>)}
          </div>
          <h2 className="mt-10 text-2xl font-semibold">Campaign updates</h2>
          {campaign.updates.length === 0 ? (
            <p className="mt-3 text-muted-foreground">No updates yet.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {campaign.updates.map((u) => (
                <li key={u.date} className="rounded-2xl bg-card p-5 shadow-card"><p className="text-sm text-muted-foreground">{u.date}</p><p className="mt-1">{u.text}</p></li>
              ))}
            </ul>
          )}
        </article>
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl border border-border bg-card p-7 shadow-lift">
            <FundProgress raised={campaign.raised} goal={campaign.goal} supporters={campaign.supporters} label={campaign.title} />
            <Button asChild size="lg" className="mt-6 w-full">
              <Link to="/donate" search={{ campaign: campaign.slug }}>Donate to this campaign</Link>
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              Gifts here go only to this person's approved need, tracked separately from the community fund.
            </p>
          </div>
          {campaign.isSample && (
            <div className="mt-6">
              <Notice title="Sample campaign">This page previews the layout and does not represent a real person.</Notice>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
