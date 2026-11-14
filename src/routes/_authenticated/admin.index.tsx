import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useId, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { NativeSelect } from "@/components/admin/fields";
import { supabase } from "@/integrations/supabase/client";
import { ASSISTANCE_TYPES } from "@/lib/assistance";
import { CAMPAIGN_KIND_LABELS, CAMPAIGN_STATUS_LABELS, categoryLabel, slugify, summarizeDonations, type CampaignKind } from "@/lib/campaigns";
import { formatCAD } from "@/lib/donation";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "campaigns"],
    queryFn: async () => {
      const [campaigns, donations] = await Promise.all([
        supabase.from("campaigns").select("id, slug, title, kind, status, category, goal_cad, updated_at").order("created_at"),
        supabase.from("donations").select("campaign_id, amount_cad, status, environment"),
      ]);
      if (campaigns.error) throw campaigns.error;
      if (donations.error) throw donations.error;
      return { campaigns: campaigns.data, donations: donations.data };
    },
  });

  if (isLoading) return <p className="text-muted-foreground">Loading campaigns…</p>;
  if (error || !data) return <p className="font-bold text-destructive">Couldn't load campaigns. Please refresh.</p>;

  const general = summarizeDonations(data.donations.filter((d) => d.campaign_id === null));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Campaigns</h1>
          <p className="mt-1 text-muted-foreground">
            General Community Fund (online, confirmed): {formatCAD(general.raised)} from {general.count} donations.
          </p>
        </div>
        <NewCampaignDialog />
      </div>
      <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-card">
        <table className="w-full min-w-[44rem] text-left">
          <caption className="sr-only">All campaigns, including hidden drafts</caption>
          <thead className="bg-secondary text-secondary-foreground">
            <tr>
              <th scope="col" className="px-4 py-3">Campaign</th>
              <th scope="col" className="px-4 py-3">Type</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3 text-right">Raised (live)</th>
              <th scope="col" className="px-4 py-3 text-right">Goal</th>
            </tr>
          </thead>
          <tbody>
            {data.campaigns.map((c) => {
              const s = summarizeDonations(data.donations.filter((d) => d.campaign_id === c.id));
              return (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <Link to="/admin/campaigns/$id" params={{ id: c.id }} className="font-bold text-primary underline underline-offset-4">
                      {c.title}
                    </Link>
                    <span className="block text-sm text-muted-foreground">{categoryLabel(c.category)}</span>
                  </td>
                  <td className="px-4 py-3">{CAMPAIGN_KIND_LABELS[c.kind]}</td>
                  <td className="px-4 py-3">{CAMPAIGN_STATUS_LABELS[c.status]}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatCAD(s.raised)} · {s.count}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatCAD(Number(c.goal_cad))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NewCampaignDialog() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ids = { title: useId(), name: useId(), kind: useId(), cat: useId(), goal: useId() };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const title = String(f.get("title") ?? "").trim();
    const goal = Number(f.get("goal"));
    if (!title || !Number.isFinite(goal) || goal <= 0) {
      toast.error("Please add a title and a goal above $0.");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase
      .from("campaigns")
      .insert({
        title,
        slug: `${slugify(title) || "campaign"}-${Math.random().toString(36).slice(2, 6)}`,
        beneficiary_display_name: String(f.get("name") ?? "").trim() || "To be confirmed",
        kind: f.get("kind") as CampaignKind,
        category: f.get("category") as (typeof ASSISTANCE_TYPES)[number]["value"],
        goal_cad: Math.round(goal * 100) / 100,
        story: "Story to be written.",
      })
      .select("id")
      .single();
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setOpen(false);
    navigate({ to: "/admin/campaigns/$id", params: { id: data.id } });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New draft campaign</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New draft campaign</DialogTitle>
          <DialogDescription>It stays hidden until you publish it.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={ids.title}>Campaign title</Label>
            <Input id={ids.title} name="title" required maxLength={160} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={ids.kind}>Type</Label>
            <NativeSelect id={ids.kind} name="kind" defaultValue="individual">
              <option value="individual">Real life story (one verified person)</option>
              <option value="community_appeal">Community appeal (a general need)</option>
            </NativeSelect>
          </div>
          <div className="space-y-2">
            <Label htmlFor={ids.name}>Beneficiary display name</Label>
            <Input id={ids.name} name="name" maxLength={80} placeholder="e.g. Daniel M." />
          </div>
          <div className="space-y-2">
            <Label htmlFor={ids.cat}>Category</Label>
            <NativeSelect id={ids.cat} name="category" defaultValue="mobility_equipment">
              {ASSISTANCE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </NativeSelect>
          </div>
          <div className="space-y-2">
            <Label htmlFor={ids.goal}>Fundraising goal (CAD)</Label>
            <Input id={ids.goal} name="goal" inputMode="decimal" required />
          </div>
          <Button type="submit" disabled={busy} className="w-full">{busy ? "Creating…" : "Create draft"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
