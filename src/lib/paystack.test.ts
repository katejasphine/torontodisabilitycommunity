import { describe, expect, it } from "vitest";
import { evaluateVerifiedPayment, isValidPaystackSignature, REFERENCE_PATTERN } from "./paystack.server";

const meta = {
  amount_cad: 25,
  campaign_id: null,
  charge_currency: "NGN",
  charge_minor: 2380541,
  fx_rate_per_cad: 952.21648,
  fx_rate_date: "2026-11-19T00:02:31.000Z",
  anonymous: true,
  display_name: null,
  message: null,
};

describe("Paystack donation rules", () => {
  it("saves a gift only when Paystack says the payment succeeded", () => {
    expect(evaluateVerifiedPayment({ status: "success", amount: 2380541, currency: "NGN", metadata: meta }).state).toBe("ok");
    expect(evaluateVerifiedPayment({ status: "abandoned", amount: 2380541, currency: "NGN", metadata: meta }).state).toBe("pending");
    expect(evaluateVerifiedPayment({ status: "failed", amount: 2380541, currency: "NGN", metadata: meta }).state).toBe("failed");
  });

  it("refuses a payment whose verified amount or currency doesn't match the checkout", () => {
    expect(evaluateVerifiedPayment({ status: "success", amount: 100, currency: "NGN", metadata: meta }).state).toBe("pending");
    expect(evaluateVerifiedPayment({ status: "success", amount: 2380541, currency: "USD", metadata: meta }).state).toBe("pending");
    expect(evaluateVerifiedPayment({ status: "success", amount: 100, currency: "NGN", metadata: { ...meta, charge_minor: 100 } }).state).toBe("pending");
  });

  it("accepts only signatures made with the secret key", async () => {
    const body = '{"event":"charge.success"}';
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode("sk_test_x"), { name: "HMAC", hash: "SHA-512" }, false, ["sign"]);
    const sig = Array.from(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body))), (b) => b.toString(16).padStart(2, "0")).join("");
    expect(await isValidPaystackSignature(body, sig, "sk_test_x")).toBe(true);
    expect(await isValidPaystackSignature(body, sig, "sk_test_other")).toBe(false);
    expect(await isValidPaystackSignature(body, null, "sk_test_x")).toBe(false);
  });

  it("only looks up references this site created", () => {
    expect(REFERENCE_PATTERN.test("tdcs-123e4567-e89b-12d3-a456-426614174000")).toBe(true);
    expect(REFERENCE_PATTERN.test("someone-elses-ref")).toBe(false);
  });
});
