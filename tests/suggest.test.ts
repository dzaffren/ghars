import { describe, it, expect } from "vitest";
import { heuristicSuggest } from "@/lib/words/suggest";
import type { VerseWord } from "@/lib/qf/content-client";

function makeWord(
  text_uthmani: string,
  translation: string,
  transliteration = ""
): VerseWord {
  return { text_uthmani, translation, transliteration };
}

describe("heuristicSuggest", () => {
  it("returns up to 2 non-particle words", () => {
    const words: VerseWord[] = [
      makeWord("ٱللَّهُ", "Allah", "Allah"),
      makeWord("رَبُّ", "Lord", "Rabbu"),
      makeWord("ٱلْعَٰلَمِينَ", "the worlds", "al-'alamin"),
    ];
    const result = heuristicSuggest(words);
    expect(result).toHaveLength(2);
    expect(result[0].position).toBe(1);
    expect(result[1].position).toBe(2);
  });

  it("skips words in the PARTICLES set", () => {
    const words: VerseWord[] = [
      makeWord("وَ", "and", "wa"),
      makeWord("مِن", "from", "min"),
      makeWord("ٱللَّهُ", "Allah", "Allah"),
    ];
    const result = heuristicSuggest(words);
    expect(result).toHaveLength(1);
    expect(result[0].arabic).toBe("ٱللَّهُ");
    expect(result[0].position).toBe(3);
  });

  it("returns empty array for empty input", () => {
    const result = heuristicSuggest([]);
    expect(result).toHaveLength(0);
  });

  it("positions are 1-based", () => {
    const words: VerseWord[] = [
      makeWord("كِتَٰبٌ", "book", "kitab"),
      makeWord("نُورٌ", "light", "nur"),
    ];
    const result = heuristicSuggest(words);
    expect(result[0].position).toBe(1);
    expect(result[1].position).toBe(2);
  });

  it("respects the limit parameter", () => {
    const words: VerseWord[] = [
      makeWord("كِتَٰبٌ", "book", "kitab"),
      makeWord("نُورٌ", "light", "nur"),
      makeWord("هُدًى", "guidance", "hudan"),
    ];
    const result = heuristicSuggest(words, 1);
    expect(result).toHaveLength(1);
    expect(result[0].position).toBe(1);
  });

  it("skips words without a translation", () => {
    const words: VerseWord[] = [
      makeWord("كِتَٰبٌ", "", "kitab"),
      makeWord("نُورٌ", "light", "nur"),
    ];
    const result = heuristicSuggest(words);
    expect(result).toHaveLength(1);
    expect(result[0].arabic).toBe("نُورٌ");
    expect(result[0].position).toBe(2);
  });

  it("populates all expected fields", () => {
    const words: VerseWord[] = [makeWord("نُورٌ", "light", "nur")];
    const result = heuristicSuggest(words);
    expect(result[0]).toMatchObject({
      position: 1,
      arabic: "نُورٌ",
      transliteration: "nur",
      meaning: "light",
      reason: "High-frequency Quranic root word",
    });
  });
});
