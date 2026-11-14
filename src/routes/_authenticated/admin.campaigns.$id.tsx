import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useId, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Trash2, Upload, FileText, CheckCircle2, CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, Section } from "@/components/admin/fields";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { ASSISTANCE_TYPES } from "@/lib/assistance";
import { CAMPAIGN_STATUS_LABELS, allocationTotal, publishBlockers, summarizeDonations } from "@/lib/campaigns";
import { formatCAD } from "@/lib/donation";

type DocKind = Database["public"]["Enums"]["campaign_document_kind"];
const DOC_KINDS: { value: DocKind; label: string }[] = [
  { value: "consent_form", label: "Signed consent form" },
  { value: "identity", label: "Identity verification" },
  { value: "quote_or_invoice", label: "Quote or invoice" },
  { value: "assessment", label: "Assessment or professional letter" },
  { value: "other", label: "Other supporting document" },
];
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const DOC_TYPES = ["application/pdf", ...PHOTO_TYPES];

export const Route = createFileRoute("/_authenticated/admin/campaigns/$id")({
  component: CampaignEditor,
});

function useCampaign(id: string) {
  return useQuery({
    queryKey: ["admin", "campaign", id],
    queryFn: async () => {
      const [c, a, v, d, don] = await Promise.all([
        supabase.from("campaigns").select("*").eq("id", id).single(),
        supabase.from("campaign_allocations").select("*").eq("campaign_id", id).order("sort_order"),
        supabase.from("campaign_verifications").select("*").eq("campaign_id", id).maybeSingle(),
        supabase.from("campaign_documents").select("*").eq("campaign_id", id).order("created_at", { ascending: false }),
        supabase.from("donations").select("*").eq("campaign_id", id).order("created_at", { ascending: false }).limit(200),
      ]);
      for (const r of [c, a, v, d, don]) if (r.error) throw r.error;
      return { campaign: c.data!, allocations: a.data!, verification: v.data, documents: d.data!, donations: don.data! };
    },
  });
}

function CampaignEditor() {
  const { id } = Route.useParams();
  const { data, isLoading, error } = useCampaign(id);
  const queryClient = useQueryClient();
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin"] });
    queryClient.invalidateQueries({ queryKey: ["campaigns"] });
  };

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (error || !data) return <p className="font-bold text-destructive">Couldn't load this campaign.</p>;

  const { campaign } = data;
  const blockers = publishBlockers({
    kind: campaign.kind,
    goal_cad: Number(campaign.goal_cad),
    allocations: data.allocations,
    verification: data.verification,
    consentFormCount: data.documents.filter((d) => d.kind === "consent_form").length,
  });

  async function setStatus(status: Database["public"]["Enums"]["campaign_status"]) {
    const { error } = await supabase.from("campaigns").update({ status }).eq("id", campaign.id);
    if (error) toast.error(error.message);
    else {
      toast.success(`Campaign is now ${CAMPAIGN_STATUS_LABELS[status].toLowerCase()}.`);
      refresh();
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/admin" className="text-sm font-bold text-primary underline">← All campaigns</Link>
          <h1 className="mt-2 text-3xl font-semibold">{campaign.title}</h1>
          <p className="mt-1 text-muted-foreground">Status: <strong>{CAMPAIGN_STATUS_LABELS[campaign.status]}</strong></p>
        </div>
        <div className="flex flex-wrap gap-2">
          {campaign.status !== "draft" && (
            <Button asChild variant="outline"><Link to="/campaigns/$slug" params={{ slug: campaign.slug }}>View public page</Link></Button>
          )}
          {campaign.status === "published" ? (
            <>
              <Button variant="outline" onClick={() => setStatus("draft")}>Hide (back to draft)</Button>
              <Button variant="outline" onClick={() => setStatus("closed")}>Close campaign</Button>
            </>
          ) : (
            <Button onClick={() => setStatus("published")} disabled={blockers.length > 0}>Publish</Button>
          )}
        </div>
      </div>

      <div role="status" className="rounded-2xl border border-border bg-paper p-5">
        {blockers.length === 0 ? (
          <p className="flex items-center gap-2 font-bold"><CheckCircle2 aria-hidden="true" className="size-5 text-primary" /> Ready to publish.</p>
        ) : (
          <>
            <p className="flex items-center gap-2 font-bold"><CircleAlert aria-hidden="true" className="size-5" /> Before this can be published:</p>
            <ul className="mt-2 ml-7 list-disc space-y-1">{blockers.map((b) => <li key={b}>{b}</li>)}</ul>
          </>
        )}
      </div>

      <DetailsForm campaign={campaign} onSaved={refresh} />
      <AllocationsEditor campaignId={campaign.id} goal={Number(campaign.goal_cad)} published={campaign.status === "published"} initial={data.allocations} onSaved={refresh} />
      {campaign.kind === "individual" && <VerificationForm campaignId={campaign.id} initial={data.verification} onSaved={refresh} />}
      <PhotoSection campaign={campaign} onSaved={refresh} />
      <DocumentsSection campaignId={campaign.id} documents={data.documents} onSaved={refresh} />
      <DonationsSection donations={data.donations} />
    </div>
  );
}

