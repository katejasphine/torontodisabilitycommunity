import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/site/Notice";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Organizer dashboard — Toronto Disability Community Support" },
      { name: "description", content: "Manage campaigns, beneficiary verification and donation records." },
      { property: "og:title", content: "Organizer dashboard" },
      { property: "og:description", content: "Manage campaigns, beneficiary verification and donation records." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { user } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["is-admin", user.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      if (error) throw error;
      return data === true;
    },
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-secondary-foreground">Organizer dashboard</p>
          <p className="mt-1 text-muted-foreground">Signed in as {user.email}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm"><Link to="/admin">All campaigns</Link></Button>
          <Button asChild variant="outline" size="sm"><Link to="/admin/gifts">Gifts</Link></Button>
          <Button variant="outline" size="sm" onClick={signOut}>Sign out</Button>
        </div>
      </div>
      <div className="mt-8">
        {isLoading ? (
          <p className="text-muted-foreground">Checking your access…</p>
        ) : isAdmin ? (
          <Outlet />
        ) : (
          <Notice title="You don't have organizer access">
            Only the organizer's verified email address can manage campaigns. If this is your account, confirm your
            email address using the link we sent, then sign in again.
          </Notice>
        )}
      </div>
    </div>
  );
}
