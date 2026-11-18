import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { Prose } from "@/components/site/Prose";
import { SITE } from "@/lib/site";

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
        <p>Last updated: November 17, 2026</p>
      </PageHeader>
      <Prose>
        <h2>1. Acceptance of terms</h2>
        <p>Welcome to Toronto Disability Community Support.</p>
        <p>
          By accessing or using our website, submitting an assistance request, contributing to a fundraising campaign
          or participating in our community, you agree to these Terms and Conditions.
        </p>
        <p>If you do not agree with these terms, please discontinue using our website.</p>

        <h2>2. About our organization</h2>
        <p>Toronto Disability Community Support is a community initiative based in Toronto, Ontario, Canada.</p>
        <p>
          Our mission is to connect people living with disabilities with community support, resources, fundraising
          opportunities and greater inclusion.
        </p>
        <p>
          We are <strong>not a registered charity</strong>. Donations and contributions made through our platform are
          not tax-deductible charitable donations.
        </p>

        <h2>3. Donations and contributions</h2>
        <p>All displayed fundraising amounts are in Canadian dollars (CAD), unless otherwise stated.</p>
        <p>By making a contribution, you acknowledge that:</p>
        <ul>
          <li>Donations are intended to support the campaign or community fund selected.</li>
          <li>Contributions to the General Community Fund may be allocated across approved assistance requests.</li>
          <li>Campaign progress and fundraising totals are subject to verification and payment processing.</li>
          <li>A donation does not guarantee a particular outcome for an individual or campaign.</li>
        </ul>
        <p>
          Where a campaign cannot use all the funds raised for its stated purpose, we will communicate how remaining
          funds are handled on the relevant campaign page.
        </p>

        <h2>4. Refunds and payment issues</h2>
        <p>If you believe a donation was made in error, duplicated or processed incorrectly, please contact us with the relevant transaction details.</p>
        <p>We will review the circumstances and communicate the appropriate next steps.</p>
        <p>Refunds are not guaranteed and will be handled in accordance with applicable payment-provider rules and legal requirements.</p>

        <h2>5. Assistance applications</h2>
        <p>People seeking support may submit an assistance request through our website.</p>
        <p>By submitting an application, you agree that:</p>
        <ul>
          <li>The information provided is accurate to the best of your knowledge.</li>
          <li>You have permission to submit any supporting information.</li>
          <li>You will not intentionally provide misleading or fraudulent information.</li>
          <li>Submission does not guarantee approval or financial assistance.</li>
        </ul>
        <p>We reserve the right to review, verify, decline or request additional information about applications.</p>

        <h2>6. Fundraising campaigns</h2>
        <p>All fundraising campaigns must have a legitimate purpose consistent with our community mission.</p>
        <p>Campaign organizers must provide truthful descriptions and use funds according to the approved campaign purpose.</p>
        <p>We may suspend or remove campaigns that contain misleading information, fraudulent claims or activities that violate these terms.</p>

        <h2>7. Stories, images and consent</h2>
        <p>We believe every person deserves dignity, privacy and respect.</p>
        <p>Personal stories, photographs and testimonials may only be published with appropriate permission from the individuals involved.</p>
        <p>Individuals may request the removal of their published stories or photographs through our <Link to="/contact">Contact Us</Link> page.</p>
        <p>We will review such requests and take appropriate action.</p>

        <h2>8. Acceptable website use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Submit false or fraudulent assistance applications.</li>
          <li>Misrepresent your identity or fundraising purpose.</li>
          <li>Harass, threaten or discriminate against community members.</li>
          <li>Attempt to access restricted website accounts or information.</li>
          <li>Disrupt website functionality.</li>
          <li>Use our platform for unlawful activities.</li>
          <li>Copy or misuse content without appropriate authorization.</li>
        </ul>

        <h2>9. Intellectual property</h2>
        <p>Website content, branding, graphics, written materials and original designs are protected by applicable intellectual property laws.</p>
        <p>You may not reproduce, distribute or commercially exploit our original materials without permission, except where permitted by law.</p>

        <h2>10. Third-party services</h2>
        <p>Our website may use external services for hosting, payment processing, analytics and other functionality.</p>
        <p>We are not responsible for independent third-party websites or services, although we take reasonable steps to work with appropriate providers.</p>

        <h2>11. Limitation of responsibility</h2>
        <p>We make reasonable efforts to keep our website accurate, secure and accessible. However:</p>
        <ul>
          <li>We do not guarantee uninterrupted website availability.</li>
          <li>We cannot guarantee that every assistance request will receive funding.</li>
          <li>Fundraising results may vary.</li>
          <li>Information provided by third parties may require independent verification.</li>
        </ul>
        <p>Nothing in these terms excludes responsibilities that cannot legally be excluded under applicable law.</p>

        <h2>12. Suspension and termination</h2>
        <p>
          We reserve the right to restrict access to our website or suspend activities where there is reasonable
          evidence of fraud, misuse, harmful conduct or violation of these terms.
        </p>

        <h2>13. Changes to these terms</h2>
        <p>We may update these Terms and Conditions when necessary.</p>
        <p>Changes will be published on this page with an updated revision date.</p>
        <p>Continued use of our website after changes are published constitutes acceptance of the revised terms, to the extent permitted by applicable law.</p>

        <h2>14. Governing law</h2>
        <p>These Terms and Conditions are governed by the applicable laws of Ontario and the federal laws of Canada applicable therein.</p>

        <h2>15. Contact information</h2>
        <p>
          For questions about these Terms and Conditions, donations, campaigns or assistance requests, please use our{" "}
          <Link to="/contact">Contact Us</Link> page or email <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
        </p>
        <p>
          <strong>{SITE.name}</strong>
          <br />
          {SITE.location}
        </p>
        <p className="font-bold">{SITE.tagline}</p>
      </Prose>
    </>
  );
}
