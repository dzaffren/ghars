export type Rating = "again" | "hard" | "good" | "easy";

export interface SM2State {
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
}

export interface SM2Result extends SM2State {
  dueAt: Date;
  becameMature: boolean;
  status: "learning" | "known" | "mature";
}

const EASE_FLOOR = 1.3;

function deriveStatus(
  repetitions: number,
  intervalDays: number
): "learning" | "known" | "mature" {
  if (repetitions >= 3 && intervalDays >= 21) return "mature";
  if (repetitions >= 1 && intervalDays >= 3) return "known";
  return "learning";
}

export function applyReview(
  current: SM2State,
  rating: Rating,
  previousStatus: "learning" | "known" | "mature" = "learning"
): SM2Result {
  let { intervalDays, easeFactor, repetitions } = current;

  switch (rating) {
    case "again": {
      repetitions = 0;
      intervalDays = 1;
      easeFactor = Math.max(EASE_FLOOR, easeFactor - 0.2);
      break;
    }
    case "hard": {
      // Hard = recalled with difficulty; doesn't advance repetitions toward mature.
      // intervalDays still grows so the card isn't shown immediately again.
      intervalDays = Math.round(intervalDays * 1.2);
      easeFactor = Math.max(EASE_FLOOR, easeFactor - 0.15);
      // repetitions unchanged
      break;
    }
    case "good": {
      if (repetitions === 0) {
        intervalDays = 1;
      } else if (repetitions === 1) {
        intervalDays = 6;
      } else {
        intervalDays = Math.round(current.intervalDays * current.easeFactor);
      }
      // ease unchanged
      repetitions += 1;
      break;
    }
    case "easy": {
      intervalDays = Math.round(
        current.intervalDays * current.easeFactor * 1.3
      );
      easeFactor += 0.15;
      repetitions += 1;
      break;
    }
  }

  const status = deriveStatus(repetitions, intervalDays);
  const dueAt = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000);

  return {
    intervalDays,
    easeFactor,
    repetitions,
    dueAt,
    status,
    becameMature: status === "mature" && previousStatus !== "mature",
  };
}
