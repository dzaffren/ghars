export type Species = "olive" | "palm" | "fig" | "pomegranate";

// Load and expose the root-to-species map
import rootToSpecies from "@/data/root-to-species.json";

export function getSpeciesForRoot(root: string | null): Species | null {
  if (!root) return null;
  const map = rootToSpecies as Record<string, Species>;
  return map[root] ?? null;
}

export const ALL_SPECIES: Species[] = ["olive", "palm", "fig", "pomegranate"];

export const MILESTONE_SPECIES: Record<number, Species> = {
  10: "olive",
  25: "palm",
  50: "fig",
  100: "pomegranate",
};

export const NEXT_THRESHOLD: Record<number, number> = {
  10: 25,
  25: 50,
  50: 100,
  100: 999,
};
