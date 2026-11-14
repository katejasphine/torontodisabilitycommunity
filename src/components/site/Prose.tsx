import type { ReactNode } from "react";

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="container-page py-14">
      <div className="max-w-3xl space-y-5 text-lg text-foreground [&_h2]:mt-10 [&_h2]:text-3xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:ml-6 [&_li]:list-disc [&_ul]:space-y-2 [&_a]:underline [&_a]:underline-offset-4">
        {children}
      </div>
    </div>
  );
}
