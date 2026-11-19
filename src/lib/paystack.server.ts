/** Paystack + exchange-rate helpers. Server-only: uses PAYSTACK_SECRET_KEY. */
import type { ChargeCurrency } from "./donation";

const PAYSTACK = "https://api.paystack.co";
const FX_URL = "https://open.er-api.com/v6/latest/CAD";

export function paystackKey(): string {
  const key = process.env["PAYSTACK_SECRET_KEY"];
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set");
  return key;
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

type PaystackResponse<T> = { status: boolean; message: string; data: T };

export async function initializeTransaction(input: {
  email: string;
  amountMinor: number;
  currency: ChargeCurrency;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
}): Promise<{ authorization_url: string; reference: string }> {
  const res = await fetch(`${PAYSTACK}/transaction/initialize`, {
    method: "POST",
    headers: { Authorization: `Bearer ${paystackKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: input.email,
      amount: input.amountMinor,
      currency: input.currency,
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    }),
  });
  const body = (await res.json().catch(() => null)) as PaystackResponse<{ authorization_url: string; reference: string }> | null;
  if (!res.ok || !body?.status) {
    throw new PaystackError(body?.message ?? `Paystack error ${res.status}`, res.status);
  }
  return body.data;
}

export type VerifiedTransaction = {
  id: number;
  status: string;
  reference: string;
  amount: number;
  currency: string;
  paid_at: string | null;
  domain: string;
};

export async function verifyTransaction(reference: string): Promise<VerifiedTransaction | null> {
  const res = await fetch(`${PAYSTACK}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${paystackKey()}` },
  });
  if (res.status === 404 || res.status === 400) return null;
  const body = (await res.json().catch(() => null)) as PaystackResponse<VerifiedTransaction> | null;
  if (!res.ok || !body?.status) throw new PaystackError(body?.message ?? `Paystack error ${res.status}`, res.status);
  return body.data;
}

export class PaystackError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

/** Paystack signs webhooks with HMAC-SHA512 of the raw body using the secret key. */
export async function isValidPaystackSignature(rawBody: string, signature: string | null): Promise<boolean> {
  if (!signature) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(paystackKey()), { name: "HMAC", hash: "SHA-512" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(rawBody)));
  const expected = Array.from(mac, (b) => b.toString(16).padStart(2, "0")).join("");
  const given = signature.trim().toLowerCase();
  if (given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ given.charCodeAt(i);
  return diff === 0;
}

export type ConfirmResult = { state: "completed" | "pending" | "failed" | "not_found"; amountCad?: number; chargeMinor?: number; chargeCurrency?: string };

/**
 * Marks a pending gift completed only when Paystack's verified record matches the exact amount and
 * currency we asked for. Safe to call repeatedly (webhook + return page).
 */
export async function confirmDonation(reference: string): Promise<ConfirmResult> {
  if (!/^[0-9a-f-]{36}$/i.test(reference)) return { state: "not_found" };
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: donation, error } = await supabaseAdmin
    .from("donations")
    .select("id, status, amount_cad, charge_amount_minor, charge_currency")
    .eq("id", reference)
    .maybeSingle();
  if (error) throw new Error(`Couldn't load gift: ${error.message}`);
  if (!donation) return { state: "not_found" };
  const base = { amountCad: Number(donation.amount_cad), chargeMinor: Number(donation.charge_amount_minor), chargeCurrency: donation.charge_currency ?? undefined };
  if (donation.status === "completed") return { state: "completed", ...base };
  if (donation.status !== "pending") return { state: "failed", ...base };

  const tx = await verifyTransaction(reference);
  if (!tx) return { state: "pending", ...base };
  if (tx.status === "failed" || tx.status === "abandoned" || tx.status === "reversed") {
    if (tx.status === "failed") {
      await supabaseAdmin.from("donations").update({ status: "failed" }).eq("id", reference).eq("status", "pending");
      return { state: "failed", ...base };
    }
    return { state: "pending", ...base };
  }
  if (tx.status !== "success") return { state: "pending", ...base };
  if (tx.amount !== Number(donation.charge_amount_minor) || tx.currency !== donation.charge_currency) {
    console.error("Paystack amount/currency mismatch for gift", reference);
    return { state: "pending", ...base };
  }
  const { error: updErr } = await supabaseAdmin
    .from("donations")
    .update({
      status: "completed",
      completed_at: tx.paid_at ?? new Date().toISOString(),
      provider_payment_id: `paystack_${tx.id}`,
      environment: tx.domain === "live" ? "live" : "sandbox",
    })
    .eq("id", reference)
    .eq("status", "pending");
  if (updErr) throw new Error(`Couldn't confirm gift: ${updErr.message}`);
  return { state: "completed", ...base };
}
