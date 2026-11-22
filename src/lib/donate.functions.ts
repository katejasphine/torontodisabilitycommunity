import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { CHARGE_CURRENCIES, MAX_DONATION_CAD, MIN_DONATION_CAD, toChargeMinor } from "./donation";
import type { GiftMetadata } from "./paystack.server";

/** Today's market rates for 1 CAD in USD and NGN (for the donate page preview). */
export const getDonationRates = createServerFn({ method: "GET" }).handler(async () => {
  const { getFxRates } = await import("./paystack.server");
  try {
    return { ok: true as const, rates: await getFxRates() };
  } catch (e) {
    console.error(e);
    return { ok: false as const };
  }
});

export const donationRatesQuery = () =>
  queryOptions({ queryKey: ["donation-rates"], queryFn: () => getDonationRates(), staleTime: 10 * 60_000 });

const startSchema = z.object({
  fund: z.string().regex(/^(general|[a-z0-9-]{1,80})$/),
  amountCad: z
    .number()
    .min(MIN_DONATION_CAD)
    .max(MAX_DONATION_CAD)
    .refine((n) => Math.round(n * 100) === n * 100, "At most 2 decimal places"),
  currency: z.enum(CHARGE_CURRENCIES),
  email: z.string().trim().email().max(255),
  anonymous: z.boolean(),
  displayName: z.string().trim().max(80).nullable(),
  message: z.string().trim().max(500).nullable(),
  origin: z.string().max(200),
});

/** Public: starts a Paystack checkout. Nothing is saved until Paystack verifies the payment. */
export const startDonation = createServerFn({ method: "POST" })
  .inputValidator((input: z.input<typeof startSchema>) => startSchema.parse(input))
  .handler(async ({ data }) => {
    const { getFxRates, initializeTransaction, PaystackError, returnOrigin } = await import("./paystack.server");
    const { publicClient } = await import("./supabase-public.server");

    let campaignId: string | null = null;
    if (data.fund !== "general") {
      const { data: c } = await publicClient().from("campaigns").select("id").eq("slug", data.fund).eq("status", "published").maybeSingle();
      if (!c) return { ok: false as const, error: "That campaign isn't accepting gifts right now." };
      campaignId = c.id;
    }

    let rates;
    try {
      rates = await getFxRates();
    } catch (e) {
      console.error(e);
      return { ok: false as const, error: "We couldn't get today's exchange rate. Please try again in a few minutes." };
    }
    const rate = rates[data.currency];
    const chargeMinor = toChargeMinor(data.amountCad, rate);
    const origin = returnOrigin(data.origin);
    // Nothing is saved yet: the gift is stored only after Paystack verifies the payment.
    const metadata: GiftMetadata = {
      amount_cad: data.amountCad,
      campaign_id: campaignId,
      charge_currency: data.currency,
      charge_minor: chargeMinor,
      fx_rate_per_cad: rate,
      fx_rate_date: rates.updatedAt,
      anonymous: data.anonymous,
      display_name: data.anonymous ? null : data.displayName || null,
      message: data.message || null,
    };
    try {
      const tx = await initializeTransaction({
        email: data.email,
        amountMinor: chargeMinor,
        currency: data.currency,
        reference: `tdcs-${crypto.randomUUID()}`,
        callbackUrl: `${origin}/thank-you`,
        cancelUrl: `${origin}/donation-failed?reason=cancelled`,
        metadata,
      });
      return { ok: true as const, url: tx.authorization_url };
    } catch (e) {
      console.error("Paystack initialize failed", e);
      const msg =
        e instanceof PaystackError && (e.code === "unsupported_currency" || /currency/i.test(e.message))
          ? `Your Paystack account doesn't accept ${data.currency === "USD" ? "US dollar" : "naira"} payments yet. Please choose the other currency.`
          : "Our payment provider couldn't start the payment. Please try again.";
      return { ok: false as const, error: msg };
    }
  });

/** Public: checks a returning donor's payment with Paystack and confirms the gift. Returns no personal details. */
export const confirmDonationReturn = createServerFn({ method: "POST" })
  .inputValidator((input: { reference: string }) => z.object({ reference: z.string().min(1).max(100) }).parse(input))
  .handler(async ({ data }) => {
    const { confirmDonation } = await import("./paystack.server");
    try {
      return await confirmDonation(data.reference);
    } catch (e) {
      console.error(e);
      return { state: "pending" as const };
    }
  });
