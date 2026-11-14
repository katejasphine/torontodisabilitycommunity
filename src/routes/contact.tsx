import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/site/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { contactSchema } from "@/lib/assistance";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Toronto Disability Community Support" },
      { name: "description", content: "Get in touch with Toronto Disability Community Support about donations, campaigns, volunteering or accessibility." },
      { property: "og:title", content: "Contact Toronto Disability Community Support" },
      { property: "og:description", content: "Questions about donating, requesting support or partnering with us." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const parsed = contactSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const i of parsed.error.issues) next[String(i.path[0])] ??= i.message;
      setErrors(next);
      document.getElementById(`c-${Object.keys(next)[0]}`)?.focus();
      return;
    }
    setErrors({});
    setStatus("sending");
    const { error } = await supabase.from("contact_messages").insert(parsed.data);
    if (!error) form.reset();
    setStatus(error ? "failed" : "sent");
  }

  const fields = [
    { name: "name", label: "Your name", type: "text", auto: "name" },
    { name: "email", label: "Email address", type: "email", auto: "email" },
    { name: "subject", label: "Subject", type: "text", auto: "off" },
  ];

  return (
    <>
      <PageHeader eyebrow="Contact Us" title="We'd love to hear from you">
        <p>Questions about giving, requesting support, volunteering, or accessibility on this site — send us a note.</p>
      </PageHeader>
      <section className="container-page mt-12 max-w-2xl">
        <form onSubmit={onSubmit} noValidate className="space-y-6 rounded-3xl border border-border bg-card p-7 shadow-card md:p-10">
          {fields.map((f) => (
            <div key={f.name} className="space-y-2">
              <Label htmlFor={`c-${f.name}`} className="text-base font-bold">{f.label}</Label>
              <Input id={`c-${f.name}`} name={f.name} type={f.type} autoComplete={f.auto} className="min-h-12 text-base"
                aria-invalid={errors[f.name] ? true : undefined} aria-describedby={errors[f.name] ? `ce-${f.name}` : undefined} />
              {errors[f.name] && <p id={`ce-${f.name}`} className="font-bold text-destructive">{errors[f.name]}</p>}
            </div>
          ))}
          <div className="space-y-2">
            <Label htmlFor="c-message" className="text-base font-bold">Message</Label>
            <Textarea id="c-message" name="message" rows={6} maxLength={4000} className="text-base"
              aria-invalid={errors.message ? true : undefined} aria-describedby={errors.message ? "ce-message" : undefined} />
            {errors.message && <p id="ce-message" className="font-bold text-destructive">{errors.message}</p>}
          </div>
          <div aria-live="polite">
            {status === "sent" && <p className="font-bold text-success">Thank you — your message has been received.</p>}
            {status === "failed" && <p className="font-bold text-destructive">Sorry, your message couldn't be sent. Please try again.</p>}
          </div>
          <Button type="submit" size="lg" disabled={status === "sending"} className="w-full">
            {status === "sending" ? "Sending…" : "Send message"}
          </Button>
        </form>
      </section>
    </>
  );
}
