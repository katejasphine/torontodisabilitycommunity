import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { Prose } from "@/components/site/Prose";

export const Route = createFileRoute("/transparency")({
  head: () => ({
    meta: [
      { title: "Financial Transparency — Toronto Disability Community Support" },
      { name: "description", content: "How donations are collected, how requests are reviewed, how beneficiaries are selected and how funds are distributed." },
      { property: "og:title", content: "Financial Transparency" },
      { property: "og:description", content: "Clear, public accountability for every dollar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Transparency,
});

function Transparency() {
  return (
    <>
      <PageHeader eyebrow="Financial Transparency" title="Where every dollar goes">
        <p>We want you to know exactly how your gift is handled — from the moment you give to the moment it helps someone.</p>
      </PageHeader>
      <Prose>
        <h2>Our status</h2>
        <p>
          Toronto Disability Community Support is a community initiative. We are <strong>not a registered charity</strong>,
          and donations are <strong>not tax-deductible</strong>. We will update this page if that changes.
        </p>
        <h2>How donations are collected</h2>
        <p>
          Donations are processed by a secure third-party payment provider. Card details go directly to the provider;
          this website never sees or stores card numbers. A donation is counted in our totals only once the provider
          confirms it succeeded.
        </p>
        <h2>Two separate funds</h2>
        <ul>
          <li><strong>General Community Fund</strong> — pooled gifts shared across approved requests.</li>
          <li><strong>Individual campaigns</strong> — gifts that go only to the person named on that campaign.</li>
        </ul>
        <p>Each is accounted for separately, so money given to one person is never moved to another.</p>
        <h2>How applications are reviewed</h2>
        <p>
          Requests are private. Our review team checks each request, may ask follow-up questions, and confirms costs
          with quotes or invoices where possible. Requests that look suspicious are flagged and reviewed further.
        </p>
        <h2>How beneficiaries are selected</h2>
        <p>
          Decisions are based on need, how directly the support improves independence and daily life, and available
          funds. Nobody is published without their written consent.
        </p>
        <h2>How funds are distributed</h2>
        <p>
          Where possible, we pay suppliers directly (for example, a wheelchair repair shop or an accessible transport
          provider). Each payout is recorded and summarized in our financial reports.
        </p>
        <h2>Administrative expenses</h2>
        <p>
          Payment providers charge a small processing fee on each donation. Any other administrative costs will be
          listed here in full. <em>(The organizer will confirm the exact figures before launch.)</em>
        </p>
        <h2>Financial reports</h2>
        <p>Reports will be published here regularly once donations begin. No reports have been published yet.</p>
      </Prose>
    </>
  );
}
