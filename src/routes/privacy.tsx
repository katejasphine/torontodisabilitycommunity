import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { Prose } from "@/components/site/Prose";
import { SITE } from "@/lib/site";

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
        <p>Last updated: November 17, 2026</p>
      </PageHeader>
      <Prose>
        <h2>1. Introduction</h2>
        <p>
          Toronto Disability Community Support ("we", "our" or "us") respects your privacy and is committed to
          protecting the personal information of everyone who visits our website, requests assistance, makes a
          donation or participates in our community.
        </p>
        <p>
          This Privacy Policy explains what information we collect, how we use it, how it is protected and what
          choices you have regarding your personal information.
        </p>
        <p>Our community initiative operates in Toronto, Ontario, Canada.</p>

        <h2>2. Information we collect</h2>
        <h3>Personal information</h3>
        <ul>
          <li>Full name</li>
          <li>Email address</li>
          <li>General location</li>
          <li>Contact details</li>
          <li>Information you voluntarily provide through forms and messages</li>
        </ul>
        <h3>Assistance requests</h3>
        <ul>
          <li>Description of the assistance needed</li>
          <li>General circumstances surrounding the request</li>
          <li>Estimated financial support required</li>
          <li>Supporting information voluntarily submitted</li>
        </ul>
        <h3>Donation information</h3>
        <ul>
          <li>Donation amount</li>
          <li>Donor name or anonymous display preference</li>
          <li>Email address for donation confirmations</li>
          <li>Optional donation messages</li>
        </ul>
        <p>Payment card details are handled only by our payment provider. We never receive or store card numbers.</p>

        <h2>3. How we use your information</h2>
        <p>We use collected information to:</p>
        <ul>
          <li>Review and process assistance applications.</li>
          <li>Respond to questions and inquiries.</li>
          <li>Communicate fundraising and campaign updates.</li>
          <li>Process donations and provide confirmations.</li>
          <li>Monitor fundraising progress.</li>
          <li>Improve our website and community services.</li>
          <li>Prevent fraudulent or misleading assistance requests.</li>
        </ul>
        <p>We do not sell personal information to third parties.</p>

        <h2>4. Sharing your information</h2>
        <p>
          We may share necessary information with trusted service providers that help us operate our website,
          process payments and provide essential services.
        </p>
        <p>Assistance applications are restricted to authorized reviewers.</p>
        <p>We do not publicly share private application details, photographs or personal stories without separate permission.</p>

        <h2>5. Website analytics and cookies</h2>
        <p>
          Our website uses Lovable's visitor analytics to understand how the site is used and to improve it. It uses
          no cookies, stores nothing on your device, doesn't keep IP addresses and doesn't identify visitors. Lovable
          collects this data for us. <a href="https://lovable.dev/privacy">Lovable's privacy policy</a> explains how
          it handles it.
        </p>
        <p>
          It records the pages visited, where visitors came from, their country, browser, operating system and
          device type, how long they stay, how fast pages load, errors, and which buttons and links are clicked. This
          is recorded for every visitor. Detailed data is kept for 90 days and daily summaries for one year.
        </p>
        <p>Our website also loads fonts from Google Fonts, which receives your browser's standard request for the font files.</p>

        <h2>6. Information security</h2>
        <p>We take reasonable steps to protect personal information against unauthorized access, misuse, disclosure, alteration or loss.</p>
        <p>However, no internet transmission or electronic storage system can be guaranteed to be completely secure.</p>

        <h2>7. Data retention</h2>
        <p>
          We retain personal information only for as long as reasonably necessary to fulfil the purposes described in
          this policy, meet applicable legal obligations and resolve disputes.
        </p>

        <h2>8. Your privacy rights</h2>
        <p>Depending on applicable privacy laws, you may request to:</p>
        <ul>
          <li>Access personal information we hold about you.</li>
          <li>Correct inaccurate information.</li>
          <li>Request deletion of information where legally permitted.</li>
          <li>Withdraw consent to certain uses of your information.</li>
          <li>Ask questions about how your information is handled.</li>
        </ul>
        <p>You can submit privacy requests through our <Link to="/contact">Contact Us</Link> page.</p>

        <h2>9. Children's privacy</h2>
        <p>
          Our website is not intended to knowingly collect personal information from children without appropriate
          authorization from a parent or legal guardian.
        </p>

        <h2>10. Third-party services</h2>
        <p>Our website may use third-party services for hosting, analytics, payment processing and website functionality.</p>
        <p>Those providers may process information according to their own privacy policies and applicable agreements.</p>

        <h2>11. Changes to this policy</h2>
        <p>We may update this Privacy Policy when our services, practices or legal requirements change.</p>
        <p>Updated versions will be published on this page with a revised date.</p>

        <h2>12. Contact us</h2>
        <p>
          For privacy questions, access requests, corrections or concerns, please use our{" "}
          <Link to="/contact">Contact Us</Link> page or email <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
        </p>
        <p>
          <strong>{SITE.name}</strong>
          <br />
          {SITE.location}
        </p>
        <p className="font-bold">{SITE.tagline}</p>
        <p className="text-base text-muted-foreground">
          <em>Toronto Disability Community Support is a community initiative and is not a registered charity. Contributions are not tax-deductible.</em>
        </p>
      </Prose>
    </>
  );
}
