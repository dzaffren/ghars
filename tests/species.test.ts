import { describe, it, expect } from "vitest";
import { getSpeciesForRoot, ALL_SPECIES, Species } from "@/lib/words/species";

describe("getSpeciesForRoot", () => {
  it("returns 'palm' for mapped root r-z-q (provision)", () => {
    expect(getSpeciesForRoot("r-z-q")).toBe("palm");
  });

  it("returns 'olive' for mapped root n-w-r (light)", () => {
    expect(getSpeciesForRoot("n-w-r")).toBe("olive");
  });

  it("returns 'fig' for mapped root kh-l-q (create)", () => {
    expect(getSpeciesForRoot("kh-l-q")).toBe("fig");
  });

  it("returns 'pomegranate' for mapped root r-h-m (mercy)", () => {
    expect(getSpeciesForRoot("r-h-m")).toBe("pomegranate");
  });

  it("returns null for an unmapped root", () => {
    expect(getSpeciesForRoot("x-y-z")).toBeNull();
  });

  it("returns null when root is null", () => {
    expect(getSpeciesForRoot(null)).toBeNull();
  });

  it("returns null for empty string (not in map)", () => {
    expect(getSpeciesForRoot("")).toBeNull();
  });

  it("all returned values are valid species strings", () => {
    const roots = [
      "r-z-q",
      "n-w-r",
      "kh-l-q",
      "r-h-m",
      "sh-k-r",
      "h-d-y",
      "h-y-y",
      "t-w-b",
    ];
    for (const root of roots) {
      const species = getSpeciesForRoot(root);
      expect(species).not.toBeNull();
      expect(ALL_SPECIES).toContain(species as Species);
    }
  });
});

describe("ALL_SPECIES", () => {
  it("contains exactly the four species", () => {
    expect(ALL_SPECIES).toEqual(["olive", "palm", "fig", "pomegranate"]);
  });
});
