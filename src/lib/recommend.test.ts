import { describe, expect, it } from "vitest";
import { appealCatalog, GENERAL_FUND_ID, sanitizeRecommendations, storyCatalog, validateChallenge } from "./recommend";

const catalog = [
  ...storyCatalog(),
  ...appealCatalog([{ slug: "safer-more-accessible-home", title: "Creating a Safer and More Accessible Home", category: "Housing Accessibility", story: "..." }]),
];

describe("support matcher rules", () => {
  it("drops stories or appeals the AI made up", () => {
    const recs = sanitizeRecommendations(
      [
        { kind: "story", id: "sarah", reason: "Housing" },
        { kind: "story", id: "invented-person", reason: "x" },
        { kind: "appeal", id: "fake-appeal", reason: "x" },
      ],
      catalog,
    );
    expect(recs.map((r) => r.id)).toEqual(["sarah"]);
  });

  it("shows at most 4 suggestions and no duplicates", () => {
    const ids = ["sarah", "sarah", "kely", "michael", "emily", "daniel", "grace"];
    const recs = sanitizeRecommendations(ids.map((id) => ({ kind: "story", id, reason: "r" })), catalog);
    expect(recs.map((r) => r.id)).toEqual(["sarah", "kely", "michael", "emily"]);
  });

  it("always offers the General Community Fund as an appeal", () => {
    expect(appealCatalog([]).map((a) => a.id)).toEqual([GENERAL_FUND_ID]);
  });

  it("uses the real title, not one written by the AI", () => {
    const [rec] = sanitizeRecommendations([{ kind: "appeal", id: "safer-more-accessible-home", reason: "r" }], catalog);
    expect(rec?.title).toBe("Creating a Safer and More Accessible Home");
  });

  it("asks for 10 to 1,000 characters", () => {
    expect(validateChallenge("too short")).not.toBeNull();
    expect(validateChallenge("Getting around the city")).toBeNull();
    expect(validateChallenge("a".repeat(1001))).not.toBeNull();
  });
});
