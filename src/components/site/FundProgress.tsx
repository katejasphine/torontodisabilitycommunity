import { Progress } from "@/components/ui/progress";
import { formatCAD, progressPercent } from "@/lib/donation";

export function FundProgress({ raised, goal, supporters, label }: { raised: number; goal: number; supporters: number; label: string }) {
  const pct = progressPercent(raised, goal);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p>
          <span className="font-display text-2xl font-semibold text-foreground">{formatCAD(raised)}</span>{" "}
          <span className="text-muted-foreground">raised of {formatCAD(goal)}</span>
        </p>
        <p className="text-sm font-bold text-foreground">{pct}%</p>
      </div>
      <Progress value={pct} aria-label={`${label}: ${pct}% of goal reached`} className="mt-3 h-3 bg-secondary" />
      <p className="mt-2 text-sm text-muted-foreground">
        {supporters === 0 ? "No verified supporters yet" : `${supporters} verified supporters`}
      </p>
    </div>
  );
}
