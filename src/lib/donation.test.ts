import { describe, expect, it } from "vitest";
import { PRESET_AMOUNTS_CAD, parseDonationAmount, progressPercent } from "./donation";

describe("donation rules", () => {
  it("offers the preset amounts $10, $25, $50, $100 and $250 CAD", () => {
    expect([...PRESET_AMOUNTS_CAD]).toEqual([10, 25, 50, 100, 250]);
  });

  it("accepts a valid custom amount with cents", () => {
    expect(parseDonationAmount("40.50")).toEqual({ ok: true, amount: 40.5 });
  });

  it("rejects amounts that are not plain dollar values", () => {
    expect(parseDonationAmount("abc").ok).toBe(false);
    expect(parseDonationAmount("-5").ok).toBe(false);
  });

  it("caps the progress bar at 100%", () => {
    expect(progressPercent(150, 100)).toBe(100);
    expect(progressPercent(0, 4500)).toBe(0);
  });
});

describe("Paystack charge amounts", () => {
  it("only charges in US dollars or Nigerian naira", async () => {
    const { CHARGE_CURRENCIES } = await import("./donation");
    expect([...CHARGE_CURRENCIES]).toEqual(["USD", "NGN"]);
  });

  it("charges the market-rate equivalent of the CAD gift in cents or kobo", async () => {
    const { toChargeMinor } = await import("./donation");
    expect(toChargeMinor(50, 0.698247)).toBe(3491); // CAD $50 -> US$34.91
    expect(toChargeMinor(25, 952.21648)).toBe(2380541); // CAD $25 -> ₦23,805.41
  });
});
