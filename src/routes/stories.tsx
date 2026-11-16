import { createFileRoute, Link } from "@tanstack/react-router";
import danielPhoto from "@/assets/daniel-story-park.png.asset.json";
import sarahPhoto from "@/assets/sarah-story-accessible-home.png.asset.json";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/PageHeader";
import { COMMUNITY_STORIES } from "@/lib/site";

const PHOTOS: Record<(typeof COMMUNITY_STORIES)[number]["id"], string> = {
  daniel: danielPhoto.url,
  sarah: sarahPhoto.url,
};

export const Route = createFileRoute("/stories")({
  head: () => ({
    meta: [
      { title: "Community Stories — Toronto Disability Community Support" },
      { name: "description", content: "Stories about mobility, independence and accessible homes for people living with disabilities in Toronto." },
      { property: "og:title", content: "Community Stories" },
      { property: "og:description", content: "Daniel's and Sarah's stories show the barriers many people in Toronto's disability community face." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Stories,
});

function Stories() {
  return (
    <>
      <PageHeader eyebrow="Meet Our Community" title="Our stories">
        <p>The everyday barriers people living with disabilities face, and how community support can help.</p>
      </PageHeader>


      {COMMUNITY_STORIES.map((story, i) => (
        <article
          key={story.id}
          aria-labelledby={`story-${story.id}`}
          className="container-page mt-16 grid items-start gap-10 md:grid-cols-2"
        >
          <img
            src={PHOTOS[story.id]}
            alt={story.photoAlt}
            loading={i === 0 ? "eager" : "lazy"}
            className={`aspect-[4/3] w-full rounded-3xl object-cover shadow-lift md:sticky md:top-28 ${i % 2 === 1 ? "md:order-2" : ""}`}
          />
          <div>
            <h2 id={`story-${story.id}`} className="text-3xl font-semibold md:text-4xl">{story.title}</h2>
            <div className="mt-5 space-y-4 text-lg leading-relaxed">
              {story.paragraphs.map((p) => <p key={p}>{p}</p>)}
            </div>
            <blockquote className="mt-6 rounded-2xl border-l-4 border-primary bg-paper p-5">
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground">Our message</p>
              <p className="mt-2 font-display text-xl">{story.message}</p>
            </blockquote>
            <p className="mt-5 text-lg font-bold">{story.closing}</p>
            <Button asChild size="lg" className="mt-6">
              <Link to="/campaigns/$slug" params={{ slug: story.campaignSlug }}>{story.campaignLabel}</Link>
            </Button>
          </div>
        </article>
      ))}

      <section className="container-page mt-20">
        <div className="rounded-3xl bg-secondary p-8 md:p-12">
          <h2 className="text-3xl font-semibold">Share your own story</h2>
          <p className="mt-3 max-w-2xl text-secondary-foreground">
            If you've been supported by our community, or want to share your experience living with a disability in
            Toronto, we'd be honoured to hear from you. We publish real stories only in your words and with your
            permission.
          </p>
          <Button asChild size="lg" className="mt-6"><Link to="/contact">Share your story</Link></Button>
        </div>
      </section>
    </>
  );
}
