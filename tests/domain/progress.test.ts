import { describe, expect, it } from "vitest";

import { computeNextStep } from "../../src/domain/progress";
import type { NarrativeArc } from "../../src/domain/quest";

const mountAera: NarrativeArc = {
  id: "mount-aera",
  name: "Mount Aera",
  description: "A 30-day climb to the summit.",
  totalSteps: 30,
  milestones: [
    { atStep: 0, scene: "base-camp", label: "Base Camp" },
    { atStep: 10, scene: "treeline", label: "Above the Treeline" },
    { atStep: 20, scene: "ridge", label: "The Ridge" },
    { atStep: 30, scene: "summit", label: "Summit" }
  ],
  slipDistance: 3,
  spriteSheet: "sprites/avatar.png",
  spriteStates: {
    idle: { frames: [0, 1], fps: 4 },
    walking: { frames: [2, 3, 4, 5], fps: 8 },
    climbing: { frames: [6, 7, 8, 9], fps: 8 },
    slipping: { frames: [10, 11], fps: 12 },
    celebrating: { frames: [12, 13], fps: 6 },
    resting: { frames: [14], fps: 1 }
  }
};

describe("computeNextStep", () => {
  it("advances one step for a completed habit and clamps at the summit", () => {
    expect(computeNextStep(7, "done", mountAera)).toBe(8);
    expect(computeNextStep(30, "done", mountAera)).toBe(30);
  });

  it("keeps the same step when the user marks the habit skipped", () => {
    expect(computeNextStep(12, "skipped", mountAera)).toBe(12);
  });

  it("slips back by the arc distance without crossing the current milestone start", () => {
    expect(computeNextStep(15, "missed", mountAera)).toBe(12);
    expect(computeNextStep(11, "missed", mountAera)).toBe(10);
    expect(computeNextStep(2, "missed", mountAera)).toBe(0);
  });
});
