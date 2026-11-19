/** Donation rules for Toronto Disability Community Support. All amounts are Canadian dollars. */
export const CURRENCY = "CAD" as const;
export const PRESET_AMOUNTS_CAD = [10, 25, 50, 100, 250] as const;
export const MIN_DONATION_CAD = 1;
export const MAX_DONATION_CAD = 10000;

export type DonationAmountResult = { ok: true; amount: number } | { ok: false; error: string };

/** Validates a custom amount typed by a donor. Accepts up to 2 decimal places. */
export function parseDonationAmount(raw: string): DonationAmountResult {
  const trimmed = raw.trim().replace(/^\$/, "");
  if (trimmed === "") return { ok: false, error: "Please enter an amount." };
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return { ok: false, error: "Please enter a dollar amount, like 40 or 40.50." };
  }
  const amount = Number(trimmed);
  if (amount < MIN_DONATION_CAD) {
    return { ok: false, error: `The smallest donation is $${MIN_DONATION_CAD} CAD.` };
  }
  if (amount > MAX_DONATION_CAD) {
    return {
      ok: false,
      error: `For gifts over $${MAX_DONATION_CAD.toLocaleString("en-CA")} CAD, please contact us.`,
    };
  }
  return { ok: true, amount };
}

export function formatCAD(amount: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

/** Progress toward a goal as a 0–100 percentage. */
export function progressPercent(raised: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(100, Math.round((raised / goal) * 100));
}

/** Currencies Paystack charges donors in. Donors choose their gift in CAD; we charge the equivalent. */
export const CHARGE_CURRENCIES = ["USD", "NGN"] as const;
export type ChargeCurrency = (typeof CHARGE_CURRENCIES)[number];

/** Smallest unit Paystack expects: cents for USD, kobo for NGN (both 1/100). */
export function toChargeMinor(amountCad: number, ratePerCad: number): number {
  return Math.max(1, Math.round(amountCad * ratePerCad * 100));
}

export function formatCharge(minor: number, currency: ChargeCurrency): string {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency, currencyDisplay: "narrowSymbol" }).format(minor / 100);
}
