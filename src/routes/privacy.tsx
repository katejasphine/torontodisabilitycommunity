import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { Prose } from "@/components/site/Prose";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Toronto Disability Community Support" },
      { name: "description", content: "How Toronto Disability Community Support collects, uses and protects your personal information." },
      { property: "og:title", content: "Privacy Policy" },
      { property: "og:description", content: "How we protect the information you share with us." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <>
      <PageHeader eyebrow="Privacy Policy" title="Your privacy matters">
        <p>Draft policy — the organizer should review it with someone who knows Canadian privacy law (PIPEDA) before launch.</p>
      </PageHeader>
      <Prose>
        <h2>What we collect</h2>
        <ul>
          <li><strong>Assistance requests:</strong> your name, email, general location, the type of support needed, your description and an estimated amount.</li>
          <li><strong>Contact messages:</strong> your name, email, subject and message.</li>
          <li><strong>Donations:</strong> once online payments are live, the amount, display name (or anonymous), email for receipts and optional message. Card details are handled only by our payment provider — we never receive or store card numbers.</li>
        </ul>
        <h2>How we use it</h2>
        <p>Only to review requests, reply to messages, issue receipts and report on how funds are used. We never sell your information.</p>
        <h2>Who can see it</h2>
        <p>Assistance requests are visible only to our review team. Nothing about you is published unless you give separate, explicit consent.</p>
        <h2>Visitor analytics</h2>
        <p>
          Lovable's visitor analytics counts visits to this site. It uses no cookies, stores nothing on your device,
          doesn't keep IP addresses and doesn't identify visitors. Lovable collects this data for us.{" "}
          <a href="https://lovable.dev/privacy">Lovable's privacy policy</a> explains how it handles it.
        </p>
        <p>
          It records the pages visited, where visitors came from, their country, browser, operating system and device
          type, how long they stay, how fast pages load, errors, and which buttons and links are clicked. This is
          recorded for every visitor. Detailed data is kept for 90 days and daily summaries for a year.
        </p>
        <p>The site also loads fonts from Google Fonts, which receives your browser's request for the font files.</p>
        <h2>Your choices</h2>
        <p>You can ask us to see, correct or delete your information at any time through our contact page.</p>
      </Prose>
    </>
  );
}
