import { Info } from "lucide-react";
import type { ReactNode } from "react";

export function Notice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div role="note" className="flex gap-3 rounded-2xl border border-notice-foreground/20 bg-notice p-5 text-notice-foreground">
      <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <div>
        <p className="font-bold">{title}</p>
        <div className="mt-1 text-[0.95rem]">{children}</div>
      </div>
    </div>
  );
}

export function SampleBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-notice px-3 py-1 text-xs font-bold uppercase tracking-wide text-notice-foreground">
      Sample — not a real campaign
    </span>
  );
}
