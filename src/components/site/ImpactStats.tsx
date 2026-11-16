import { formatCAD } from "@/lib/donation";
import type { ImpactStat } from "@/lib/impact";
import { GENERAL_FUND } from "@/lib/site";

export function ImpactStats({ stats }: { stats: ImpactStat[] }) {
  return (
    <div>
      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <dt className="text-sm text-muted-foreground">{s.label}</dt>
            <dd className="mt-2 font-display text-4xl font-semibold text-foreground">
              {s.format === "currency" ? formatCAD(s.value) : s.value.toLocaleString("en-CA")}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-sm text-muted-foreground">
        Updated automatically from our records. Funds raised and supporters include{" "}
        {formatCAD(GENERAL_FUND.offlineRaised)} from {GENERAL_FUND.offlineSupporters} supporters given before online
        giving opened, plus every confirmed online payment.
      </p>
    </div>
  );
}