type CampaignRow = Database["public"]["Tables"]["campaigns"]["Row"];

function DetailsForm({ campaign, onSaved }: { campaign: CampaignRow; onSaved: () => void }) {
  const ids = { title: useId(), name: useId(), kind: useId(), cat: useId(), story: useId(), msg: useId(), goal: useId() };
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const goal = Number(f.get("goal"));
    if (!Number.isFinite(goal) || goal <= 0) { toast.error("Please enter a goal above $0."); return; }
    setBusy(true);
    const { error } = await supabase
      .from("campaigns")
      .update({
        title: String(f.get("title")).trim(),
        beneficiary_display_name: String(f.get("name")).trim(),
        kind: f.get("kind") as CampaignRow["kind"],
        category: f.get("category") as CampaignRow["category"],
        story: String(f.get("story")).trim(),
        campaign_message: String(f.get("message")).trim() || null,
        goal_cad: Math.round(goal * 100) / 100,
      })
      .eq("id", campaign.id);
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Campaign details saved.");
      onSaved();
    }
  }

  return (
    <Section title="Campaign details" description="Everything here is shown publicly once the campaign is published.">
      <form onSubmit={onSubmit} className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor={ids.title}>Campaign title</Label>
          <Input id={ids.title} name="title" required maxLength={160} defaultValue={campaign.title} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={ids.name}>Beneficiary display name</Label>
          <Input id={ids.name} name="name" required maxLength={80} defaultValue={campaign.beneficiary_display_name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={ids.kind}>Type</Label>
          <NativeSelect id={ids.kind} name="kind" defaultValue={campaign.kind}>
            <option value="individual">Real life story (one verified person)</option>
            <option value="community_appeal">Community appeal (a general need)</option>
          </NativeSelect>
        </div>
        <div className="space-y-2">
          <Label htmlFor={ids.cat}>Category</Label>
          <NativeSelect id={ids.cat} name="category" defaultValue={campaign.category}>
            {ASSISTANCE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </NativeSelect>
        </div>
        <div className="space-y-2">
          <Label htmlFor={ids.goal}>Fundraising goal (CAD)</Label>
          <Input id={ids.goal} name="goal" inputMode="decimal" required defaultValue={String(Number(campaign.goal_cad))} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor={ids.story}>Story</Label>
          <Textarea id={ids.story} name="story" required rows={8} maxLength={8000} defaultValue={campaign.story} />
          <p className="text-sm text-muted-foreground">Leave a blank line between paragraphs.</p>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor={ids.msg}>Campaign message (optional)</Label>
          <Input id={ids.msg} name="message" maxLength={500} defaultValue={campaign.campaign_message ?? ""} />
        </div>
        <div className="md:col-span-2">
          <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save details"}</Button>
        </div>
      </form>
    </Section>
  );
}

type AllocationRow = { label: string; amount: string };

function AllocationsEditor({ campaignId, goal, published, initial, onSaved }: {
  campaignId: string; goal: number; published: boolean;
  initial: { label: string; amount_cad: number }[]; onSaved: () => void;
}) {
  const [rows, setRows] = useState<AllocationRow[]>(() => initial.map((a) => ({ label: a.label, amount: String(Number(a.amount_cad)) })));
  const [busy, setBusy] = useState(false);
  const total = allocationTotal(rows.map((r) => ({ amount_cad: Number(r.amount) || 0 })));
  const matches = total === goal;

  async function save() {
    const clean = rows.filter((r) => r.label.trim() && Number(r.amount) > 0);
    if (published && !matches) { toast.error("A published campaign's use of funds must add up to its goal."); return; }
    setBusy(true);
    const del = await supabase.from("campaign_allocations").delete().eq("campaign_id", campaignId);
    const ins = del.error ? del : clean.length
      ? await supabase.from("campaign_allocations").insert(
          clean.map((r, i) => ({ campaign_id: campaignId, label: r.label.trim(), amount_cad: Math.round(Number(r.amount) * 100) / 100, sort_order: i + 1 })),
        )
      : { error: null };
    setBusy(false);
    if (ins.error) toast.error(ins.error.message);
    else {
      toast.success("Use of funds saved.");
      onSaved();
    }
  }

  return (
    <Section title="Proposed use of funds" description="Must add up exactly to the fundraising goal.">
      <div className="space-y-3">
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-[1fr_9rem_auto] items-end gap-3">
            <div className="space-y-1">
              <Label htmlFor={`alloc-label-${i}`} className={i === 0 ? "" : "sr-only"}>Item</Label>
              <Input id={`alloc-label-${i}`} value={r.label} maxLength={120} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`alloc-amt-${i}`} className={i === 0 ? "" : "sr-only"}>Amount (CAD)</Label>
              <Input id={`alloc-amt-${i}`} inputMode="decimal" value={r.amount} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, amount: e.target.value } : x)))} />
            </div>
            <Button variant="outline" size="icon" aria-label={`Remove ${r.label || "item"}`} onClick={() => setRows(rows.filter((_, j) => j !== i))}>
              <Trash2 aria-hidden="true" />
            </Button>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={() => setRows([...rows, { label: "", amount: "" }])}>Add item</Button>
        <p className={matches ? "font-bold" : "font-bold text-destructive"}>
          Total {formatCAD(total)} of {formatCAD(goal)} goal
        </p>
      </div>
      <Button className="mt-4" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save use of funds"}</Button>
    </Section>
  );
}

