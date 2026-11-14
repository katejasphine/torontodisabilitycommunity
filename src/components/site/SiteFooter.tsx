import { Link } from "@tanstack/react-router";
import { FOOTER_NAV, SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-navy-deep text-on-navy">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.2fr_2fr]">
        <div>
          <p className="font-display text-2xl font-semibold">{SITE.name}</p>
          <p className="mt-2 text-on-navy-muted">{SITE.tagline}</p>
          <p className="mt-6 max-w-sm text-on-navy-muted">
            A community initiative based in {SITE.location}. We are not a registered charity, and
            contributions are not tax-deductible.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 md:grid-cols-3">
            {FOOTER_NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="text-on-navy underline-offset-4 hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-on-navy/15">
        <p className="container-page py-6 text-sm text-on-navy-muted">
          © {new Date().getFullYear()} {SITE.name}. All amounts in Canadian dollars (CAD).
        </p>
      </div>
    </footer>
  );
}
