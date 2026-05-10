import { describe, expect, it } from "vitest";

import { nextAvatarState } from "../../src/domain/avatar-state";
import type { AvatarState, QuestEvent } from "../../src/domain/quest";

describe("nextAvatarState", () => {
  it("maps each quest event to a deterministic avatar state", () => {
    const cases: Array<{
      previousState: AvatarState;
      event: QuestEvent;
      expectedState: AvatarState;
    }> = [
      { previousState: "idle", event: "done", expectedState: "walking" },
      { previousState: "walking", event: "done", expectedState: "walking" },
      { previousState: "climbing", event: "skipped", expectedState: "resting" },
      { previousState: "resting", event: "missed", expectedState: "slipping" },
      { previousState: "slipping", event: "completed", expectedState: "celebrating" }
    ];

    for (const testCase of cases) {
      expect(nextAvatarState(testCase.previousState, testCase.event)).toBe(
        testCase.expectedState
      );
    }
  });
});
