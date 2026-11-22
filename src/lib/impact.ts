import { GENERAL_FUND } from "./site";

/** Aggregate totals returned by the database (no personal details). */
export type ImpactTotals = {
  active_campaigns: number;
  approved_requests: number;
  online_raised_cad: number;
  online_donation_count: number;
  general_fund_raised_cad: number;
  general_fund_donation_count: number;
};

export type ImpactStat = { label: string; value: number; format: "number" | "currency" };

export type ImpactSummary = {
  stats: ImpactStat[];
  generalFund: { goal: number; raised: number; supporters: number };
  online: { raised: number; count: number };
};

const addCAD = (a: number, b: number) => (Math.round(a * 100) + Math.round(b * 100)) / 100;

/** Combines organizer-reported offline gifts with confirmed online records. */
export function buildImpactSummary(t: ImpactTotals, fund = GENERAL_FUND): ImpactSummary {
  return {
    stats: [
      { label: "Requests approved for support", value: t.approved_requests, format: "number" },
      { label: "Active fundraising campaigns", value: t.active_campaigns, format: "number" },
      { label: "Total funds raised", value: addCAD(fund.offlineRaised, t.online_raised_cad), format: "currency" },
      { label: "Community supporters", value: fund.offlineSupporters + t.online_donation_count, format: "number" },
    ],
    generalFund: {
      goal: fund.goal,
      raised: addCAD(fund.offlineRaised, t.general_fund_raised_cad),
      supporters: fund.offlineSupporters + t.general_fund_donation_count,
    },
    online: { raised: t.online_raised_cad, count: t.online_donation_count },
  };
}

/** One confirmed online gift as shown publicly: amount and date only, never who gave it. */
export type PublicGift = { amount_cad: number; completed_at: string };
export const RECENT_GIFTS_LIMIT = 50;

/** Keeps only the amount and date of each gift, newest first, capped at the public limit. */
export function toPublicGifts(rows: { amount_cad: number | string; completed_at: string | null }[]): PublicGift[] {
  return rows
    .filter((r): r is { amount_cad: number | string; completed_at: string } => !!r.completed_at)
    .map((r) => ({ amount_cad: Math.round(Number(r.amount_cad) * 100) / 100, completed_at: r.completed_at }))
    .sort((a, b) => b.completed_at.localeCompare(a.completed_at))
    .slice(0, RECENT_GIFTS_LIMIT);
}
