import { createFileRoute, Link } from "@tanstack/react-router";
import { Notice } from "@/components/site/Notice";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";

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
          We haven't published any individual campaigns. When a request is approved and the person agrees to share
          their story, their campaign will appear here. Until then, gifts to the General Community Fund are shared
          across approved requests.
        </Notice>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
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
