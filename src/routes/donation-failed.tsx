import { createFileRoute, Link } from "@tanstack/react-router";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/donation-failed")({
  head: () => ({
    meta: [
      { title: "Payment Not Completed — Toronto Disability Community Support" },
      { name: "description", content: "Your donation payment wasn't completed. No money was taken." },
      { property: "og:title", content: "Payment not completed" },
      { property: "og:description", content: "Your donation payment wasn't completed. No money was taken." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { reason?: "cancelled" | "failed" } =>
    s["reason"] === "cancelled" || s["reason"] === "failed" ? { reason: s["reason"] } : {},
  component: DonationFailed,
});

function DonationFailed() {
  const { reason } = Route.useSearch();
  return (
    <>
      <PageHeader eyebrow="Donate" title="Your payment wasn't completed">
        <p>No gift was recorded and no money was taken.</p>
      </PageHeader>
      <section className="container-page mt-12 max-w-3xl">
        <div role="alert" className="rounded-3xl border border-border bg-card p-8 shadow-card">
          <XCircle aria-hidden="true" className="size-10 text-destructive" />
          <h2 className="mt-4 text-3xl font-semibold">
            {reason === "cancelled" ? "You cancelled the payment" : "The payment didn't go through"}
          </h2>
          <p className="mt-3 text-lg">
            {reason === "cancelled"
              ? "That's okay — you can come back and give whenever you're ready."
              : "Your bank or Paystack declined the payment. Please check your card details or try the other currency."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg"><Link to="/donate">Try again</Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/contact">Contact us</Link></Button>
          </div>
        </div>
      </section>
    </>
  );
}
