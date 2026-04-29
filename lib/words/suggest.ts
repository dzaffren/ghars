import type { VerseWord } from "@/lib/qf/content-client";

// Common Quranic particles and function words to skip when picking suggestions
const PARTICLES = new Set([
  "وَ",
  "فِى",
  "فِي",
  "مِن",
  "مِنَ",
  "عَلَى",
  "عَلَيْ",
  "إِنَّ",
  "أَنَّ",
  "أَن",
  "لَا",
  "لَّا",
  "لِ",
  "بِ",
  "هُوَ",
  "هِيَ",
  "هُمْ",
  "هُنَّ",
  "أَنتَ",
  "أَنتُمْ",
  "هَٰذَا",
  "هَٰذِهِ",
  "ذَٰلِكَ",
  "الَّذِى",
  "الَّذِينَ",
  "مَا",
  "مَن",
]);

export interface WordSuggestion {
  position: number; // 1-based
  arabic: string;
  transliteration: string;
  meaning: string;
  reason: string;
}

export function heuristicSuggest(
  words: VerseWord[],
  limit = 2
): WordSuggestion[] {
  const results: WordSuggestion[] = [];
  for (let i = 0; i < words.length && results.length < limit; i++) {
    const w = words[i];
    if (!w.text_uthmani || PARTICLES.has(w.text_uthmani.trim())) continue;
    if (!w.translation) continue;
    results.push({
      position: i + 1,
      arabic: w.text_uthmani,
      transliteration: w.transliteration,
      meaning: w.translation,
      reason: "High-frequency Quranic root word",
    });
  }
  return results;
}
