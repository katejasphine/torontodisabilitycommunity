/** Rules for the "Find where to help" matcher. Kept pure so they can be tested. */
import { COMMUNITY_STORIES } from "./site";

export const CHALLENGE_MIN_CHARS = 10;
export const CHALLENGE_MAX_CHARS = 1000;
export const MAX_RECOMMENDATIONS = 4;
export const MAX_REASON_CHARS = 280;
/** Appeal id for the General Community Fund (always available, links to /donate). */
export const GENERAL_FUND_ID = "general-fund";

export type RecommendationKind = "story" | "appeal";

export type CatalogItem = {
  kind: RecommendationKind;
  id: string;
  title: string;
  /** Short text the model reads to judge relevance. */
  summary: string;
};

export type Recommendation = {
  kind: RecommendationKind;
  id: string;
  title: string;
  reason: string;
};

export type RecommendResult =
  | { ok: true; summary: string; recommendations: Recommendation[] }
  | { ok: false; error: string };

export function validateChallenge(text: string): string | null {
  const t = text.trim();
  if (t.length < CHALLENGE_MIN_CHARS) return `Please write at least ${CHALLENGE_MIN_CHARS} characters.`;
  if (t.length > CHALLENGE_MAX_CHARS) return `Please keep it under ${CHALLENGE_MAX_CHARS} characters.`;
  return null;
}

export function storyCatalog(): CatalogItem[] {
  return COMMUNITY_STORIES.map((s) => ({
    kind: "story" as const,
    id: s.id,
    title: s.title,
    summary: [...s.paragraphs.slice(0, 3), s.quote].join(" "),
  }));
}

export function appealCatalog(campaigns: { slug: string; title: string; category: string; story: string }[]): CatalogItem[] {
  return [
    ...campaigns.map((c) => ({
      kind: "appeal" as const,
      id: c.slug,
      title: c.title,
      summary: `${c.category}. ${c.story}`.slice(0, 700),
    })),
    {
      kind: "appeal" as const,
      id: GENERAL_FUND_ID,
      title: "General Community Fund",
      summary:
        "Shared fund for approved assistance requests of any kind: mobility, housing, transportation, food, technology, employment and more.",
    },
  ];
}

/**
 * Keeps only items that exist in the catalog (the model can't invent stories or appeals),
 * removes duplicates, trims reasons and caps the list. Titles always come from the catalog.
 */
export function sanitizeRecommendations(
  raw: { kind: string; id: string; reason: string }[],
  catalog: CatalogItem[],
): Recommendation[] {
  const byKey = new Map(catalog.map((c) => [`${c.kind}:${c.id}`, c]));
  const seen = new Set<string>();
  const out: Recommendation[] = [];
  for (const r of raw) {
    const key = `${r.kind}:${r.id}`;
    const item = byKey.get(key);
    if (!item || seen.has(key)) continue;
    seen.add(key);
    const reason = r.reason.trim();
    out.push({
      kind: item.kind,
      id: item.id,
      title: item.title,
      reason: reason.length > MAX_REASON_CHARS ? `${reason.slice(0, MAX_REASON_CHARS - 1).trimEnd()}…` : reason,
    });
    if (out.length >= MAX_RECOMMENDATIONS) break;
  }
  return out;
}
