import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatCAD, formatCharge, type ChargeCurrency } from "@/lib/donation";
import { summarizeDonations } from "@/lib/campaigns";

export const Route = createFileRoute("/_authenticated/admin/gifts")({
  component: AdminGifts,
});

function AdminGifts() {
  const [showTest, setShowTest] = useState(true);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "gifts"],
    queryFn: async () => {
      const [gifts, campaigns] = await Promise.all([
        supabase
          .from("donations")
          .select("id, campaign_id, amount_cad, status, environment, completed_at, charge_currency, charge_amount_minor, fx_rate_per_cad, is_anonymous, donor_display_name, donor_message, provider_payment_id")
          .eq("status", "completed")
          .order("completed_at", { ascending: false })
          .limit(500),
        supabase.from("campaigns").select("id, title"),
      ]);
      if (gifts.error) throw gifts.error;
      if (campaigns.error) throw campaigns.error;
      return { gifts: gifts.data, titles: new Map(campaigns.data.map((c) => [c.id, c.title])) };
    },
  });

  if (isLoading) return <p className="text-muted-foreground">Loading gifts…</p>;
  if (error || !data) return <p className="font-bold text-destructive">Couldn't load gifts. Please refresh.</p>;

  const live = summarizeDonations(data.gifts);
  const testCount = data.gifts.filter((g) => g.environment !== "live").length;
  const rows = showTest ? data.gifts : data.gifts.filter((g) => g.environment === "live");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Gifts</h1>
        <p className="mt-1 text-muted-foreground">
          Verified by Paystack. Live: {formatCAD(live.raised)} from {live.count} gifts. Test gifts: {testCount} (never
          counted publicly).
        </p>
      </div>
      <label className="flex items-center gap-3">
        <input type="checkbox" checked={showTest} onChange={(e) => setShowTest(e.target.checked)} className="size-5 accent-[var(--color-primary)]" />
        Show test gifts
      </label>
      {rows.length === 0 ? (
        <p className="rounded-2xl bg-paper p-5">No verified gifts yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-card">
          <table className="w-full min-w-[60rem] text-left">
            <caption className="sr-only">Verified gifts, newest first</caption>
            <thead className="bg-secondary text-secondary-foreground">
              <tr>
                <th scope="col" className="px-4 py-3">Date</th>
                <th scope="col" className="px-4 py-3 text-right">Gift (CAD)</th>
                <th scope="col" className="px-4 py-3 text-right">Charged</th>
                <th scope="col" className="px-4 py-3">Fund</th>
                <th scope="col" className="px-4 py-3">Donor</th>
                <th scope="col" className="px-4 py-3">Message</th>
                <th scope="col" className="px-4 py-3">Mode</th>
                <th scope="col" className="px-4 py-3">Paystack reference</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((g) => (
                <tr key={g.id} className="border-t border-border align-top">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {g.completed_at ? new Date(g.completed_at).toLocaleString("en-CA", { timeZone: "America/Toronto", dateStyle: "medium", timeStyle: "short" }) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-bold">{formatCAD(Number(g.amount_cad))}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {g.charge_currency && g.charge_amount_minor ? formatCharge(Number(g.charge_amount_minor), g.charge_currency as ChargeCurrency) : "—"}
                  </td>
                  <td className="px-4 py-3">{g.campaign_id ? data.titles.get(g.campaign_id) ?? "Campaign" : "General Community Fund"}</td>
                  <td className="px-4 py-3">{g.is_anonymous ? "Anonymous" : g.donor_display_name || "—"}</td>
                  <td className="max-w-xs px-4 py-3 text-sm">{g.donor_message || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={g.environment === "live" ? "font-bold" : "rounded-full bg-notice px-2 py-0.5 text-sm text-notice-foreground"}>
                      {g.environment === "live" ? "Live" : "Test"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{g.provider_payment_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
