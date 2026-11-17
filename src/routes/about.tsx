import { createFileRoute, Link } from "@tanstack/react-router";
import communityPhoto from "@/assets/community-gathering.jpg.asset.json";
import founderPhoto from "@/assets/founder-kate-jasphine.jpg.asset.json";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/PageHeader";
import { FOUNDER_STORY, SITE } from "@/lib/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Our Mission — Toronto Disability Community Support" },
      { name: "description", content: "Why we exist: an inclusive Toronto where every person living with a disability has dignity, opportunity and community support." },
      { property: "og:title", content: "About Our Mission — Toronto Disability Community Support" },
      { property: "og:description", content: "A community initiative founded by a Torontonian living with a disability." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <PageHeader eyebrow="About Our Mission" title="An inclusive Toronto, built together">
        <p>{SITE.mission}</p>
      </PageHeader>
      <section className="container-page mt-14 grid gap-12 md:grid-cols-[1.1fr_1fr]">
        <div className="space-y-5 text-lg">
          <h2 className="text-3xl font-semibold">Why we started</h2>
          <p>
            Toronto Disability Community Support grew from a simple belief: no one living with a disability should
            have to face life's challenges alone — whether that's a wheelchair repair, an accessible ride, or a ramp
            at the front door.
          </p>
          <p>
            We bring neighbours together to help with those costs directly. People living with disabilities can ask
            for support, and anyone can give to a specific person or to the shared community fund.
          </p>
          <figure className="space-y-4 rounded-2xl bg-paper p-6 text-base">
            <h3 className="text-xl font-semibold">{FOUNDER_STORY.heading}</h3>
            <img
              src={founderPhoto.url}
              alt="Portrait of Kate Jasphine, founder of Toronto Disability Community Support"
              className="mx-auto block w-full max-w-[140px] rounded-2xl object-cover shadow-lift"
              loading="lazy"
            />
            {FOUNDER_STORY.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
            <figcaption className="pt-2 text-muted-foreground">
              — {FOUNDER_STORY.name}
              <br />
              {FOUNDER_STORY.role}
            </figcaption>
          </figure>
          <h2 className="pt-4 text-3xl font-semibold">What we believe</h2>
          <ul className="space-y-3 [&_li]:ml-6 [&_li]:list-disc">
            <li>People living with disabilities are the experts on their own lives.</li>
            <li>Help should come with respect, never pity.</li>
            <li>Every dollar should be traceable, from donation to payout.</li>
            <li>Accessibility is for everyone who visits this site, too.</li>
          </ul>
          <div className="flex flex-wrap gap-3 pt-4">
            <Button asChild><Link to="/donate">Donate</Link></Button>
            <Button asChild variant="outline"><Link to="/transparency">How funds are handled</Link></Button>
          </div>
        </div>
        <img
          src={communityPhoto.url}
          alt="A group of friends and support workers gathered outside a café. Three people use wheelchairs and one has an assistance dog."
          className="w-full rounded-3xl object-cover shadow-lift md:sticky md:top-28"
          loading="lazy"
        />
      </section>
    </>
  );
}
