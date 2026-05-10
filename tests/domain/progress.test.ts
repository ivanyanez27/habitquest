import { describe, expect, it } from "vitest";

import {
  computeNextStep,
  type ArcSpriteState,
  type AvatarState,
  type NarrativeArc,
  type QuestEvent
} from "../../src/domain";

const spriteStates: Record<AvatarState, ArcSpriteState> = {
  idle: { frames: [0, 1], fps: 4 },
  walking: { frames: [2, 3, 4, 5], fps: 8 },
  climbing: { frames: [6, 7, 8, 9], fps: 8 },
  slipping: { frames: [10, 11], fps: 12 },
  celebrating: { frames: [12, 13], fps: 6 },
  resting: { frames: [14], fps: 1 }
};

function makeArc(
  partial: Pick<NarrativeArc, "totalSteps" | "milestones" | "slipDistance">
): NarrativeArc {
  return {
    id: "test-arc",
    name: "Test Arc",
    description: "Test description.",
    spriteSheet: "sprites/avatar.png",
    spriteStates,
    ...partial
  };
}

describe("computeNextStep", () => {
  const defaultArc = makeArc({
    totalSteps: 30,
    slipDistance: 3,
    milestones: [
      { atStep: 0, scene: "base-camp", label: "Base Camp" },
      { atStep: 10, scene: "treeline", label: "Above the Treeline" },
      { atStep: 20, scene: "ridge", label: "The Ridge" },
      { atStep: 30, scene: "summit", label: "Summit" }
    ]
  });

  it("done at step 0 advances by one", () => {
    expect(computeNextStep(0, "done", defaultArc)).toBe(1);
  });

  it("skipped at step 0 leaves step unchanged", () => {
    expect(computeNextStep(0, "skipped", defaultArc)).toBe(0);
  });

  it("missed at step 0 stays at 0 when milestone floor is 0", () => {
    expect(computeNextStep(0, "missed", defaultArc)).toBe(0);
  });

  it("done at summit stays at totalSteps (clamped)", () => {
    expect(computeNextStep(30, "done", defaultArc)).toBe(30);
  });

  it("done when already at totalSteps returns totalSteps (summit edge for applyCheckIn)", () => {
    const arc = makeArc({
      totalSteps: 30,
      slipDistance: 3,
      milestones: [{ atStep: 0, scene: "start", label: "Start" }]
    });
    expect(computeNextStep(30, "done", arc)).toBe(30);
  });

  it("skipped at summit leaves step unchanged", () => {
    expect(computeNextStep(30, "skipped", defaultArc)).toBe(30);
  });

  it("missed at summit slips back when milestone floor is below totalSteps", () => {
    const summitArc = makeArc({
      totalSteps: 30,
      slipDistance: 3,
      milestones: [
        { atStep: 0, scene: "base-camp", label: "Base Camp" },
        { atStep: 10, scene: "treeline", label: "Above the Treeline" },
        { atStep: 20, scene: "ridge", label: "The Ridge" }
      ]
    });
    expect(computeNextStep(30, "missed", summitArc)).toBe(27);
  });

  it("missed clamps slip at the current milestone scene start", () => {
    const arc = makeArc({
      totalSteps: 30,
      slipDistance: 3,
      milestones: [
        { atStep: 0, scene: "base-camp", label: "Base Camp" },
        { atStep: 10, scene: "treeline", label: "Above the Treeline" },
        { atStep: 20, scene: "ridge", label: "The Ridge" },
        { atStep: 30, scene: "summit", label: "Summit" }
      ]
    });
    expect(computeNextStep(12, "missed", arc)).toBe(10);
  });

  it("missed uses floor 0 when no milestone is at or below currentStep", () => {
    const arc = makeArc({
      totalSteps: 30,
      slipDistance: 3,
      milestones: [{ atStep: 10, scene: "treeline", label: "Above the Treeline" }]
    });
    expect(computeNextStep(2, "missed", arc)).toBe(0);
  });

  it("missed with no milestones uses floor 0", () => {
    const arc = makeArc({
      totalSteps: 30,
      slipDistance: 3,
      milestones: []
    });
    expect(computeNextStep(5, "missed", arc)).toBe(2);
  });

  it("missed with multiple milestones stops at the correct scene start", () => {
    const arc = makeArc({
      totalSteps: 40,
      slipDistance: 5,
      milestones: [
        { atStep: 0, scene: "a", label: "A" },
        { atStep: 10, scene: "b", label: "B" },
        { atStep: 20, scene: "c", label: "C" }
      ]
    });
    expect(computeNextStep(15, "missed", arc)).toBe(10);
  });

  it("computes milestone floor regardless of milestone array order", () => {
    const shuffled = makeArc({
      totalSteps: 30,
      slipDistance: 3,
      milestones: [
        { atStep: 20, scene: "ridge", label: "The Ridge" },
        { atStep: 0, scene: "base-camp", label: "Base Camp" },
        { atStep: 10, scene: "treeline", label: "Above the Treeline" },
        { atStep: 30, scene: "summit", label: "Summit" }
      ]
    });
    expect(computeNextStep(12, "missed", shuffled)).toBe(10);
  });

  it("covers all QuestEvent variants explicitly", () => {
    const events: QuestEvent[] = ["done", "skipped", "missed"];
    for (const event of events) {
      expect(typeof computeNextStep(5, event, defaultArc)).toBe("number");
    }
  });

  it("done advances toward totalSteps in the middle of the path", () => {
    expect(computeNextStep(29, "done", defaultArc)).toBe(30);
  });
});
