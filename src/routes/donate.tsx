import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { campaignsQuery } from "@/lib/campaigns.functions";
import { Lock } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Notice } from "@/components/site/Notice";
import { PageHeader } from "@/components/site/PageHeader";
import { PRESET_AMOUNTS_CAD, formatCAD, parseDonationAmount } from "@/lib/donation";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Donate — Toronto Disability Community Support" },
      { name: "description", content: "Give to the general community fund or a specific campaign supporting people living with disabilities in Toronto. Amounts in CAD." },
      { property: "og:title", content: "Donate — Toronto Disability Community Support" },
      { property: "og:description", content: "One-time gifts in Canadian dollars, processed securely by a payment provider." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { campaign?: string } =>
    typeof search["campaign"] === "string" && /^[a-z0-9-]{1,80}$/.test(search["campaign"]) ? { campaign: search["campaign"] } : {},
  loader: ({ context }) => context.queryClient.ensureQueryData(campaignsQuery()),
  component: Donate,
});

type Choice = number | "custom";

function Donate() {
  const { campaign: campaignParam } = Route.useSearch();
  const { data: campaigns } = useSuspenseQuery(campaignsQuery());
  const openCampaigns = campaigns.filter((c) => c.status === "published");
  const [fund, setFund] = useState<string>(
    openCampaigns.some((c) => c.slug === campaignParam) ? (campaignParam as string) : "general",
  );
  const [choice, setChoice] = useState<Choice>(50);
  const [custom, setCustom] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notReady, setNotReady] = useState(false);
  const ids = { custom: useId(), name: useId(), email: useId(), msg: useId(), err: useId() };

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setNotReady(false);
    if (choice === "custom") {
      const r = parseDonationAmount(custom);
      if (!r.ok) {
        setError(r.error);
        document.getElementById(ids.custom)?.focus();
        return;
      }
    }
    setError(null);
    setNotReady(true);
  }

  return (
    <>
      <PageHeader eyebrow="Donate" title="Give with confidence">
        <p>One-time gifts in Canadian dollars. Totals update only after a payment is confirmed by our payment provider.</p>
      </PageHeader>
      <section className="container-page mt-12 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <form onSubmit={onSubmit} noValidate className="space-y-8 rounded-3xl border border-border bg-card p-7 shadow-card md:p-10">
          <fieldset>
            <legend className="text-lg font-bold">Where your gift goes</legend>
            <div className="mt-3 space-y-3">
              <FundOption
                checked={fund === "general"}
                onSelect={() => setFund("general")}
                title="General Community Fund"
                detail="Pooled and shared across approved assistance requests."
              />
              {openCampaigns.map((c) => (
                <FundOption
                  key={c.slug}
                  checked={fund === c.slug}
                  onSelect={() => setFund(c.slug)}
                  title={c.title}
                  detail={`${formatCAD(c.raised_cad)} raised of ${formatCAD(c.goal_cad)}`}
                />
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-lg font-bold">Choose an amount (CAD)</legend>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {PRESET_AMOUNTS_CAD.map((amt) => (
                <AmountOption key={amt} label={formatCAD(amt)} checked={choice === amt} onSelect={() => setChoice(amt)} />
              ))}
              <AmountOption label="Custom" checked={choice === "custom"} onSelect={() => setChoice("custom")} />
            </div>
            {choice === "custom" && (
              <div className="mt-4 space-y-2">
                <Label htmlFor={ids.custom}>Custom amount in CAD</Label>
                <Input
                  id={ids.custom}
                  inputMode="decimal"
                  placeholder="e.g. 40"
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  aria-invalid={!!error}
                  aria-describedby={error ? ids.err : undefined}
                  className="min-h-12 text-base"
                />
                {error && <p id={ids.err} className="font-bold text-destructive">{error}</p>}
              </div>
            )}
          </fieldset>

          <div className="space-y-4">
            <label className="flex items-center gap-3 text-base">
              <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="size-5 accent-[var(--color-primary)]" />
              Give anonymously (your name won't be shown publicly)
            </label>
            {!anonymous && (
              <div className="space-y-2">
                <Label htmlFor={ids.name}>Name to display (optional)</Label>
                <Input id={ids.name} maxLength={80} autoComplete="name" className="min-h-12 text-base" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor={ids.email}>Email for your receipt</Label>
              <Input id={ids.email} type="email" maxLength={255} autoComplete="email" className="min-h-12 text-base" />
            </div>
            <div className="space-y-2">
              <Label htmlFor={ids.msg}>Message of encouragement (optional)</Label>
              <Textarea id={ids.msg} maxLength={500} rows={3} className="text-base" />
            </div>
          </div>

          <div>
            <Button type="submit" size="lg" className="w-full">
              <Lock aria-hidden="true" /> Continue to secure payment
            </Button>
            <div aria-live="polite" className="mt-4">
              {notReady && (
                <Notice title="Online payments aren't switched on yet">
                  We're setting up secure card payments with a payment provider. No money has been taken. Please check
                  back soon, or <Link to="/contact" className="underline">contact us</Link> to give another way.
                </Notice>
              )}
            </div>
          </div>
        </form>

        <aside className="space-y-6">
          <div className="rounded-3xl bg-secondary p-7">
            <h2 className="text-2xl font-semibold">Your card details stay safe</h2>
            <p className="mt-3 text-secondary-foreground">
              Card details are entered only on our payment provider's secure page. This site never sees or stores
              your card number.
            </p>
          </div>
          <div className="rounded-3xl bg-paper p-7">
            <h2 className="text-2xl font-semibold">Good to know</h2>
            <ul className="mt-3 space-y-2 text-muted-foreground [&_li]:ml-5 [&_li]:list-disc">
              <li>We are not a registered charity. Donations are not tax-deductible.</li>
              <li>Email receipts are sent for every confirmed gift.</li>
              <li>See exactly how funds are used on our <Link to="/transparency" className="underline">transparency page</Link>.</li>
            </ul>
          </div>
        </aside>
      </section>
    </>
  );
}

function AmountOption({ label, checked, onSelect }: { label: string; checked: boolean; onSelect: () => void }) {
  return (
    <label
      className={cn(
        "flex min-h-14 cursor-pointer items-center justify-center rounded-2xl border-2 text-lg font-bold transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-ring",
        checked ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary",
      )}
    >
      <input type="radio" name="amount" className="sr-only" checked={checked} onChange={onSelect} />
      {label}
    </label>
  );
}

function FundOption({ checked, onSelect, title, detail }: { checked: boolean; onSelect: () => void; title: string; detail: string }) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-ring",
        checked ? "border-primary bg-secondary" : "border-border bg-background hover:border-primary",
      )}
    >
      <input type="radio" name="fund" checked={checked} onChange={onSelect} className="mt-1 size-5 accent-[var(--color-primary)]" />
      <span>
        <span className="block font-bold">{title}</span>
        <span className="block text-sm text-muted-foreground">{detail}</span>
      </span>
    </label>
  );
}
