import { describe, expect, it } from "vitest";

import { resolveMissedDays } from "../../src/domain/progress";
import type { CheckIn, Quest } from "../../src/domain/quest";

const activeQuest: Quest = {
  id: "quest-1",
  userId: "user-1",
  habitName: "Read 30 minutes",
  arcId: "mount-aera",
  targetDays: 30,
  startedAt: "2026-05-01T08:00:00.000Z",
  completedAt: null,
  currentStep: 4,
  isActive: true
};

const checkIn = (localDate: string, status: CheckIn["status"]): CheckIn => ({
  id: `check-in-${localDate}`,
  questId: activeQuest.id,
  localDate,
  status,
  createdAt: `${localDate}T08:00:00.000Z`
});

describe("resolveMissedDays", () => {
  it("backfills missed days after the latest check-in and before today", () => {
    const missedDays = resolveMissedDays(
      activeQuest,
      [checkIn("2026-05-01", "done"), checkIn("2026-05-03", "skipped")],
      "2026-05-06"
    );

    expect(missedDays).toEqual([
      {
        questId: activeQuest.id,
        localDate: "2026-05-04",
        status: "missed"
      },
      {
        questId: activeQuest.id,
        localDate: "2026-05-05",
        status: "missed"
      }
    ]);
  });

  it("uses the quest start date when there are no previous check-ins", () => {
    expect(resolveMissedDays(activeQuest, [], "2026-05-03")).toEqual([
      {
        questId: activeQuest.id,
        localDate: "2026-05-02",
        status: "missed"
      }
    ]);
  });

  it("does not backfill today or completed quests", () => {
    expect(resolveMissedDays(activeQuest, [checkIn("2026-05-05", "done")], "2026-05-06")).toEqual(
      []
    );

    expect(
      resolveMissedDays({ ...activeQuest, completedAt: "2026-05-05T08:00:00.000Z" }, [], "2026-05-06")
    ).toEqual([]);
  });
});
