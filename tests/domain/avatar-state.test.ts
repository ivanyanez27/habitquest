import { describe, expect, it } from "vitest";

import { nextAvatarState, type AvatarState, type QuestEvent } from "../../src/domain";

describe("nextAvatarState", () => {
  it("maps every daily-loop state and event combination deterministically", () => {
    const cases: {
      previousState: AvatarState;
      event: QuestEvent;
      expectedState: AvatarState;
    }[] = [
      { previousState: "idle", event: "done", expectedState: "walking" },
      { previousState: "idle", event: "skipped", expectedState: "resting" },
      { previousState: "idle", event: "missed", expectedState: "slipping" },
      { previousState: "walking", event: "done", expectedState: "walking" },
      { previousState: "walking", event: "skipped", expectedState: "resting" },
      { previousState: "walking", event: "missed", expectedState: "slipping" },
      { previousState: "climbing", event: "done", expectedState: "climbing" },
      { previousState: "climbing", event: "skipped", expectedState: "resting" },
      { previousState: "climbing", event: "missed", expectedState: "slipping" },
      { previousState: "slipping", event: "done", expectedState: "walking" },
      { previousState: "slipping", event: "skipped", expectedState: "resting" },
      { previousState: "slipping", event: "missed", expectedState: "slipping" },
      { previousState: "celebrating", event: "done", expectedState: "celebrating" },
      { previousState: "celebrating", event: "skipped", expectedState: "resting" },
      { previousState: "celebrating", event: "missed", expectedState: "slipping" },
      { previousState: "resting", event: "done", expectedState: "walking" },
      { previousState: "resting", event: "skipped", expectedState: "resting" },
      { previousState: "resting", event: "missed", expectedState: "slipping" }
    ];

    for (const testCase of cases) {
      expect(nextAvatarState(testCase.previousState, testCase.event)).toBe(testCase.expectedState);
    }
  });
});
