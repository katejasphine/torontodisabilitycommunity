import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function NativeSelect({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "flex min-h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-ring",
        className,
      )}
    />
  );
}

export function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-card md:p-8">
      <h2 className="text-2xl font-semibold">{title}</h2>
      {description && <p className="mt-1 text-muted-foreground">{description}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}
