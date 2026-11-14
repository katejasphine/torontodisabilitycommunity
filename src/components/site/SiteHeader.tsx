import { Link } from "@tanstack/react-router";
import { Menu, HeartHandshake } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MAIN_NAV, SITE } from "@/lib/site";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3 rounded-lg" aria-label={`${SITE.name} — home`}>
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
        <HeartHandshake aria-hidden="true" className="size-6" />
      </span>
      <span className="font-display text-lg leading-tight font-semibold text-foreground">
        Toronto Disability
        <span className="block text-sm font-sans font-normal text-muted-foreground">Community Support</span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <div className="container-page flex h-20 items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {MAIN_NAV.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="rounded-full px-3 py-2 text-[0.95rem] text-foreground hover:bg-secondary"
                  activeProps={{ className: "bg-secondary font-bold", "aria-current": "page" }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild variant="outline" size="sm">
            <Link to="/request-assistance">Request Assistance</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/donate">Donate Now</Link>
          </Button>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
              <Menu aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 bg-background">
            <SheetTitle className="font-display text-xl">Menu</SheetTitle>
            <nav aria-label="Mobile" className="mt-6">
              <ul className="flex flex-col gap-1">
                {MAIN_NAV.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="block rounded-xl px-4 py-3 text-lg hover:bg-secondary"
                      activeProps={{ className: "bg-secondary font-bold", "aria-current": "page" }}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-col gap-3">
                <Button asChild size="lg">
                  <Link to="/donate" onClick={() => setOpen(false)}>Donate Now</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/request-assistance" onClick={() => setOpen(false)}>Request Assistance</Link>
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
