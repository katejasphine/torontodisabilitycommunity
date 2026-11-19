import { createFileRoute, Link } from "@tanstack/react-router";
import sarahPhoto from "@/assets/sarah-story-home-toronto.png.asset.json";
import kelyPhoto from "@/assets/kely-story-window.png.asset.json";
import michaelPhoto from "@/assets/michael-story-subway-cane.png.asset.json";
import emilyPhoto from "@/assets/emily-story-signing.png.asset.json";
import danielPhoto from "@/assets/daniel-story-desk.png.asset.json";
import gracePhoto from "@/assets/grace-story-couch.png.asset.json";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/PageHeader";
import { SupportMatcher } from "@/components/site/SupportMatcher";
import { COMMUNITY_STORIES } from "@/lib/site";

const PHOTOS: Record<(typeof COMMUNITY_STORIES)[number]["id"], string> = {
  sarah: sarahPhoto.url,
  kely: kelyPhoto.url,
  michael: michaelPhoto.url,
  emily: emilyPhoto.url,
  daniel: danielPhoto.url,
  grace: gracePhoto.url,
};

export const Route = createFileRoute("/stories")({
  head: () => ({
    meta: [
      { title: "Community Stories — Toronto Disability Community Support" },
      { name: "description", content: "Sarah, Kely, Michael, Emily, Daniel and Grace share, in their own words, what living with a disability in Toronto is like." },
      { property: "og:title", content: "Community Stories" },
      { property: "og:description", content: "Six people from Toronto's disability community share their stories in their own words." },
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
        <p>In their own words: the everyday barriers people living with disabilities face, and what would make a difference.</p>
      </PageHeader>

      <nav aria-label="Stories on this page" className="container-page mt-10">
        <ul className="flex flex-wrap gap-2">
          {COMMUNITY_STORIES.map((s) => (
            <li key={s.id}>
              <a
                href={`#story-${s.id}`}
                className="inline-flex rounded-full border border-border bg-card px-4 py-2 font-bold text-foreground transition-colors hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
              >
                {s.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="container-page mt-10">
        <SupportMatcher />
      </div>

      {COMMUNITY_STORIES.map((story, i) => (
        <article
          key={story.id}
          aria-labelledby={`story-${story.id}`}
          className="container-page mt-16 grid scroll-mt-28 items-start gap-10 md:grid-cols-2"
        >
          <img
            src={PHOTOS[story.id]}
            alt={story.photoAlt}
            loading={i === 0 ? "eager" : "lazy"}
            className={`aspect-[4/3] w-full rounded-3xl object-cover shadow-lift md:sticky md:top-28 ${i % 2 === 1 ? "md:order-2" : ""}`}
          />
          <div>
            <h2 id={`story-${story.id}`} className="scroll-mt-28 text-3xl font-semibold md:text-4xl">{story.title}</h2>
            <div className="mt-5 space-y-4 text-lg leading-relaxed">
              {story.paragraphs.map((p) => <p key={p}>{p}</p>)}
            </div>
            <blockquote className="mt-6 rounded-2xl border-l-4 border-primary bg-paper p-5">
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground">In {story.name}'s words</p>
              <p className="mt-2 font-display text-xl">{story.quote}</p>
            </blockquote>
            <Button asChild size="lg" className="mt-6">
              {story.campaignSlug ? (
                <Link to="/campaigns/$slug" params={{ slug: story.campaignSlug }}>{story.campaignLabel}</Link>
              ) : (
                <Link to="/donate">{story.campaignLabel}</Link>
              )}
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