type VerificationRow = Database["public"]["Tables"]["campaign_verifications"]["Row"];

function VerificationForm({ campaignId, initial, onSaved }: { campaignId: string; initial: VerificationRow | null; onSaved: () => void }) {
  const ids = { legal: useId(), email: useId(), phone: useId(), method: useId(), notes: useId(), date: useId(), scope: useId() };
  const [identity, setIdentity] = useState(initial?.identity_verified ?? false);
  const [consent, setConsent] = useState(initial?.consent_given ?? false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const consentDate = String(f.get("consent_date") ?? "") || null;
    if (consent && !consentDate) { toast.error("Please add the date consent was given."); return; }
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    const stillVerified = identity && initial?.identity_verified && initial.verified_at;
    const { error } = await supabase.from("campaign_verifications").upsert({
      campaign_id: campaignId,
      legal_name: String(f.get("legal_name")).trim() || null,
      contact_email: String(f.get("contact_email")).trim() || null,
      contact_phone: String(f.get("contact_phone")).trim() || null,
      verification_method: String(f.get("method")).trim() || null,
      verification_notes: String(f.get("notes")).trim() || null,
      identity_verified: identity,
      verified_by: identity ? (stillVerified ? initial!.verified_by : u.user?.id ?? null) : null,
      verified_at: identity ? (stillVerified ? initial!.verified_at : new Date().toISOString()) : null,
      consent_given: consent,
      consent_date: consent ? consentDate : null,
      consent_scope: String(f.get("consent_scope")).trim() || null,
      updated_at: new Date().toISOString(),
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Verification details saved.");
      onSaved();
    }
  }

  return (
    <Section title="Verified beneficiary details (private)" description="Only organizers can see this. Never shown on the public site.">
      <form onSubmit={onSubmit} className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={ids.legal}>Legal name</Label>
          <Input id={ids.legal} name="legal_name" maxLength={160} defaultValue={initial?.legal_name ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={ids.email}>Contact email</Label>
          <Input id={ids.email} name="contact_email" type="email" maxLength={255} defaultValue={initial?.contact_email ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={ids.phone}>Contact phone</Label>
          <Input id={ids.phone} name="contact_phone" maxLength={40} defaultValue={initial?.contact_phone ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={ids.method}>How identity was verified</Label>
          <Input id={ids.method} name="method" maxLength={300} placeholder="e.g. Met in person, checked Ontario photo ID" defaultValue={initial?.verification_method ?? ""} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor={ids.notes}>Verification notes</Label>
          <Textarea id={ids.notes} name="notes" rows={3} maxLength={4000} defaultValue={initial?.verification_notes ?? ""} />
        </div>
        <label className="flex items-center gap-3 md:col-span-2">
          <input type="checkbox" checked={identity} onChange={(e) => setIdentity(e.target.checked)} className="size-5 accent-[var(--color-primary)]" />
          I have verified this person's identity and need
        </label>
        <label className="flex items-center gap-3 md:col-span-2">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="size-5 accent-[var(--color-primary)]" />
          The beneficiary has agreed in writing to share their story publicly
        </label>
        <div className="space-y-2">
          <Label htmlFor={ids.date}>Date consent was given</Label>
          <Input id={ids.date} name="consent_date" type="date" defaultValue={initial?.consent_date ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={ids.scope}>What they agreed to share</Label>
          <Input id={ids.scope} name="consent_scope" maxLength={1000} placeholder="e.g. First name, initial, story and photo" defaultValue={initial?.consent_scope ?? ""} />
        </div>
        {initial?.verified_at && (
          <p className="text-sm text-muted-foreground md:col-span-2">Verified on {new Date(initial.verified_at).toLocaleDateString("en-CA")}.</p>
        )}
        <div className="md:col-span-2">
          <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save verification"}</Button>
        </div>
      </form>
    </Section>
  );
}

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
}

function PhotoSection({ campaign, onSaved }: { campaign: CampaignRow; onSaved: () => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [alt, setAlt] = useState(campaign.photo_alt ?? "");
  const [busy, setBusy] = useState(false);
  const ids = { file: useId(), alt: useId() };

  useEffect(() => {
    let active = true;
    if (!campaign.photo_path) {
      setPreview(null);
      return undefined;
    }
    supabase.storage.from("campaign-photos").createSignedUrl(campaign.photo_path, 600).then(({ data }) => {
      if (active) setPreview(data?.signedUrl ?? null);
    });
    return () => { active = false; };
  }, [campaign.photo_path]);

  async function onUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = (new FormData(e.currentTarget).get("photo") as File | null);
    if (!file || file.size === 0) { toast.error("Choose a photo first."); return; }
    if (!PHOTO_TYPES.includes(file.type)) { toast.error("Photos must be JPG, PNG or WebP."); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Photos must be 10 MB or smaller."); return; }
    if (!alt.trim()) { toast.error("Please describe the photo for people using screen readers."); return; }
    setBusy(true);
    const path = `${campaign.id}/${crypto.randomUUID()}-${safeName(file.name)}`;
    const up = await supabase.storage.from("campaign-photos").upload(path, file, { contentType: file.type });
    if (up.error) {
      setBusy(false);
      { toast.error(up.error.message); return; }
    }
    const old = campaign.photo_path;
    const { error } = await supabase.from("campaigns").update({ photo_path: path, photo_alt: alt.trim() }).eq("id", campaign.id);
    if (!error && old && old.startsWith(`${campaign.id}/`)) await supabase.storage.from("campaign-photos").remove([old]);
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Photo saved.");
      (e.target as HTMLFormElement).reset();
      onSaved();
    }
  }

  async function saveAlt() {
    const { error } = await supabase.from("campaigns").update({ photo_alt: alt.trim() || null }).eq("id", campaign.id);
    if (error) toast.error(error.message);
    else { toast.success("Description saved."); onSaved(); }
  }

  return (
    <Section title="Beneficiary photo" description="Stored privately. Visitors can see it only while the campaign is published. Use only photos the person has agreed to share.">
      {preview && <img src={preview} alt={campaign.photo_alt ?? ""} className="mb-6 aspect-[16/10] w-full max-w-md rounded-2xl object-cover" />}
      <form onSubmit={onUpload} className="grid gap-4 md:max-w-xl">
        <div className="space-y-2">
          <Label htmlFor={ids.alt}>Photo description (for screen readers)</Label>
          <Input id={ids.alt} value={alt} maxLength={300} onChange={(e) => setAlt(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={ids.file}>{campaign.photo_path ? "Replace photo" : "Upload photo"}</Label>
          <Input id={ids.file} name="photo" type="file" accept={PHOTO_TYPES.join(",")} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={busy}><Upload aria-hidden="true" /> {busy ? "Uploading…" : "Upload photo"}</Button>
          {campaign.photo_path && <Button type="button" variant="outline" onClick={saveAlt}>Save description only</Button>}
        </div>
      </form>
    </Section>
  );
}

function DocumentsSection({ campaignId, documents, onSaved }: {
  campaignId: string; documents: Database["public"]["Tables"]["campaign_documents"]["Row"][]; onSaved: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const ids = { kind: useId(), file: useId() };

  async function onUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const file = f.get("doc") as File | null;
    if (!file || file.size === 0) { toast.error("Choose a file first."); return; }
    if (!DOC_TYPES.includes(file.type)) { toast.error("Documents must be PDF, JPG, PNG or WebP."); return; }
    if (file.size > 20 * 1024 * 1024) { toast.error("Documents must be 20 MB or smaller."); return; }
    setBusy(true);
    const path = `${campaignId}/${crypto.randomUUID()}-${safeName(file.name)}`;
    const up = await supabase.storage.from("campaign-documents").upload(path, file, { contentType: file.type });
    if (up.error) { setBusy(false); { toast.error(up.error.message); return; } }
    const { error } = await supabase.from("campaign_documents").insert({
      campaign_id: campaignId, kind: f.get("kind") as DocKind, file_path: path, file_name: file.name.slice(0, 255),
    });
    if (error) await supabase.storage.from("campaign-documents").remove([path]);
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Document uploaded."); form.reset(); onSaved(); }
  }

  async function open(path: string) {
    const { data, error } = await supabase.storage.from("campaign-documents").createSignedUrl(path, 60);
    if (error || !data) { toast.error("Couldn't open this document."); return; }
    window.open(data.signedUrl, "_blank", "noopener");
  }

  async function remove(doc: { id: string; file_path: string }) {
    const { error } = await supabase.from("campaign_documents").delete().eq("id", doc.id);
    if (error) { toast.error(error.message); return; }
    await supabase.storage.from("campaign-documents").remove([doc.file_path]);
    toast.success("Document removed.");
    onSaved();
  }

  return (
    <Section title="Consent and supporting documents (private)" description="Stored privately and never shown publicly. Links expire after one minute.">
      <form onSubmit={onUpload} className="grid gap-4 md:grid-cols-[14rem_1fr_auto] md:items-end">
        <div className="space-y-2">
          <Label htmlFor={ids.kind}>Document type</Label>
          <NativeSelect id={ids.kind} name="kind" defaultValue="consent_form">
            {DOC_KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
          </NativeSelect>
        </div>
        <div className="space-y-2">
          <Label htmlFor={ids.file}>File (PDF or image)</Label>
          <Input id={ids.file} name="doc" type="file" accept={DOC_TYPES.join(",")} />
        </div>
        <Button type="submit" disabled={busy}><Upload aria-hidden="true" /> {busy ? "Uploading…" : "Upload"}</Button>
      </form>
      {documents.length === 0 ? (
        <p className="mt-6 text-muted-foreground">No documents uploaded yet.</p>
      ) : (
        <ul className="mt-6 divide-y divide-border rounded-2xl border border-border">
          {documents.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <span className="flex items-center gap-3">
                <FileText aria-hidden="true" className="size-5 text-primary" />
                <span>
                  <span className="block font-bold">{d.file_name}</span>
                  <span className="block text-sm text-muted-foreground">
                    {DOC_KINDS.find((k) => k.value === d.kind)?.label} · {new Date(d.created_at).toLocaleDateString("en-CA")}
                  </span>
                </span>
              </span>
              <span className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => open(d.file_path)}>Open</Button>
                <Button variant="outline" size="sm" aria-label={`Delete ${d.file_name}`} onClick={() => remove(d)}><Trash2 aria-hidden="true" /></Button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

function DonationsSection({ donations }: { donations: Database["public"]["Tables"]["donations"]["Row"][] }) {
  const live = summarizeDonations(donations);
  return (
    <Section title="Donation records" description="Created automatically from payments confirmed by the payment provider. They can't be typed in by hand.">
      <p className="font-bold">Counted publicly: {formatCAD(live.raised)} from {live.count} confirmed live donations.</p>
      {donations.length === 0 ? (
        <p className="mt-4 text-muted-foreground">No donation records yet. They'll appear here once online payments are switched on.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left">
            <thead className="bg-secondary text-secondary-foreground">
              <tr>
                <th scope="col" className="px-3 py-2">Date</th>
                <th scope="col" className="px-3 py-2">Donor</th>
                <th scope="col" className="px-3 py-2">Status</th>
                <th scope="col" className="px-3 py-2">Mode</th>
                <th scope="col" className="px-3 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d.id} className="border-t border-border">
                  <td className="px-3 py-2">{new Date(d.created_at).toLocaleDateString("en-CA")}</td>
                  <td className="px-3 py-2">{d.is_anonymous ? "Anonymous" : d.donor_display_name ?? "—"}</td>
                  <td className="px-3 py-2 capitalize">{d.status}</td>
                  <td className="px-3 py-2">{d.environment === "live" ? "Live" : "Test"}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatCAD(Number(d.amount_cad))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  );
}
