import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const eventSchema = z.object({
  event: z.string(),
  data: z.object({ reference: z.string().max(100) }).passthrough(),
});

export const Route = createFileRoute("/api/public/paystack-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { isValidPaystackSignature, confirmDonation } = await import("@/lib/paystack.server");
        const raw = await request.text();
        if (!(await isValidPaystackSignature(raw, request.headers.get("x-paystack-signature")))) {
          return new Response("Invalid signature", { status: 401 });
        }
        let parsed;
        try {
          parsed = eventSchema.parse(JSON.parse(raw));
        } catch {
          return new Response("Bad payload", { status: 400 });
        }
        if (parsed.event === "charge.success") {
          // Re-checks the transaction with Paystack before marking the gift completed.
          await confirmDonation(parsed.data.reference);
        }
        return new Response("ok");
      },
    },
  },
});
