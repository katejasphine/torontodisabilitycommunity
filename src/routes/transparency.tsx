import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { Prose } from "@/components/site/Prose";
import { useSuspenseQuery } from "@tanstack/react-query";
import { impactQuery } from "@/lib/impact.functions";
import { formatCAD, progressPercent } from "@/lib/donation";

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
  loader: ({ context }) => context.queryClient.ensureQueryData(impactQuery()),
  component: Transparency,
});

function Transparency() {
  const { data: impact } = useSuspenseQuery(impactQuery());
  const fund = impact.generalFund;
  const activeCampaigns = impact.stats.find((s) => s.label === "Active fundraising campaigns")?.value ?? 0;
  const rows: [string, string][] = [
    ["Fundraising target", formatCAD(fund.goal)],
    ["Total raised", formatCAD(fund.raised)],
    ["Confirmed online gifts (Paystack, all funds)", `${formatCAD(impact.online.raised)} from ${impact.online.count} gifts`],
    ["Progress achieved", `${progressPercent(fund.raised, fund.goal)}%`],
    ["Remaining target", formatCAD(Math.max(0, fund.goal - fund.raised))],
    ["Verified supporters", String(fund.supporters)],
    ["Active fundraising campaigns", String(activeCampaigns)],
  ];
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
          Donations are processed by Paystack, a secure payment provider, in US dollars or Nigerian naira at the day's
          market exchange rate. Card details go directly to Paystack; this website never sees or stores card numbers. A
          donation is recorded only after Paystack verifies it succeeded, and is counted in CAD at the rate used.
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
        <h2 id="financial-report">Financial report</h2>
        <p>
          This report updates automatically from our records. The General Community Fund supports people living with
          disabilities who need help with essential resources, accessible living arrangements and other approved
          community needs.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-left">
            <caption className="sr-only">General Community Fund — current position</caption>
            <thead className="bg-secondary text-secondary-foreground">
              <tr>
                <th scope="col" className="px-5 py-3 font-bold">Description</th>
                <th scope="col" className="px-5 py-3 text-right font-bold">Amount / Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, value]) => (
                <tr key={label} className="border-t border-border">
                  <th scope="row" className="px-5 py-3 font-normal">{label}</th>
                  <td className="px-5 py-3 text-right font-bold">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          <strong>Important accounting note:</strong> the total raised is reported fundraising, not necessarily the
          current bank balance or the amount available for distribution. Verified spending, payment fees, refunds and
          payouts have not yet been supplied, so they are not reported here as confirmed figures.
        </p>
        <h3>What our reports will cover</h3>
        <ul>
          <li>Total contributions received.</li>
          <li>Fundraising progress.</li>
          <li>Campaign funding allocations.</li>
          <li>Financial assistance distributed.</li>
          <li>Remaining funds available.</li>
          <li>Relevant administrative and payment-processing costs.</li>
        </ul>
        <h2>Our commitment</h2>
        <p>
          We believe every contribution deserves accountability. We are committed to providing clear fundraising
          updates, communicating how funds are allocated and ensuring supporters can understand the impact of their
          generosity.
        </p>
        <p>Your support helps us work towards a more accessible, inclusive and supportive community.</p>
        <p className="font-bold">Together We Rise. Together We Support.</p>
      </Prose>
    </>
  );
}
