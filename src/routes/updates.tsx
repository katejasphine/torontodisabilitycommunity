import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/updates")({
  head: () => ({
    meta: [
      { title: "Campaign Updates — Toronto Disability Community Support" },
      { name: "description", content: "Progress notes, payouts and thank-you messages from campaigns supported by the Toronto disability community." },
      { property: "og:title", content: "Campaign Updates" },
      { property: "og:description", content: "The latest news from our community campaigns." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Updates,
});

function Updates() {
  return (
    <>
      <PageHeader eyebrow="Campaign Updates" title="News from our campaigns">
        <p>When equipment is purchased, rides are booked or a ramp is built, you'll read about it here.</p>
      </PageHeader>
      <section className="container-page mt-12">
        <div className="rounded-3xl border-2 border-dashed border-border bg-paper p-10 text-center">
          <h2 className="text-2xl font-semibold">No updates yet</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Updates will be posted as soon as the first campaigns go live.
          </p>
          <Button asChild className="mt-6"><Link to="/campaigns">Browse campaigns</Link></Button>
        </div>
      </section>
    </>
  );
}
