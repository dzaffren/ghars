/**
 * Guards on the LLM-generated answer.
 *
 * See docs/specs/TBD-answered-reflection/spec.md — Functional Requirements
 * (validation & business rules). Each guard returns `{ok: true}` or
 * `{ok: false, reason}` so a failed generation can be retried and logged
 * with a specific error code.
 */

export type ValidationFailure =
  | "AYAH_INSIGHT_LENGTH"
  | "AYAH_INSIGHT_SENTENCES"
  | "NOTICING_LENGTH"
  | "NOTICING_SENTENCES"
  | "NOTICING_NOT_SPECIFIC"
  | "NOTICING_BLOCKLIST"
  | "NOTICING_INSUFFICIENT";

export type ValidationResult =
  | { ok: true }
  | { ok: false; reason: ValidationFailure };

const AYAH_INSIGHT_MIN = 80;
const AYAH_INSIGHT_MAX = 360;
const NOTICING_MIN = 30;
const NOTICING_MAX = 180;

const BLOCKLIST = [
  "beautiful reflection",
  "meaningful reflection",
  "wonderful that you",
  "what a",
  "your reflection is",
];

const STOP_WORDS = new Set([
  "the",
  "and",
  "that",
  "with",
  "your",
  "this",
  "have",
  "was",
  "were",
  "for",
  "but",
  "not",
  "you",
  "about",
  "what",
  "which",
  "when",
  "where",
  "there",
  "their",
  "then",
  "from",
  "into",
  "they",
  "them",
  "been",
  "being",
  "just",
  "today",
  "also",
  "more",
  "only",
  "even",
  "some",
  "like",
]);

export function countSentences(s: string): number {
  return (s.match(/[.!?](\s|$)/g) ?? []).length;
}

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOP_WORDS.has(w));
}

export function hasSpecificOverlap(
  noticing: string,
  reflection: string
): boolean {
  const rWords = new Set(tokenize(reflection));
  for (const w of tokenize(noticing)) {
    if (rWords.has(w)) return true;
  }
  return false;
}

export function containsBlocklist(noticing: string): string | null {
  const low = noticing.toLowerCase();
  for (const phrase of BLOCKLIST) {
    if (low.includes(phrase)) return phrase;
  }
  return null;
}

export function validateAnswer(params: {
  ayahInsight: string;
  noticing: string;
  reflectionText: string;
}): ValidationResult {
  const { ayahInsight, noticing, reflectionText } = params;

  if (noticing.trim().toUpperCase() === "INSUFFICIENT") {
    return { ok: false, reason: "NOTICING_INSUFFICIENT" };
  }
  if (
    ayahInsight.length < AYAH_INSIGHT_MIN ||
    ayahInsight.length > AYAH_INSIGHT_MAX
  ) {
    return { ok: false, reason: "AYAH_INSIGHT_LENGTH" };
  }
  if (countSentences(ayahInsight) !== 2) {
    return { ok: false, reason: "AYAH_INSIGHT_SENTENCES" };
  }
  if (noticing.length < NOTICING_MIN || noticing.length > NOTICING_MAX) {
    return { ok: false, reason: "NOTICING_LENGTH" };
  }
  if (countSentences(noticing) !== 1) {
    return { ok: false, reason: "NOTICING_SENTENCES" };
  }
  if (containsBlocklist(noticing)) {
    return { ok: false, reason: "NOTICING_BLOCKLIST" };
  }
  if (!hasSpecificOverlap(noticing, reflectionText)) {
    return { ok: false, reason: "NOTICING_NOT_SPECIFIC" };
  }
  return { ok: true };
}
