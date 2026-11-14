/** Campaign rules for Toronto Disability Community Support. Mirrors the database publish rules. */
import { ASSISTANCE_TYPES } from "./assistance";

export type CampaignKind = "individual" | "community_appeal";
export type CampaignStatus = "draft" | "published" | "closed";

export const CAMPAIGN_KIND_LABELS: Record<CampaignKind, string> = {
  individual: "Real life story",
  community_appeal: "Community appeal",
};

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: "Draft (hidden)",
  published: "Published",
  closed: "Closed",
};

export function categoryLabel(value: string): string {
  return ASSISTANCE_TYPES.find((t) => t.value === value)?.label ?? "Other approved needs";
}

/** Sum in cents to avoid floating-point drift, returned in dollars. */
export function allocationTotal(allocations: { amount_cad: number | string }[]): number {
  const cents = allocations.reduce((sum, a) => sum + Math.round(Number(a.amount_cad) * 100), 0);
  return cents / 100;
}

export type PublishInput = {
  kind: CampaignKind;
  goal_cad: number;
  allocations: { amount_cad: number | string }[];
  verification: {
    identity_verified: boolean;
    verified_at: string | null;
    consent_given: boolean;
    consent_date: string | null;
  } | null;
  consentFormCount: number;
};

/** Reasons a campaign can't be published yet. Empty means it can go live. */
export function publishBlockers(input: PublishInput): string[] {
  const blockers: string[] = [];
  if (input.kind === "individual") {
    const v = input.verification;
    if (!v || !v.identity_verified || !v.verified_at) blockers.push("Verify the beneficiary's identity.");
    if (!v || !v.consent_given || !v.consent_date) blockers.push("Record the beneficiary's consent and the date it was given.");
    if (input.consentFormCount === 0) blockers.push("Upload the signed consent form.");
  }
  if (allocationTotal(input.allocations) !== Number(input.goal_cad)) {
    blockers.push("The proposed use of funds must add up exactly to the goal.");
  }
  return blockers;
}

export type DonationRecord = {
  amount_cad: number | string;
  status: "pending" | "completed" | "refunded" | "failed";
  environment: string;
};

/** Public totals count only completed, live (real-money) payments. */
export function summarizeDonations(donations: DonationRecord[]): { raised: number; count: number } {
  const counted = donations.filter((d) => d.status === "completed" && d.environment === "live");
  return { raised: allocationTotal(counted), count: counted.length };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .slice(0, 80)
    .replace(/-+$/, "");
}
