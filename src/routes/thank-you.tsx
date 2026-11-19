import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/site/Notice";
import { PageHeader } from "@/components/site/PageHeader";
import { confirmDonationReturn } from "@/lib/donate.functions";
import { formatCAD, formatCharge, type ChargeCurrency } from "@/lib/donation";

export const Route = createFileRoute("/thank-you")({
  head: () => ({
    meta: [
      { title: "Thank You for Your Gift — Toronto Disability Community Support" },
      { name: "description", content: "Confirmation of your gift to Toronto Disability Community Support." },
      { property: "og:title", content: "Thank you for your gift" },
      { property: "og:description", content: "Your support helps people living with disabilities across Toronto." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { reference?: string } => {
    const r = typeof s["reference"] === "string" ? s["reference"] : typeof s["trxref"] === "string" ? s["trxref"] : undefined;
    return r && /^[A-Za-z0-9.=-]{1,100}$/.test(r) ? { reference: r } : {};
  },
  component: ThankYou,
});

function ThankYou() {
  const { reference } = Route.useSearch();
  const confirm = useServerFn(confirmDonationReturn);
  const q = useQuery({
    queryKey: ["donation-return", reference],
    queryFn: () => confirm({ data: { reference: reference! } }),
    enabled: !!reference,
    refetchInterval: (query) => (query.state.data?.state === "pending" && query.state.dataUpdateCount < 6 ? 5000 : false),
  });
  const r = q.data;

  return (
    <>
      <PageHeader eyebrow="Donate" title="Thank you">
        <p>Together We Rise. Together We Support.</p>
      </PageHeader>
      <section className="container-page mt-12 max-w-3xl" aria-live="polite">
        {!reference ? (
          <Notice title="We couldn't find your payment">If you just paid, please check your email for a Paystack receipt.</Notice>
        ) : q.isPending ? (
          <p className="flex items-center gap-2 text-lg"><Loader2 aria-hidden="true" className="animate-spin" /> Checking your payment…</p>
        ) : r?.state === "completed" ? (
          <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
            <CheckCircle2 aria-hidden="true" className="size-10 text-primary" />
            <h2 className="mt-4 text-3xl font-semibold">Your gift went through</h2>
            {r.amountCad != null && (
              <p className="mt-3 text-lg">
                You gave {formatCAD(r.amountCad)}
                {r.chargeMinor && r.chargeCurrency ? ` (charged ${formatCharge(r.chargeMinor, r.chargeCurrency as ChargeCurrency)})` : ""}.
                Paystack has emailed your receipt.
              </p>
            )}
            <p className="mt-3 text-muted-foreground">Donations are not tax-deductible. Your gift now appears on Our Impact.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link to="/impact">See Our Impact</Link></Button>
              <Button asChild size="lg" variant="outline"><Link to="/stories">Read community stories</Link></Button>
            </div>
          </div>
        ) : r?.state === "failed" ? (
          <Notice title="Your payment didn't go through">
            No money was taken. You can <Link to="/donate" className="underline">try again</Link>.
          </Notice>
        ) : (
          <Notice title="We're still waiting for confirmation">
            Your payment hasn't been confirmed yet. If you completed it, it will appear on Our Impact shortly. If you
            cancelled, no money was taken — you can <Link to="/donate" className="underline">try again</Link>.
          </Notice>
        )}
      </section>
    </>
  );
}
