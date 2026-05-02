/**
 * Composite plant scene: a single SVG with every element present,
 * each annotated with growth-point thresholds. Elements appear
 * progressively as `growthPoints` rises — not in discrete stage swaps.
 *
 * See docs/specs/TBD-visual-refresh/spec-grove-week.md for the stage
 * thresholds (0/3/10/25/50). Elements' appearAt/fullAt fit inside those
 * bands so the product's stage names (Seed → Sprout → Small → Flowering
 * → Fruiting) still map cleanly onto the plant's visual state.
 */

export const STEM_GREEN = "#3a9c6e";
export const LEAF_MID = "#52b788";
export const LEAF_DARK = "#4f9472";
export const FLOWER_PETAL = "#fce8e0";
export const FLOWER_CENTER = "#f5c842";
export const FRUIT_GOLD = "#d4a017";
export const SOIL_COLOR = "#c8a97a";
export const SEED_COLOR = "#7a5430";

export type PlantElement =
  | { type: "soil" }
  | { type: "seed" }
  | {
      type: "stem";
      d: string;
      strokeWidth: number;
      appearAt: number;
      fullAt: number;
    }
  | {
      type: "leaf";
      cx: number;
      cy: number;
      rx: number;
      ry: number;
      rotate: number;
      fill: "mid" | "dark";
      appearAt: number;
      fullAt: number;
    }
  | {
      type: "bud";
      cx: number;
      cy: number;
      rx: number;
      ry: number;
      appearAt: number;
      fullAt: number;
    }
  | {
      type: "flower";
      cx: number;
      cy: number;
      small?: boolean;
      appearAt: number;
      fullAt: number;
    }
  | {
      type: "fruit";
      cx: number;
      cy: number;
      r: number;
      appearAt: number;
      fullAt: number;
    };

/**
 * All coordinates live on a 120×140 viewBox. Soil sits at y≈130;
 * the crown reaches y≈30 at full growth.
 */
export const PLANT_ELEMENTS: PlantElement[] = [
  { type: "soil" },
  { type: "seed" },

  // ── Lower stem: 0 → 10. Covers the bottom half of the trunk.
  {
    type: "stem",
    d: "M 60 128 Q 58 108 60 88",
    strokeWidth: 3,
    appearAt: 0,
    fullAt: 10,
  },

  // ── First (sprout) leaves: 0 → 3. Nestled close to the stem.
  {
    type: "leaf",
    cx: 48,
    cy: 98,
    rx: 11,
    ry: 6,
    rotate: -45,
    fill: "mid",
    appearAt: 0,
    fullAt: 3,
  },
  {
    type: "leaf",
    cx: 72,
    cy: 98,
    rx: 11,
    ry: 6,
    rotate: 45,
    fill: "mid",
    appearAt: 0,
    fullAt: 3,
  },

  // ── Lower branches: 3 → 10.
  {
    type: "stem",
    d: "M 60 116 Q 47 109 41 97",
    strokeWidth: 2.3,
    appearAt: 3,
    fullAt: 10,
  },
  {
    type: "stem",
    d: "M 60 102 Q 73 95 79 83",
    strokeWidth: 2.3,
    appearAt: 3,
    fullAt: 10,
  },

  // ── Lower branch-tip leaves: 3 → 10.
  {
    type: "leaf",
    cx: 40,
    cy: 94,
    rx: 15,
    ry: 8,
    rotate: -35,
    fill: "mid",
    appearAt: 3,
    fullAt: 10,
  },
  {
    type: "leaf",
    cx: 80,
    cy: 81,
    rx: 15,
    ry: 8,
    rotate: 30,
    fill: "mid",
    appearAt: 3,
    fullAt: 10,
  },

  // ── Upper stem: 10 → 25.
  {
    type: "stem",
    d: "M 60 88 Q 57 64 60 40",
    strokeWidth: 3,
    appearAt: 10,
    fullAt: 25,
  },

  // ── Upper branches: 10 → 25.
  {
    type: "stem",
    d: "M 60 78 Q 46 70 42 56",
    strokeWidth: 2.3,
    appearAt: 10,
    fullAt: 25,
  },
  {
    type: "stem",
    d: "M 60 66 Q 74 58 78 44",
    strokeWidth: 2.3,
    appearAt: 10,
    fullAt: 25,
  },

  // ── Upper leaves: 10 → 25. Darker tone to add canopy depth.
  {
    type: "leaf",
    cx: 42,
    cy: 54,
    rx: 12,
    ry: 7,
    rotate: -25,
    fill: "dark",
    appearAt: 10,
    fullAt: 25,
  },
  {
    type: "leaf",
    cx: 78,
    cy: 42,
    rx: 12,
    ry: 7,
    rotate: 25,
    fill: "dark",
    appearAt: 10,
    fullAt: 25,
  },

  // ── Top bud cluster: 18 → 25. Appears late inside the flowering band.
  { type: "bud", cx: 60, cy: 38, rx: 10, ry: 7, appearAt: 18, fullAt: 25 },

  // ── Flowers: bloom at the very end of the flowering stage.
  { type: "flower", cx: 42, cy: 53, appearAt: 22, fullAt: 25 },
  { type: "flower", cx: 78, cy: 41, appearAt: 23, fullAt: 25 },

  // ── Fruit: staggered across the fruiting band so they don't pop in together.
  { type: "fruit", cx: 37, cy: 83, r: 5, appearAt: 35, fullAt: 50 },
  { type: "fruit", cx: 83, cy: 71, r: 5, appearAt: 38, fullAt: 50 },
  { type: "fruit", cx: 60, cy: 36, r: 6, appearAt: 42, fullAt: 50 },
];

export function progressFor(
  appearAt: number,
  fullAt: number,
  growthPoints: number
): number {
  if (fullAt <= appearAt) return growthPoints >= fullAt ? 1 : 0;
  const t = (growthPoints - appearAt) / (fullAt - appearAt);
  return Math.max(0, Math.min(1, t));
}

export function seedOpacity(growthPoints: number): number {
  // Seed is at 100% at 0 pts and fades to 0 by 3 pts.
  return Math.max(0, Math.min(1, 1 - growthPoints / 3));
}
