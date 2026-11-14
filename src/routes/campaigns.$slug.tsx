import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Heart } from "lucide-react";
import { CampaignKindBadge, CategoryTag } from "@/components/site/CampaignCard";
import { FundProgress } from "@/components/site/FundProgress";
import { Button } from "@/components/ui/button";
import { allocationTotal } from "@/lib/campaigns";
import { campaignQuery } from "@/lib/campaigns.functions";
import { formatCAD } from "@/lib/donation";

export const Route = createFileRoute("/campaigns/$slug")({
  loader: async ({ context, params }) => {
    const campaign = await context.queryClient.ensureQueryData(campaignQuery(params.slug));
    if (!campaign) throw notFound();
    return { title: campaign.title, message: campaign.campaign_message };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — Toronto Disability Community Support` },
          { name: "description", content: loaderData.message ?? "Support this campaign for people living with disabilities in Toronto." },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.message ?? "A Toronto Disability Community Support campaign." },
          { property: "og:type", content: "article" },
          { name: "twitter:card", content: "summary_large_image" },
        ]
      : [{ title: "Campaign not found — Toronto Disability Community Support" }],
  }),
  notFoundComponent: () => (
    <div className="container-page py-24">
      <h1 className="text-3xl font-semibold">Campaign not found</h1>
      <p className="mt-3 text-muted-foreground">This campaign isn't published, or the link is wrong.</p>
      <Button asChild className="mt-6"><Link to="/campaigns">Browse campaigns</Link></Button>
    </div>
  ),
  component: CampaignPage,
});

function CampaignPage() {
  const { slug } = Route.useParams();
  const { data: c } = useSuspenseQuery(campaignQuery(slug));
  if (!c) return null;
  const isClosed = c.status === "closed";

  return (
    <article className="pb-8">
      <div className="bg-sky-wash border-b border-border">
        <div className="container-page py-10 md:py-14">
          <Link to="/campaigns" className="inline-flex items-center gap-2 font-bold text-primary underline underline-offset-4">
            <ArrowLeft aria-hidden="true" className="size-4" /> All campaigns
          </Link>
          <div className="mt-6 flex flex-wrap gap-2">
            <CampaignKindBadge kind={c.kind} />
            <CategoryTag category={c.category} />
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold md:text-5xl">{c.title}</h1>
          <p className="mt-3 text-lg font-bold text-muted-foreground">For: {c.beneficiary_display_name}</p>
        </div>
      </div>

      <div className="container-page mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div>
          {c.photo_url && (
            <figure>
              <img src={c.photo_url} alt={c.photo_alt ?? ""} className="aspect-[16/10] w-full rounded-3xl object-cover shadow-lift" />
              {c.kind === "community_appeal" && (
                <figcaption className="mt-2 text-sm text-muted-foreground">
                  Photo of our community. It doesn't show the person who will receive support.
                </figcaption>
              )}
            </figure>
          )}

          <section aria-labelledby="story-heading" className="mt-10">
            <h2 id="story-heading" className="text-2xl font-semibold">
              {c.kind === "individual" ? "Their story" : "About this appeal"}
            </h2>
            <div className="mt-4 space-y-4 text-lg leading-relaxed">
              {c.story.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
            </div>
            {c.campaign_message && (
              <blockquote className="mt-6 rounded-2xl border-l-4 border-primary bg-paper p-5 font-display text-xl">
                {c.campaign_message}
              </blockquote>
            )}
          </section>

          <section aria-labelledby="funds-heading" className="mt-10">
            <h2 id="funds-heading" className="text-2xl font-semibold">Proposed use of funds</h2>
            <table className="mt-4 w-full overflow-hidden rounded-2xl border border-border bg-card text-left">
              <caption className="sr-only">How the {formatCAD(c.goal_cad)} goal will be spent</caption>
              <thead className="bg-secondary text-secondary-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3">Item</th>
                  <th scope="col" className="px-4 py-3 text-right">Amount (CAD)</th>
                </tr>
              </thead>
              <tbody>
                {c.allocations.map((a) => (
                  <tr key={a.label} className="border-t border-border">
                    <td className="px-4 py-3">{a.label}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCAD(a.amount_cad)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border font-bold">
                  <th scope="row" className="px-4 py-3">Total goal</th>
                  <td className="px-4 py-3 text-right tabular-nums">{formatCAD(allocationTotal(c.allocations))}</td>
                </tr>
              </tfoot>
            </table>
            <p className="mt-3 text-sm text-muted-foreground">
              Every payout is reported on our <Link to="/transparency" className="underline">transparency page</Link>.
            </p>
          </section>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl border border-border bg-card p-7 shadow-card">
            <h2 className="text-xl font-semibold">Fundraising progress</h2>
            <div className="mt-4">
              <FundProgress raised={c.raised_cad} goal={c.goal_cad} supporters={c.donation_count} label={c.title} />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Counts only payments confirmed by our payment provider.</p>
            {isClosed ? (
              <p className="mt-6 font-bold">This campaign has closed. Thank you to everyone who gave.</p>
            ) : (
              <Button asChild size="lg" className="mt-6 w-full">
                <Link to="/donate" search={{ campaign: c.slug }}>
                  <Heart aria-hidden="true" /> Donate to this campaign
                </Link>
              </Button>
            )}
            <p className="mt-4 text-sm text-muted-foreground">
              We are not a registered charity. Donations are not tax-deductible.
            </p>
          </div>
        </aside>
      </div>
    </article>
  );
}
