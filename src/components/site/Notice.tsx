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
