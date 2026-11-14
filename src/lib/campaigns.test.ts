import { describe, expect, it } from "vitest";
import { allocationTotal, publishBlockers, summarizeDonations } from "./campaigns";

const verified = {
  identity_verified: true,
  verified_at: "2026-11-14T00:00:00Z",
  consent_given: true,
  consent_date: "2026-11-14",
};

describe("campaign publishing rules", () => {
  it("adds up the wheelchair appeal's proposed use of funds to its $5,000 goal", () => {
    const allocations = [{ amount_cad: 3500 }, { amount_cad: 700 }, { amount_cad: 500 }, { amount_cad: 300 }];
    expect(allocationTotal(allocations)).toBe(5000);
    expect(publishBlockers({ kind: "community_appeal", goal_cad: 5000, allocations, verification: null, consentFormCount: 0 })).toEqual([]);
  });

  it("blocks publishing when the use of funds doesn't match the goal", () => {
    const blockers = publishBlockers({ kind: "community_appeal", goal_cad: 7500, allocations: [{ amount_cad: 7000 }], verification: null, consentFormCount: 0 });
    expect(blockers).toHaveLength(1);
  });

  it("blocks an individual's story without verified identity and documented consent", () => {
    const blockers = publishBlockers({ kind: "individual", goal_cad: 100, allocations: [{ amount_cad: 100 }], verification: null, consentFormCount: 0 });
    expect(blockers).toHaveLength(3);
  });

  it("blocks an individual's story until the signed consent form is uploaded", () => {
    const base = { kind: "individual" as const, goal_cad: 100, allocations: [{ amount_cad: 100 }], verification: verified };
    expect(publishBlockers({ ...base, consentFormCount: 0 })).toEqual(["Upload the signed consent form."]);
    expect(publishBlockers({ ...base, consentFormCount: 1 })).toEqual([]);
  });
});

describe("donation totals", () => {
  it("counts only completed live payments", () => {
    const summary = summarizeDonations([
      { amount_cad: 25, status: "completed", environment: "live" },
      { amount_cad: 50, status: "completed", environment: "sandbox" },
      { amount_cad: 10, status: "pending", environment: "live" },
      { amount_cad: 100, status: "refunded", environment: "live" },
    ]);
    expect(summary).toEqual({ raised: 25, count: 1 });
  });
});
