import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CampaignCard } from "@/components/site/CampaignCard";
import { Notice } from "@/components/site/Notice";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { campaignsQuery } from "@/lib/campaigns.functions";

export const Route = createFileRoute("/campaigns/")({
  head: () => ({
    meta: [
      { title: "Browse Fundraising Campaigns — Toronto Disability Community Support" },
      { name: "description", content: "Support mobility equipment and accessible-home appeals for people living with disabilities across Toronto." },
      { property: "og:title", content: "Browse Fundraising Campaigns" },
      { property: "og:description", content: "Community appeals for mobility equipment and safer, accessible homes in Toronto." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(campaignsQuery()),
  component: Campaigns,
});

function Campaigns() {
  const { data: campaigns } = useSuspenseQuery(campaignsQuery());
  return (
    <>
      <PageHeader eyebrow="Campaigns" title="Browse fundraising campaigns">
        <p>
          Community appeals raise money for a specific kind of need and go to approved applicants. A campaign about
          one person is published only after we verify who they are and they agree in writing to share their story.
        </p>
      </PageHeader>
      <section aria-label="Campaigns" className="container-page mt-12">
        {campaigns.length === 0 ? (
          <Notice title="No live campaigns yet">
            Gifts to the General Community Fund are shared across approved requests.
          </Notice>
        ) : (
          <ul className="grid gap-6 md:grid-cols-2">
            {campaigns.map((c) => (
              <li key={c.id} className="relative flex">
                <CampaignCard campaign={c} />
              </li>
            ))}
          </ul>
        )}
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild size="lg" variant="outline">
            <Link to="/donate">Give to the Community Fund</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/request-assistance">Request Assistance</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
