/** Paystack (via the Lovable connector gateway) + exchange-rate helpers. Server-only. */
import { z } from "zod";
import { CHARGE_CURRENCIES, toChargeMinor, type ChargeCurrency } from "./donation";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/paystack";
const FX_URL = "https://open.er-api.com/v6/latest/CAD";

/** Calls Paystack through the Lovable connector gateway (the business's secret key never enters app code). */
async function paystack<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const connKey = process.env["PAYSTACK_CONNECTION_KEY"];
  if (!lovableKey || !connKey) throw new PaystackError("Paystack is not configured", 500);
  const res = await fetch(`${GATEWAY_URL}/${path}`, {
    method: init.method ?? "GET",
    headers: { Authorization: `Bearer ${lovableKey}`, "X-Connection-Api-Key": connKey, "Content-Type": "application/json" },
    ...(init.body ? { body: JSON.stringify(init.body) } : {}),
  });
  const payload = (await res.json().catch(() => null)) as { status?: boolean; message?: string; code?: string; data?: T } | null;
  if (!res.ok || !payload?.status) {
    throw new PaystackError(`Paystack ${path} failed [${res.status}]: ${payload?.message ?? "no response body"}`, res.status, payload?.code);
  }
  return payload.data as T;
}

const PUBLISHED_URL = "https://torontodisabilitycommunity.lovable.app";
const APP_HOSTS = ["torontodisabilitycommunity.lovable.app"];

/** Accepts only this site's own hosts for the post-payment return page; anything else falls back to the published site. */
export function returnOrigin(browserOrigin: string): string {
  if (!URL.canParse(browserOrigin)) return PUBLISHED_URL;
  const { protocol, hostname, origin } = new URL(browserOrigin);
  const projectId = process.env["__LOVABLE_PROJECT_ID"] ?? "";
  const previewHost = new RegExp(`^id-preview(-[a-z0-9]+)?--${projectId}(\\.[a-z0-9-]+)?\\.lovable\\.app$`);
  const ownHost = (projectId !== "" && previewHost.test(hostname)) || APP_HOSTS.includes(hostname) || hostname === `project--${projectId}.lovable.app`;
  return protocol === "https:" && ownHost ? origin : PUBLISHED_URL;
}

export type FxRates = { USD: number; NGN: number; updatedAt: string };

/** Market rates for 1 CAD, from ExchangeRate-API's open feed (updated daily). */
export async function getFxRates(): Promise<FxRates> {
  const res = await fetch(FX_URL, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`Exchange rates unavailable (${res.status})`);
  const body = (await res.json()) as { result?: string; time_last_update_unix?: number; rates?: Record<string, number> };
  const usd = body.rates?.["USD"];
  const ngn = body.rates?.["NGN"];
  if (body.result !== "success" || !(usd && usd > 0) || !(ngn && ngn > 0)) throw new Error("Exchange rates unavailable");
  return { USD: usd, NGN: ngn, updatedAt: new Date((body.time_last_update_unix ?? Date.now() / 1000) * 1000).toISOString() };
}

export async function initializeTransaction(input: {
  email: string;
  amountMinor: number;
  currency: ChargeCurrency;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
  cancelUrl: string;
}): Promise<{ authorization_url: string; reference: string }> {
  return paystack<{ authorization_url: string; reference: string }>("transaction/initialize", {
    method: "POST",
    body: {
      email: input.email,
      amount: input.amountMinor,
      currency: input.currency,
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: { ...input.metadata, cancel_action: input.cancelUrl },
    },
  });
}

export type VerifiedTransaction = {
  id: number;
  status: string;
  reference: string;
  amount: number;
  currency: string;
  paid_at: string | null;
  domain: string;
  metadata: unknown;
};

export async function verifyTransaction(reference: string): Promise<VerifiedTransaction | null> {
  try {
    return await paystack<VerifiedTransaction>(`transaction/verify/${encodeURIComponent(reference)}`);
  } catch (e) {
    if (e instanceof PaystackError && (e.code === "transaction_not_found" || e.status === 404 || e.status === 400)) return null;
    throw e;
  }
}

export class PaystackError extends Error {
  constructor(message: string, readonly status: number, readonly code?: string) {
    super(message);
  }
}

export type ConfirmResult = {
  state: "completed" | "pending" | "failed" | "not_found";
  amountCad?: number;
  chargeMinor?: number;
  chargeCurrency?: string | null;
};

