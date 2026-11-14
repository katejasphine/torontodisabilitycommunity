import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <section className="bg-sky-wash border-b border-border">
      <div className="container-page py-14 md:py-20">
        {eyebrow && (
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-secondary-foreground">{eyebrow}</p>
        )}
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-foreground md:text-5xl">{title}</h1>
        {children && <div className="mt-5 max-w-2xl text-lg text-muted-foreground">{children}</div>}
      </div>
    </section>
  );
}
