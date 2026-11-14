import { createFileRoute, Link } from "@tanstack/react-router";
import heroPhoto from "@/assets/toronto-accessibility-walk.jpg.asset.json";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/stories")({
  head: () => ({
    meta: [
      { title: "Community Stories — Toronto Disability Community Support" },
      { name: "description", content: "Real experiences from people living with disabilities in Toronto, shared in their own words and with their consent." },
      { property: "og:title", content: "Community Stories" },
      { property: "og:description", content: "Stories from Toronto's disability community, shared with consent." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Stories,
});

function Stories() {
  return (
    <>
      <PageHeader eyebrow="Meet Our Community" title="Community stories">
        <p>Success stories, everyday experiences, and messages of encouragement — always in people's own words and shared with their permission.</p>
      </PageHeader>
      <section className="container-page mt-12 grid items-center gap-10 md:grid-cols-2">
        <img
          src={heroPhoto.url}
          alt="Community members, several using power wheelchairs and scooters, gather on a Toronto sidewalk to hear a speaker using a power wheelchair."
          className="aspect-[4/3] w-full rounded-3xl object-cover shadow-lift"
          loading="lazy"
        />
        <div>
          <h2 className="text-3xl font-semibold">The first stories are on their way</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We only publish real stories, approved by the people who lived them. There are none to show yet — and we
            won't fill this space with made-up ones.
          </p>
          <p className="mt-4 text-lg text-muted-foreground">
            If you've been supported by our community, or simply want to share your experience living with a
            disability in Toronto, we'd be honoured to hear from you.
          </p>
          <Button asChild size="lg" className="mt-6"><Link to="/contact">Share your story</Link></Button>
        </div>
      </section>
    </>
  );
}
