import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useId, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/site/PageHeader";
import { Notice } from "@/components/site/Notice";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

function safeRedirect(value: unknown): string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "/admin";
}

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } =>
    typeof search.redirect === "string" ? { redirect: safeRedirect(search.redirect) } : {},
  head: () => ({
    meta: [
      { title: "Organizer sign-in — Toronto Disability Community Support" },
      { name: "description", content: "Sign-in for Toronto Disability Community Support organizers." },
      { property: "og:title", content: "Organizer sign-in" },
      { property: "og:description", content: "Sign-in for Toronto Disability Community Support organizers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const target = safeRedirect(search.redirect);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const ids = { email: useId(), password: useId() };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: target, replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) navigate({ to: target, replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate, target]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth` },
        });
        if (error) throw error;
        setCheckEmail(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/auth` });
    if (result.error) toast.error(result.error.message ?? "Google sign-in didn't work. Please try again.");
  }

  return (
    <>
      <PageHeader eyebrow="Organizers" title={mode === "signin" ? "Organizer sign-in" : "Create an organizer account"}>
        <p>For campaign organizers only. Donors don't need an account.</p>
      </PageHeader>
      <section className="container-page mt-12 max-w-xl">
        {checkEmail ? (
          <Notice title="Check your email">
            We sent a confirmation link to {email}. Click it to finish creating your account, then come back to sign in.
          </Notice>
        ) : (
          <div className="rounded-3xl border border-border bg-card p-7 shadow-card md:p-10">
            <Button type="button" variant="outline" size="lg" className="w-full" onClick={google}>
              Continue with Google
            </Button>
            <div className="my-6 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or use email <span className="h-px flex-1 bg-border" />
            </div>
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor={ids.email}>Email</Label>
                <Input id={ids.email} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="min-h-12 text-base" />
              </div>
              <div className="space-y-2">
                <Label htmlFor={ids.password}>Password</Label>
                <Input
                  id={ids.password}
                  type="password"
                  required
                  minLength={8}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="min-h-12 text-base"
                />
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={busy}>
                {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm">
              {mode === "signin" ? "First time here?" : "Already have an account?"}{" "}
              <button type="button" className="font-bold text-primary underline" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
                {mode === "signin" ? "Create an account" : "Sign in"}
              </button>
            </p>
          </div>
        )}
        <p className="mt-6 text-sm text-muted-foreground">
          <Link to="/" className="underline">Back to the home page</Link>
        </p>
      </section>
    </>
  );
}