/** Details we attach to the transaction at checkout; Paystack returns them on the verified record. */
const giftMetadataSchema = z.object({
  amount_cad: z.number().positive(),
  campaign_id: z.string().uuid().nullable(),
  charge_currency: z.enum(CHARGE_CURRENCIES),
  charge_minor: z.number().int().positive(),
  fx_rate_per_cad: z.number().positive(),
  fx_rate_date: z.string(),
  anonymous: z.boolean(),
  display_name: z.string().max(80).nullable(),
  message: z.string().max(500).nullable(),
});
export type GiftMetadata = z.infer<typeof giftMetadataSchema>;

export const REFERENCE_PATTERN = /^tdcs-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** Webhook signature: HMAC-SHA512 of the raw body with the Paystack secret key, compared in constant time. */
export async function isValidPaystackSignature(rawBody: string, signature: string | null, secret: string): Promise<boolean> {
  if (!signature) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-512" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(rawBody)));
  const expected = Array.from(mac, (b) => b.toString(16).padStart(2, "0")).join("");
  const given = signature.trim().toLowerCase();
  if (given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ given.charCodeAt(i);
  return diff === 0;
}

/**
 * Saves a gift only after Paystack's verification API says it succeeded and the verified amount and
 * currency match what this site asked for. Nothing is stored for unpaid, cancelled or failed payments.
 * Safe to call repeatedly (webhook + return page): the reference is unique in the database.
 */
export async function confirmDonation(reference: string): Promise<ConfirmResult> {
  if (!REFERENCE_PATTERN.test(reference)) return { state: "not_found" };
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const existing = await supabaseAdmin
    .from("donations")
    .select("amount_cad, charge_amount_minor, charge_currency")
    .eq("provider_payment_id", reference)
    .eq("status", "completed")
    .maybeSingle();
  if (existing.error) throw new Error(`Couldn't load gift: ${existing.error.message}`);
  if (existing.data) {
    return {
      state: "completed",
      amountCad: Number(existing.data.amount_cad),
      chargeMinor: Number(existing.data.charge_amount_minor),
      chargeCurrency: existing.data.charge_currency,
    };
  }

  const tx = await verifyTransaction(reference);
  if (!tx) return { state: "not_found" };
  const verdict = evaluateVerifiedPayment(tx);
  if (verdict.state !== "ok") return { state: verdict.state };
  const m = verdict.meta;

  const { error } = await supabaseAdmin.from("donations").insert({
    campaign_id: m.campaign_id,
    amount_cad: m.amount_cad,
    status: "completed",
    completed_at: tx.paid_at ?? new Date().toISOString(),
    environment: tx.domain === "live" ? "live" : "sandbox",
    provider: "paystack",
    provider_payment_id: reference,
    is_anonymous: m.anonymous,
    donor_display_name: m.anonymous ? null : m.display_name,
    donor_message: m.message,
    charge_currency: m.charge_currency,
    charge_amount_minor: m.charge_minor,
    fx_rate_per_cad: m.fx_rate_per_cad,
    fx_rate_date: m.fx_rate_date,
  });
  // 23505 = already saved by a concurrent confirmation (webhook and return page racing).
  if (error && error.code !== "23505") throw new Error(`Couldn't save gift: ${error.message}`);
  return { state: "completed", amountCad: m.amount_cad, chargeMinor: m.charge_minor, chargeCurrency: m.charge_currency };
}

/** Decides from Paystack's verified record whether a gift may be saved. Pure, so the rules are testable. */
export function evaluateVerifiedPayment(
  tx: Pick<VerifiedTransaction, "status" | "amount" | "currency" | "metadata">,
): { state: "ok"; meta: GiftMetadata } | { state: "failed" | "pending" } {
  if (tx.status === "failed" || tx.status === "reversed") return { state: "failed" };
  if (tx.status !== "success") return { state: "pending" };
  const rawMeta = typeof tx.metadata === "string" ? safeJson(tx.metadata) : tx.metadata;
  const meta = giftMetadataSchema.safeParse(rawMeta);
  if (!meta.success) {
    console.error("Verified Paystack payment has unexpected metadata");
    return { state: "pending" };
  }
  const m = meta.data;
  if (tx.currency !== m.charge_currency || tx.amount !== m.charge_minor || tx.amount !== toChargeMinor(m.amount_cad, m.fx_rate_per_cad)) {
    console.error("Paystack amount/currency mismatch");
    return { state: "pending" };
  }
  return { state: "ok", meta: m };
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
