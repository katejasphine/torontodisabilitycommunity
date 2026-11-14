import { describe, expect, it } from "vitest";
import { PRESET_AMOUNTS_CAD, parseDonationAmount, progressPercent } from "./donation";
import { IMPACT_STATS } from "./site";

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

describe("no invented figures", () => {
  it("shows zero for every impact statistic until real data exists", () => {
    expect(IMPACT_STATS.every((s) => s.value === 0)).toBe(true);
  });
});
