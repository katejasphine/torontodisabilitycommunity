import { describe, expect, it } from "vitest";
import { buildImpactSummary, toPublicGifts, type ImpactTotals } from "./impact";
import { GENERAL_FUND } from "./site";

const none: ImpactTotals = {
  active_campaigns: 0,
  approved_requests: 0,
  online_raised_cad: 0,
  online_donation_count: 0,
  general_fund_raised_cad: 0,
  general_fund_donation_count: 0,
};

describe("impact figures", () => {
  it("keeps the organizer-reported $1,000 from 50 supporters and the $25,000 goal", () => {
    expect(GENERAL_FUND).toEqual({ goal: 25000, offlineRaised: 1000, offlineSupporters: 50 });
  });

  it("shows only the offline gifts when no online payments are confirmed", () => {
    const s = buildImpactSummary(none);
    expect(s.generalFund).toEqual({ goal: 25000, raised: 1000, supporters: 50 });
    expect(s.stats.find((x) => x.label === "Total funds raised")?.value).toBe(1000);
  });

  it("adds confirmed online gifts to the totals and supporter count", () => {
    const s = buildImpactSummary({ ...none, online_raised_cad: 75.5, online_donation_count: 3, general_fund_raised_cad: 25.5, general_fund_donation_count: 1 });
    expect(s.stats.find((x) => x.label === "Total funds raised")?.value).toBe(1075.5);
    expect(s.stats.find((x) => x.label === "Community supporters")?.value).toBe(53);
    expect(s.generalFund).toEqual({ goal: 25000, raised: 1025.5, supporters: 51 });
  });

  it("counts published campaigns and approved requests as reported", () => {
    const s = buildImpactSummary({ ...none, active_campaigns: 2, approved_requests: 4 });
    expect(s.stats.find((x) => x.label === "Active fundraising campaigns")?.value).toBe(2);
    expect(s.stats.find((x) => x.label === "Requests approved for support")?.value).toBe(4);
  });
});

describe("public gift list", () => {
  it("shows only the amount and date of each gift, never names or messages", () => {
    const gifts = toPublicGifts([
      { amount_cad: "25.00", completed_at: "2026-11-18T10:00:00Z", donor_display_name: "Jane", message: "hi" } as never,
    ]);
    expect(gifts).toEqual([{ amount_cad: 25, completed_at: "2026-11-18T10:00:00Z" }]);
  });

  it("lists the newest gift first and at most 50 gifts", () => {
    const rows = Array.from({ length: 60 }, (_, i) => ({ amount_cad: 10, completed_at: `2026-11-${String((i % 28) + 1).padStart(2, "0")}T00:00:${String(i % 60).padStart(2, "0")}Z` }));
    const gifts = toPublicGifts(rows);
    expect(gifts).toHaveLength(50);
    expect(gifts[0]!.completed_at >= gifts[49]!.completed_at).toBe(true);
  });

  it("skips gifts that haven't been confirmed yet", () => {
    expect(toPublicGifts([{ amount_cad: 10, completed_at: null }])).toEqual([]);
  });
});
