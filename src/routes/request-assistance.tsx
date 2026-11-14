import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Notice } from "@/components/site/Notice";
import { PageHeader } from "@/components/site/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { ASSISTANCE_TYPES, assistanceSchema } from "@/lib/assistance";

export const Route = createFileRoute("/request-assistance")({
  head: () => ({
    meta: [
      { title: "Request Community Support — Toronto Disability Community Support" },
      { name: "description", content: "People living with disabilities in Toronto can apply privately for help with mobility equipment, transportation, housing accessibility and more." },
      { property: "og:title", content: "Request Community Support" },
      { property: "og:description", content: "Apply privately for disability-related support in Toronto." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RequestAssistance,
});

type Errors = Partial<Record<string, string>>;

const fieldCls = "min-h-12 text-base";

function RequestAssistance() {
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = assistanceSchema.safeParse({
      full_name: fd.get("full_name"),
      email: fd.get("email"),
      general_location: fd.get("general_location"),
      assistance_type: fd.get("assistance_type") || undefined,
      circumstances: fd.get("circumstances"),
      estimated_need_cad: fd.get("estimated_need_cad") || undefined,
      consent_given: fd.get("consent_given") === "on",
    });
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const k = String(issue.path[0]);
        if (!next[k]) next[k] = issue.message;
      }
      setErrors(next);
      const first = Object.keys(next)[0];
      document.getElementById(`f-${first}`)?.focus();
      return;
    }
    setErrors({});
    setStatus("sending");
    const d = parsed.data;
    const { error } = await supabase.from("assistance_requests").insert({
      full_name: d.full_name,
      email: d.email,
      general_location: d.general_location,
      assistance_type: d.assistance_type,
      circumstances: d.circumstances,
      estimated_need_cad: d.estimated_need_cad ? Number(d.estimated_need_cad) : null,
      consent_given: true,
    });
    setStatus(error ? "failed" : "sent");
  }

  if (status === "sent") {
    return (
      <>
        <PageHeader eyebrow="Request Assistance" title="Thank you — your request has been received" />
        <section className="container-page mt-12 max-w-2xl" aria-live="polite">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
            <CheckCircle2 aria-hidden="true" className="size-10 text-success" />
            <p className="mt-4 text-lg">
              Your request is private. Only our review team can see it. We'll reach out by email after we review
              it. Nothing about you is published unless you approve it.
            </p>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Request Assistance" title="Request Community Support">
        <p>If you live with a disability in Toronto or nearby, you can ask for help here. Your request stays private until our team reviews it, and nothing is published without your consent.</p>
      </PageHeader>
      <section className="container-page mt-12 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <form onSubmit={onSubmit} noValidate className="space-y-6 rounded-3xl border border-border bg-card p-7 shadow-card md:p-10">
          <p className="text-sm text-muted-foreground">All fields are required unless marked optional.</p>
          <Field id="full_name" label="Full name" error={errors.full_name}>
            <Input id="f-full_name" name="full_name" autoComplete="name" maxLength={120} className={fieldCls} {...aria("full_name", errors)} />
          </Field>
          <Field id="email" label="Email address" error={errors.email}>
            <Input id="f-email" name="email" type="email" autoComplete="email" maxLength={255} className={fieldCls} {...aria("email", errors)} />
          </Field>
          <Field id="general_location" label="General location" hint="Neighbourhood or city only, like Scarborough or Mississauga." error={errors.general_location}>
            <Input id="f-general_location" name="general_location" maxLength={120} className={fieldCls} {...aria("general_location", errors)} />
          </Field>
          <Field id="assistance_type" label="Type of support needed" error={errors.assistance_type}>
            <select id="f-assistance_type" name="assistance_type" defaultValue="" className="block min-h-12 w-full rounded-xl border border-input bg-background px-4 text-base" {...aria("assistance_type", errors)}>
              <option value="" disabled>Choose one…</option>
              {ASSISTANCE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>
          <Field id="circumstances" label="Tell us about your situation" hint="Share what you're comfortable with. You can write as much or as little as you like (at least 20 characters)." error={errors.circumstances}>
            <Textarea id="f-circumstances" name="circumstances" rows={6} maxLength={4000} className="text-base" {...aria("circumstances", errors)} />
          </Field>
          <Field id="estimated_need_cad" label="Estimated amount needed in CAD (optional)" error={errors.estimated_need_cad}>
            <Input id="f-estimated_need_cad" name="estimated_need_cad" inputMode="decimal" placeholder="e.g. 1200" className={fieldCls} {...aria("estimated_need_cad", errors)} />
          </Field>
          <div className="rounded-2xl bg-paper p-5">
            <label className="flex items-start gap-3">
              <input id="f-consent_given" name="consent_given" type="checkbox" className="mt-1 size-5 shrink-0 accent-[var(--color-primary)]" {...aria("consent_given", errors)} />
              <span>
                I agree that Toronto Disability Community Support may store and review this information to assess my
                request, as described in the privacy policy. I understand nothing will be published without my
                separate consent.
              </span>
            </label>
            {errors.consent_given && <p id="e-consent_given" className="mt-2 font-bold text-destructive">{errors.consent_given}</p>}
          </div>
          <div aria-live="polite">
            {status === "failed" && (
              <p className="mb-4 font-bold text-destructive">Sorry, your request couldn't be sent. Please try again in a moment.</p>
            )}
          </div>
          <Button type="submit" size="lg" disabled={status === "sending"} className="w-full">
            {status === "sending" ? "Sending…" : "Submit my request"}
          </Button>
        </form>
        <aside className="space-y-6">
          <Notice title="Documents and photos">
            Uploading supporting documents and photos is coming soon. For now, our team will ask by email if anything
            else is needed.
          </Notice>
          <div className="rounded-3xl bg-secondary p-7">
            <h2 className="text-2xl font-semibold">What happens next</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-secondary-foreground">
              <li>Our team reviews your request privately.</li>
              <li>We may contact you to ask a few questions.</li>
              <li>If approved, we agree together on whether to create a campaign or help from the community fund.</li>
            </ol>
          </div>
        </aside>
      </section>
    </>
  );
}

function aria(name: string, errors: Errors) {
  return { "aria-invalid": errors[name] ? true : undefined, "aria-describedby": errors[name] ? `e-${name}` : undefined };
}

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={`f-${id}`} className="text-base font-bold">{label}</Label>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      {children}
      {error && <p id={`e-${id}`} className="font-bold text-destructive">{error}</p>}
    </div>
  );
}
