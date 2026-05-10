import { describe, expect, it } from "vitest";

import {
  applyCheckIn,
  type ArcSpriteState,
  type AvatarState,
  type NarrativeArc,
  type Quest
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

function makeActiveQuest(current_step: number, avatar_state: AvatarState): Quest {
  return {
    id: "550e8400-e29b-41d4-a716-446655440000",
    user_id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    habit_name: "Test habit",
    arc_id: "test-arc",
    target_days: 30,
    started_at: "2026-05-01T12:00:00.000Z",
    current_step,
    avatar_state,
    status: "active",
    completed_at: null
  };
}

const defaultMilestones: NarrativeArc["milestones"] = [
  { atStep: 0, scene: "base-camp", label: "Base Camp" },
  { atStep: 10, scene: "treeline", label: "Above the Treeline" },
  { atStep: 20, scene: "ridge", label: "The Ridge" },
  { atStep: 30, scene: "summit", label: "Summit" }
];

describe("applyCheckIn", () => {
  const arc30 = makeArc({ totalSteps: 30, slipDistance: 3, milestones: defaultMilestones });

  it("done mid-quest delegates avatar transition to the daily-loop state machine", () => {
    const quest = makeActiveQuest(4, "idle");
    expect(applyCheckIn(quest, "done", arc30)).toEqual({
      nextStep: 5,
      nextAvatarState: "walking"
    });
  });

  it("done that reaches the summit sets celebrating", () => {
    const quest = makeActiveQuest(29, "walking");
    expect(applyCheckIn(quest, "done", arc30)).toEqual({
      nextStep: 30,
      nextAvatarState: "celebrating"
    });
  });

  it("done when already at the summit stays celebrating (clamped step still equals totalSteps)", () => {
    const quest = makeActiveQuest(30, "celebrating");
    expect(applyCheckIn(quest, "done", arc30)).toEqual({
      nextStep: 30,
      nextAvatarState: "celebrating"
    });
  });

  it("skipped delegates to the state machine (idle becomes resting)", () => {
    const quest = makeActiveQuest(12, "idle");
    expect(applyCheckIn(quest, "skipped", arc30)).toEqual({
      nextStep: 12,
      nextAvatarState: "resting"
    });
  });

  it("missed delegates to the state machine (idle becomes slipping)", () => {
    const quest = makeActiveQuest(12, "idle");
    expect(applyCheckIn(quest, "missed", arc30)).toEqual({
      nextStep: 10,
      nextAvatarState: "slipping"
    });
  });

  it("short arc: first done from step 0 reaches summit and celebrating", () => {
    const arc1 = makeArc({
      totalSteps: 1,
      slipDistance: 3,
      milestones: [{ atStep: 0, scene: "only", label: "Only" }]
    });
    const quest = makeActiveQuest(0, "idle");
    expect(applyCheckIn(quest, "done", arc1)).toEqual({
      nextStep: 1,
      nextAvatarState: "celebrating"
    });
  });

  it("done mid-quest preserves climbing from the state machine (not summit)", () => {
    const quest = makeActiveQuest(10, "climbing");
    expect(applyCheckIn(quest, "done", arc30)).toEqual({
      nextStep: 11,
      nextAvatarState: "climbing"
    });
  });

  it("skipped from walking still yields resting without touching summit logic", () => {
    const quest = makeActiveQuest(29, "walking");
    expect(applyCheckIn(quest, "skipped", arc30)).toEqual({
      nextStep: 29,
      nextAvatarState: "resting"
    });
  });
});
