import { describe, it, expect } from "vitest";
import { applyReview, SM2State } from "@/lib/words/sm2";

const FRESH: SM2State = { intervalDays: 1, easeFactor: 2.5, repetitions: 0 };

describe("applyReview – first review from fresh state", () => {
  it("again → interval=1, ease decreases by 0.20, repetitions=0", () => {
    const result = applyReview(FRESH, "again");
    expect(result.intervalDays).toBe(1);
    expect(result.easeFactor).toBeCloseTo(2.3);
    expect(result.repetitions).toBe(0);
    expect(result.status).toBe("learning");
  });

  it("hard → interval *= 1.2, ease decreases by 0.15, repetitions unchanged", () => {
    const result = applyReview(FRESH, "hard");
    expect(result.intervalDays).toBe(Math.round(1 * 1.2)); // 1
    expect(result.easeFactor).toBeCloseTo(2.35);
    expect(result.repetitions).toBe(0);
  });

  it("good (rep=0) → interval=1, ease unchanged, repetitions=1", () => {
    const result = applyReview(FRESH, "good");
    expect(result.intervalDays).toBe(1);
    expect(result.easeFactor).toBeCloseTo(2.5);
    expect(result.repetitions).toBe(1);
    expect(result.status).toBe("learning");
  });

  it("easy → interval = round(1 * 2.5 * 1.3), ease += 0.15, repetitions=1", () => {
    const result = applyReview(FRESH, "easy");
    expect(result.intervalDays).toBe(Math.round(1 * 2.5 * 1.3)); // 3
    expect(result.easeFactor).toBeCloseTo(2.65);
    expect(result.repetitions).toBe(1);
  });
});

describe("applyReview – second review after first good (rep=1, interval=1, ef=2.5)", () => {
  const afterFirstGood: SM2State = {
    intervalDays: 1,
    easeFactor: 2.5,
    repetitions: 1,
  };

  it("good (rep=1) → interval=6, repetitions=2", () => {
    const result = applyReview(afterFirstGood, "good");
    expect(result.intervalDays).toBe(6);
    expect(result.repetitions).toBe(2);
    expect(result.status).toBe("known");
  });

  it("easy (rep=1) → interval = round(1 * 2.5 * 1.3), repetitions=2", () => {
    const result = applyReview(afterFirstGood, "easy");
    expect(result.intervalDays).toBe(Math.round(1 * 2.5 * 1.3)); // 3
    expect(result.repetitions).toBe(2);
  });
});

describe("applyReview – again after 10 successful reviews", () => {
  it("resets repetitions to 0 and interval to 1", () => {
    const mature: SM2State = {
      intervalDays: 30,
      easeFactor: 2.5,
      repetitions: 10,
    };
    const result = applyReview(mature, "again");
    expect(result.repetitions).toBe(0);
    expect(result.intervalDays).toBe(1);
    expect(result.status).toBe("learning");
  });
});

describe("applyReview – ease_factor floor at 1.3", () => {
  it("ease never drops below 1.3 after repeated 'again'", () => {
    let state: SM2State = { intervalDays: 1, easeFactor: 1.3, repetitions: 0 };
    for (let i = 0; i < 10; i++) {
      const result = applyReview(state, "again");
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
      state = result;
    }
  });

  it("ease never drops below 1.3 after repeated 'hard'", () => {
    let state: SM2State = { intervalDays: 5, easeFactor: 1.3, repetitions: 5 };
    for (let i = 0; i < 5; i++) {
      const result = applyReview(state, "hard");
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
      state = result;
    }
  });
});

describe("applyReview – status transitions", () => {
  it("learning: fresh state stays learning after first good", () => {
    const result = applyReview(FRESH, "good");
    expect(result.status).toBe("learning");
  });

  it("known: rep>=1, interval>=3 → known", () => {
    // After easy from fresh: interval=3, reps=1 → known
    const result = applyReview(FRESH, "easy");
    expect(result.intervalDays).toBeGreaterThanOrEqual(3);
    expect(result.repetitions).toBeGreaterThanOrEqual(1);
    expect(result.status).toBe("known");
  });

  it("mature: rep>=3 AND interval>=21 → mature", () => {
    // Simulate a state that will hit mature on next good
    const nearMature: SM2State = {
      intervalDays: 9,
      easeFactor: 2.5,
      repetitions: 2,
    };
    // good from rep=2: interval = round(9 * 2.5) = 23, rep=3 → mature
    const result = applyReview(nearMature, "good");
    expect(result.repetitions).toBe(3);
    expect(result.intervalDays).toBeGreaterThanOrEqual(21);
    expect(result.status).toBe("mature");
    expect(result.becameMature).toBe(true);
  });

  it("becameMature is true when status is mature", () => {
    const nearMature: SM2State = {
      intervalDays: 9,
      easeFactor: 2.5,
      repetitions: 2,
    };
    const result = applyReview(nearMature, "good");
    expect(result.becameMature).toBe(true);
  });

  it("becameMature is false when not yet mature", () => {
    const result = applyReview(FRESH, "good");
    expect(result.becameMature).toBe(false);
  });

  it("becameMature is false when card is already mature", () => {
    const state: SM2State = {
      intervalDays: 30,
      easeFactor: 2.5,
      repetitions: 5,
    };
    const result = applyReview(state, "good", "mature");
    expect(result.becameMature).toBe(false);
    expect(result.status).toBe("mature");
  });

  it("not mature if rep>=3 but interval<21", () => {
    // rep=2, interval=1 → good gives rep=3, interval=round(1*2.5)=3 → known, not mature
    const state: SM2State = {
      intervalDays: 1,
      easeFactor: 2.5,
      repetitions: 2,
    };
    const result = applyReview(state, "good");
    expect(result.repetitions).toBe(3);
    expect(result.intervalDays).toBeLessThan(21);
    expect(result.status).not.toBe("mature");
    expect(result.becameMature).toBe(false);
  });
});

describe("applyReview – dueAt is in the future", () => {
  it("dueAt is approximately intervalDays from now", () => {
    const before = Date.now();
    const result = applyReview(FRESH, "good");
    const after = Date.now();
    const expectedMs = result.intervalDays * 24 * 60 * 60 * 1000;
    expect(result.dueAt.getTime()).toBeGreaterThanOrEqual(
      before + expectedMs - 100
    );
    expect(result.dueAt.getTime()).toBeLessThanOrEqual(
      after + expectedMs + 100
    );
  });
});
