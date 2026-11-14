import { createFileRoute } from "@tanstack/react-router";
import { CampaignCard } from "@/components/site/CampaignCard";
import { Notice } from "@/components/site/Notice";
import { PageHeader } from "@/components/site/PageHeader";
import { SAMPLE_CAMPAIGNS } from "@/lib/site";

export const Route = createFileRoute("/campaigns/")({
  head: () => ({
    meta: [
      { title: "Browse Fundraising Campaigns — Toronto Disability Community Support" },
      { name: "description", content: "Explore approved fundraising campaigns for people living with disabilities across Toronto." },
      { property: "og:title", content: "Browse Fundraising Campaigns" },
      { property: "og:description", content: "Support an individual campaign for someone living with a disability in Toronto." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Campaigns,
});

function Campaigns() {
  return (
    <>
      <PageHeader eyebrow="Campaigns" title="Browse fundraising campaigns">
        <p>Every campaign is reviewed and approved before it is published, and shared with the person's consent.</p>
      </PageHeader>
      <section className="container-page mt-12">
        <Notice title="No live campaigns yet">
          The campaigns below are samples that show the layout. They do not represent real people, and donations
          cannot be made to them yet.
        </Notice>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SAMPLE_CAMPAIGNS.map((c) => (
            <CampaignCard key={c.slug} campaign={c} />
          ))}
        </div>
      </section>
    </>
  );
}
