import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { CHARGE_CURRENCIES, MAX_DONATION_CAD, MIN_DONATION_CAD, toChargeMinor } from "./donation";

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
});

/** Public: creates a pending gift and returns the Paystack checkout link. The gift only counts once Paystack confirms it. */
export const startDonation = createServerFn({ method: "POST" })
  .inputValidator((input: z.input<typeof startSchema>) => startSchema.parse(input))
  .handler(async ({ data }) => {
    const { getFxRates, initializeTransaction, PaystackError } = await import("./paystack.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let campaignId: string | null = null;
    if (data.fund !== "general") {
      const { data: c } = await supabaseAdmin.from("campaigns").select("id").eq("slug", data.fund).eq("status", "published").maybeSingle();
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

    const { data: row, error } = await supabaseAdmin
      .from("donations")
      .insert({
        campaign_id: campaignId,
        amount_cad: data.amountCad,
        status: "pending",
        provider: "paystack",
        is_anonymous: data.anonymous,
        donor_display_name: data.anonymous ? null : data.displayName || null,
        donor_message: data.message || null,
        charge_currency: data.currency,
        charge_amount_minor: chargeMinor,
        fx_rate_per_cad: rate,
        fx_rate_date: rates.updatedAt,
      })
      .select("id")
      .single();
    if (error || !row) {
      console.error("Couldn't create gift", error);
      return { ok: false as const, error: "We couldn't start your gift. Please try again." };
    }

    const origin = new URL(getRequest().url).origin;
    try {
      const tx = await initializeTransaction({
        email: data.email,
        amountMinor: chargeMinor,
        currency: data.currency,
        reference: row.id,
        callbackUrl: `${origin}/thank-you`,
        metadata: { fund: data.fund, amount_cad: data.amountCad, cancel_action: `${origin}/donate` },
      });
      return { ok: true as const, url: tx.authorization_url };
    } catch (e) {
      console.error("Paystack initialize failed", e);
      await supabaseAdmin.from("donations").update({ status: "failed" }).eq("id", row.id);
      const msg =
        e instanceof PaystackError && /currency/i.test(e.message)
          ? `Paystack can't take ${data.currency} payments on this account yet. Please choose the other currency.`
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
