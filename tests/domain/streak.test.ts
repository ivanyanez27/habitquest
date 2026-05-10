import { describe, expect, it } from "vitest";

import { computeStreak } from "../../src/domain/streak";
import type { CheckIn } from "../../src/domain/quest";

const checkIn = (localDate: string, status: CheckIn["status"]): CheckIn => ({
  id: `check-in-${localDate}`,
  questId: "quest-1",
  localDate,
  status,
  createdAt: `${localDate}T08:00:00.000Z`
});

describe("computeStreak", () => {
  it("returns zero lengths when there are no check-ins", () => {
    expect(computeStreak([])).toEqual({ current: 0, longest: 0 });
  });

  it("counts chronological done runs and resets on skipped or missed days", () => {
    const result = computeStreak([
      checkIn("2026-05-03", "done"),
      checkIn("2026-05-01", "done"),
      checkIn("2026-05-02", "done"),
      checkIn("2026-05-04", "skipped"),
      checkIn("2026-05-05", "done"),
      checkIn("2026-05-06", "missed")
    ]);

    expect(result).toEqual({ current: 0, longest: 3 });
  });

  it("reports the active done run as the current streak", () => {
    const result = computeStreak([
      checkIn("2026-05-01", "missed"),
      checkIn("2026-05-02", "done"),
      checkIn("2026-05-03", "done")
    ]);

    expect(result).toEqual({ current: 2, longest: 2 });
  });
});
