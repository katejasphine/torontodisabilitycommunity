import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { FundProgress } from "@/components/site/FundProgress";
import { ImpactStats } from "@/components/site/ImpactStats";
import { PageHeader } from "@/components/site/PageHeader";
import { useSuspenseQuery } from "@tanstack/react-query";
import { impactQuery, recentGiftsQuery } from "@/lib/impact.functions";
import { formatCAD } from "@/lib/donation";

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
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(impactQuery()),
      context.queryClient.ensureQueryData(recentGiftsQuery()),
    ]),
  component: Impact,
});

function Impact() {
  const { data: impact } = useSuspenseQuery(impactQuery());
  const { data: gifts } = useSuspenseQuery(recentGiftsQuery());
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
      <section aria-labelledby="recent-gifts" className="container-page mt-16">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
          <h2 id="recent-gifts" className="text-2xl font-semibold">Every online gift</h2>
          <p className="mt-2 text-muted-foreground">
            Each confirmed online gift appears here automatically, newest first. We show only the amount and date —
            never who gave.
          </p>
          {gifts.length === 0 ? (
            <p className="mt-6 rounded-2xl bg-paper p-5">
              No online gifts yet. The first confirmed gift will appear here as soon as the payment goes through.
            </p>
          ) : (
            <ul className="mt-6 divide-y divide-border">
              {gifts.map((g, i) => (
                <li key={`${g.completed_at}-${i}`} className="flex items-baseline justify-between gap-4 py-3">
                  <time dateTime={g.completed_at} className="text-muted-foreground">
                    {new Date(g.completed_at).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric", timeZone: "America/Toronto" })}
                  </time>
                  <span className="font-display text-xl font-semibold">{formatCAD(g.amount_cad)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
