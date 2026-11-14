import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { Prose } from "@/components/site/Prose";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms and Conditions — Toronto Disability Community Support" },
      { name: "description", content: "The terms for donating, requesting support and using the Toronto Disability Community Support website." },
      { property: "og:title", content: "Terms and Conditions" },
      { property: "og:description", content: "Terms for using Toronto Disability Community Support." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <>
      <PageHeader eyebrow="Terms and Conditions" title="Terms of use">
        <p>Draft terms — the organizer should have these reviewed before launch.</p>
      </PageHeader>
      <Prose>
        <h2>About us</h2>
        <p>Toronto Disability Community Support is a community initiative in Toronto, Ontario. We are not a registered charity, and donations are not tax-deductible.</p>
        <h2>Donations</h2>
        <ul>
          <li>All amounts are in Canadian dollars (CAD).</li>
          <li>Gifts to a campaign go to that campaign's approved need. Gifts to the General Community Fund are shared across approved requests.</li>
          <li>If a campaign cannot use all the funds raised, we will explain on its page how the remainder is handled.</li>
        </ul>
        <h2>Requesting support</h2>
        <p>Submitting a request does not guarantee support. Information you provide must be truthful. Requests found to be fraudulent will be declined.</p>
        <h2>Content and consent</h2>
        <p>Stories and photos are published only with the written consent of the people in them, who may ask for them to be removed at any time.</p>
        <h2>Contact</h2>
        <p>Questions about these terms can be sent through our contact page.</p>
      </Prose>
    </>
  );
}
