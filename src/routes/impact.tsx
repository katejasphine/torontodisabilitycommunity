import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { FundProgress } from "@/components/site/FundProgress";
import { ImpactStats } from "@/components/site/ImpactStats";
import { PageHeader } from "@/components/site/PageHeader";
import { useSuspenseQuery } from "@tanstack/react-query";
import { impactQuery } from "@/lib/impact.functions";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Our Impact — Toronto Disability Community Support" },
      { name: "description", content: "Verified figures on people supported, active campaigns and funds raised by Toronto Disability Community Support." },
      { property: "og:title", content: "Making a Difference Together" },
      { property: "og:description", content: "Verified community impact figures — no invented numbers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(impactQuery()),
  component: Impact,
});

function Impact() {
  const { data: impact } = useSuspenseQuery(impactQuery());
  return (
    <>
      <PageHeader eyebrow="Our Impact" title="Making a Difference Together">
        <p>Every number on this page comes from verified records. We never estimate or round up.</p>
      </PageHeader>
      <section className="container-page mt-12"><ImpactStats stats={impact.stats} /></section>
      <section className="container-page mt-16 grid gap-8 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
          <h2 className="text-2xl font-semibold">General Community Fund</h2>
          <div className="mt-6"><FundProgress {...impact.generalFund} label="General Community Fund" /></div>
        </div>
        <div className="rounded-3xl bg-secondary p-8">
          <h2 className="text-2xl font-semibold">How we count</h2>
          <p className="mt-3 text-secondary-foreground">
            A donation is counted only after the payment provider confirms it went through. "Supporters" adds
            confirmed online gifts to the supporters who gave before online giving opened — never a guess.
          </p>
          <Button asChild variant="link" className="mt-3 px-0"><Link to="/transparency">Read our transparency policy</Link></Button>
        </div>
      </section>
    </>
  );
}
