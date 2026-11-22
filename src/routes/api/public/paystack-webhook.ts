import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const eventSchema = z.object({
  event: z.string().max(100),
  data: z.object({ reference: z.string().max(100) }).passthrough(),
});

/**
 * Paystack webhook. When PAYSTACK_SECRET_KEY is set, the x-paystack-signature header must match
 * (HMAC-SHA512 of the raw body); otherwise the request is rejected. Either way the gift is saved only
 * after the transaction is re-checked with Paystack's verification API.
 */
export const Route = createFileRoute("/api/public/paystack-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { confirmDonation, isValidPaystackSignature } = await import("@/lib/paystack.server");
        const raw = await request.text();
        const secret = process.env["PAYSTACK_SECRET_KEY"];
        if (secret && !(await isValidPaystackSignature(raw, request.headers.get("x-paystack-signature"), secret))) {
          return new Response("Invalid signature", { status: 401 });
        }
        let body: unknown = null;
        try {
          body = JSON.parse(raw);
        } catch {
          return new Response("ok", { status: 200 });
        }
        const parsed = eventSchema.safeParse(body);
        if (parsed.success && parsed.data.event === "charge.success") {
          await confirmDonation(parsed.data.data.reference);
        }
        return new Response("ok", { status: 200 });
      },
    },
  },
});
