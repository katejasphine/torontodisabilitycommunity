import { createFileRoute } from "@tanstack/react-router";

// Serves a campaign photo only while its campaign is published (enforced by storage policies).
export const Route = createFileRoute("/api/public/campaign-photo/$slug")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        if (!/^[a-z0-9-]{1,80}$/.test(params.slug)) return new Response("Not found", { status: 404 });
        const { publicClient } = await import("@/lib/supabase-public.server");
        const sb = publicClient();
        const { data: c } = await sb
          .from("campaigns")
          .select("photo_path")
          .eq("slug", params.slug)
          .in("status", ["published", "closed"])
          .maybeSingle();
        if (!c?.photo_path) return new Response("Not found", { status: 404 });
        const { data: file, error } = await sb.storage.from("campaign-photos").download(c.photo_path);
        if (error || !file) return new Response("Not found", { status: 404 });
        return new Response(file, {
          headers: {
            "content-type": file.type || "image/jpeg",
            "cache-control": "public, max-age=300",
            "x-content-type-options": "nosniff",
          },
        });
      },
    },
  },
});
