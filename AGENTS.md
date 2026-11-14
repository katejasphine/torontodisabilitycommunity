<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules
- Site content constants (nav, impact figures) live in `src/lib/site.ts`; donation rules in `src/lib/donation.ts`, campaign publish/count rules in `src/lib/campaigns.ts` (mirrored by a database trigger), with tests beside them — keeps numbers in one auditable place.
- Public form submissions insert directly from the browser into insert-only tables (no anon select) — submissions stay private to admins.
- Payments must use a hosted payment provider checkout; never collect or store card numbers in app code or the database.
- Campaigns live in the database, not code: public pages read only published rows via server functions with the publishable key; organizers edit through RLS-guarded admin pages under `_authenticated/admin` — one source of truth for totals and consent.
- Campaign photos and beneficiary documents live in private storage buckets; photos become readable only while their campaign is published, documents are admin-only — beneficiary privacy.
- Donation records are written only by trusted server code after the payment provider confirms; public totals count completed live payments only — prevents inflated or test figures.
