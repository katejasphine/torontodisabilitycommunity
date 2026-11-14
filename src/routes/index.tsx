import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, HandHeart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroPhoto from "@/assets/toronto-accessibility-walk.jpg.asset.json";
import communityPhoto from "@/assets/community-gathering.jpg.asset.json";
import { FundProgress } from "@/components/site/FundProgress";
import { ImpactStats } from "@/components/site/ImpactStats";
import { GENERAL_FUND, SITE } from "@/lib/site";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CampaignCard } from "@/components/site/CampaignCard";
import { campaignsQuery } from "@/lib/campaigns.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Toronto Disability Community Support — Together We Rise" },
      {
        name: "description",
        content:
          "Support people living with disabilities in Toronto. Donate to the community fund, back an individual campaign, or request assistance.",
      },
      { property: "og:title", content: "Toronto Disability Community Support" },
      {
        property: "og:description",
        content: "Supporting each other, strengthening our disability community in Toronto, Ontario.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(campaignsQuery()),
  component: Home,
});

function Home() {
  const { data: campaigns } = useSuspenseQuery(campaignsQuery());
  const featured = campaigns.filter((c) => c.status === "published").slice(0, 2);
  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-navy-deep">
        <img
          src={heroPhoto.url}
          alt="A woman using a power wheelchair leads a group of community members, some using wheelchairs and scooters, on a downtown Toronto street near Yonge and Eglinton."
          className="absolute inset-0 -z-10 size-full object-cover object-[30%_40%]"
        />
        <div className="absolute inset-0 -z-10 bg-hero-overlay" aria-hidden="true" />
        <div className="container-page flex min-h-[38rem] flex-col justify-end pb-16 pt-40 md:min-h-[42rem]">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-on-navy-muted">{SITE.tagline}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold text-on-navy md:text-6xl">
            Supporting Each Other, Strengthening Our Disability Community.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-on-navy md:text-xl">
            Everyone deserves a life filled with dignity, independence, and opportunity. Through community
            generosity, we are helping people living with disabilities in Toronto access the support and
            resources they need.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="onNavy">
              <Link to="/donate">Donate Now</Link>
            </Button>
            <Button asChild size="lg" variant="outlineOnNavy">
              <Link to="/request-assistance">Request Assistance</Link>
            </Button>
            <Button asChild size="lg" variant="outlineOnNavy">
              <Link to="/stories">Meet Our Community</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Community fund progress */}
      <section aria-labelledby="fund-heading" className="container-page -mt-10 relative">
        <div className="grid gap-8 rounded-3xl border border-border bg-card p-8 shadow-lift md:grid-cols-[1fr_1.3fr] md:p-10">
          <div>
            <h2 id="fund-heading" className="text-3xl font-semibold">General Community Fund</h2>
            <p className="mt-3 text-muted-foreground">
              Gifts to the community fund are shared across approved requests, so help reaches whoever needs it
              most. You can also give to one person's campaign instead.
            </p>
          </div>
          <div className="flex flex-col justify-center">
            <FundProgress {...GENERAL_FUND} label="General Community Fund" />
            <p className="mt-3 text-xs text-muted-foreground">Goal is a placeholder until confirmed by the organizer.</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container-page mt-20 grid gap-6 md:grid-cols-3">
        {[
          { icon: HandHeart, title: "Dignity first", text: "Every story is shared in the person's own words, only with their consent." },
          { icon: ShieldCheck, title: "Accountable", text: "Totals count verified payments only, and every payout is reported publicly." },
          { icon: Users, title: "Community-led", text: "Founded by a Torontonian living with a disability, for our whole community." },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-3xl bg-paper p-7">
            <Icon aria-hidden="true" className="size-8 text-primary" />
            <h3 className="mt-4 text-xl font-semibold">{title}</h3>
            <p className="mt-2 text-muted-foreground">{text}</p>
          </div>
        ))}
      </section>

      {/* Featured campaigns */}
      <section aria-labelledby="featured-heading" className="container-page mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="featured-heading" className="text-3xl font-semibold md:text-4xl">Featured campaigns</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Community appeals for specific needs. Stories about one person are shared only with their written consent.
            </p>
          </div>
          <Link to="/campaigns" className="inline-flex items-center gap-2 font-bold text-primary underline underline-offset-4">
            Browse all campaigns <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        {featured.length > 0 ? (
          <ul className="mt-8 grid gap-6 md:grid-cols-2">
            {featured.map((c) => (
              <li key={c.id} className="relative flex">
                <CampaignCard campaign={c} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-8 rounded-3xl border border-border bg-card p-8 shadow-card">
            <p className="text-lg text-muted-foreground">No campaigns are live yet.</p>
            <Button asChild variant="outline" className="mt-6">
              <Link to="/request-assistance">Request assistance for yourself or someone you know</Link>
            </Button>
          </div>
        )}
      </section>

      {/* Community photo + about */}
      <section className="container-page mt-24 grid items-center gap-10 md:grid-cols-2">
        <img
          src={communityPhoto.url}
          alt="A smiling group of friends and support workers gathered outside a café. Three people use wheelchairs, one is joined by an assistance dog, and a mural behind them reads Community, Inclusion, Respect, Belonging."
          className="aspect-[5/4] w-full rounded-3xl object-cover shadow-lift"
          loading="lazy"
        />
        <div>
          <h2 className="text-3xl font-semibold md:text-4xl">Built by our community, for our community</h2>
          <p className="mt-4 text-lg text-muted-foreground">{SITE.mission}</p>
          <Button asChild variant="link" className="mt-4 px-0 text-lg">
            <Link to="/about">Read about our mission</Link>
          </Button>
        </div>
      </section>

      {/* Impact */}
      <section aria-labelledby="impact-heading" className="container-page mt-24">
        <h2 id="impact-heading" className="text-3xl font-semibold md:text-4xl">Making a Difference Together</h2>
        <div className="mt-8">
          <ImpactStats />
        </div>
      </section>

      {/* Updates */}
      <section aria-labelledby="updates-heading" className="container-page mt-24">
        <div className="rounded-3xl bg-secondary p-8 md:p-12">
          <h2 id="updates-heading" className="text-3xl font-semibold">Recent campaign updates</h2>
          <p className="mt-3 max-w-2xl text-secondary-foreground">
            No updates yet. When campaigns go live, progress notes and thank-you messages from beneficiaries will
            appear here.
          </p>
          <Button asChild variant="default" className="mt-6">
            <Link to="/updates">See all updates</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
