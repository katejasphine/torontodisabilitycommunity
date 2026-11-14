import { formatCAD } from "@/lib/donation";
import { IMPACT_STATS } from "@/lib/site";

export function ImpactStats() {
  return (
    <div>
      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {IMPACT_STATS.map((s) => (
          <div key={s.label} className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <dt className="text-sm text-muted-foreground">{s.label}</dt>
            <dd className="mt-2 font-display text-4xl font-semibold text-foreground">
              {s.format === "currency" ? formatCAD(s.value) : s.value.toLocaleString("en-CA")}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-sm text-muted-foreground">
        These figures show verified activity only. They read zero because we are just getting started — they
        will grow as real, confirmed donations and support are recorded.
      </p>
    </div>
  );
}
