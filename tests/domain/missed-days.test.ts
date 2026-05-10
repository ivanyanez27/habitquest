import { describe, expect, it } from "vitest";

import { resolveMissedDays } from "../../src/domain";
import type { CheckIn, Quest } from "../../src/domain";

function activeQuest(
  partial: Partial<Omit<Quest, "status" | "completed_at">> & { started_at: string }
): Quest {
  return {
    id: "quest-1",
    user_id: "user-1",
    habit_name: "Read",
    arc_id: "mount-aera",
    target_days: 30,
    current_step: 0,
    avatar_state: "idle",
    status: "active",
    completed_at: null,
    ...partial
  };
}

function checkIn(partial: Partial<CheckIn> & Pick<CheckIn, "local_date" | "status">): CheckIn {
  return {
    id: "check-in-id",
    quest_id: "quest-1",
    created_at: "2024-05-02T12:00:00.000Z",
    ...partial
  };
}

describe("resolveMissedDays", () => {
  it("when the quest starts on the user's local today, returns no synthetic rows", () => {
    const q = activeQuest({ started_at: "2024-06-01T15:00:00.000Z" });
    const today = new Date("2024-06-01T20:00:00.000Z");

    expect(resolveMissedDays(q, [], today, "America/New_York")).toEqual([]);
  });

  it("when the quest began three local days before today and there are no rows, returns three missed rows", () => {
    const q = activeQuest({ started_at: "2024-05-01T00:00:00.000Z" });
    const today = new Date("2024-05-04T12:00:00.000Z");

    const rows = resolveMissedDays(q, [], today, "UTC");

    expect(rows).toHaveLength(3);
    expect(rows.map((r) => r.local_date)).toEqual(["2024-05-01", "2024-05-02", "2024-05-03"]);
    rows.forEach((row) => {
      expect(row.quest_id).toBe("quest-1");
      expect(row.status).toBe("missed");
      expect("id" in row).toBe(false);
      expect("created_at" in row).toBe(false);
    });
  });

  it("when day two is done, skips that date but still misses days one and three", () => {
    const q = activeQuest({ started_at: "2024-05-01T00:00:00.000Z" });
    const today = new Date("2024-05-04T12:00:00.000Z");
    const existing = [checkIn({ local_date: "2024-05-02", status: "done" })];

    const rows = resolveMissedDays(q, existing, today, "UTC");

    expect(rows.map((r) => r.local_date).sort()).toEqual(["2024-05-01", "2024-05-03"]);
    rows.forEach((row) => expect(row.status).toBe("missed"));
  });

  it("when day two is skipped, treats it as occupied — still only misses days one and three", () => {
    const q = activeQuest({ started_at: "2024-05-01T00:00:00.000Z" });
    const today = new Date("2024-05-04T12:00:00.000Z");
    const existing = [checkIn({ local_date: "2024-05-02", status: "skipped" })];

    const rows = resolveMissedDays(q, existing, today, "UTC");

    expect(rows.map((r) => r.local_date).sort()).toEqual(["2024-05-01", "2024-05-03"]);
  });

  it("never emits the user's local calendar today, even with no prior check-ins", () => {
    const q = activeQuest({ started_at: "2024-05-01T00:00:00.000Z" });
    const today = new Date("2024-05-04T12:00:00.000Z");

    const rows = resolveMissedDays(q, [], today, "UTC");

    expect(rows.some((r) => r.local_date === "2024-05-04")).toBe(false);
  });

  it("uses Pacific/Auckland local dates so UTC calendar day can differ from the user's day", () => {
    const q = activeQuest({ started_at: "2024-05-08T12:00:00.000Z" });
    const today = new Date("2024-05-10T14:00:00.000Z");
    const tz = "Pacific/Auckland";

    const rows = resolveMissedDays(q, [], today, tz);

    expect(rows).toHaveLength(2);
    expect(rows.map((r) => r.local_date).sort()).toEqual(["2024-05-09", "2024-05-10"]);
    rows.forEach((row) => {
      expect(row.quest_id).toBe("quest-1");
      expect(row.status).toBe("missed");
    });
  });

  it("counts whole calendar days across a spring-forward DST boundary in America/Los_Angeles", () => {
    const q = activeQuest({ started_at: "2024-03-09T08:00:00.000Z" });
    const today = new Date("2024-03-12T08:00:00.000Z");
    const tz = "America/Los_Angeles";

    const rows = resolveMissedDays(q, [], today, tz);

    expect(rows).toHaveLength(3);
    expect(rows.map((r) => r.local_date).sort()).toEqual([
      "2024-03-09",
      "2024-03-10",
      "2024-03-11"
    ]);
  });

  it("ignores check-ins that belong to another quest", () => {
    const q = activeQuest({ id: "quest-a", started_at: "2024-05-01T00:00:00.000Z" });
    const today = new Date("2024-05-03T12:00:00.000Z");
    const existing = [
      checkIn({
        quest_id: "quest-b",
        local_date: "2024-05-01",
        status: "done"
      })
    ];

    const rows = resolveMissedDays(q, existing, today, "UTC");

    expect(rows).toHaveLength(2);
    expect(rows.every((r) => r.quest_id === "quest-a")).toBe(true);
    expect(rows.map((r) => r.local_date).sort()).toEqual(["2024-05-01", "2024-05-02"]);
  });

  it("returns no rows when every day in range already has a check-in", () => {
    const q = activeQuest({ started_at: "2024-05-01T00:00:00.000Z" });
    const today = new Date("2024-05-04T12:00:00.000Z");
    const existing = [
      checkIn({ local_date: "2024-05-01", status: "done" }),
      checkIn({ local_date: "2024-05-02", status: "skipped" }),
      checkIn({ local_date: "2024-05-03", status: "missed", id: "i1" })
    ];

    expect(resolveMissedDays(q, existing, today, "UTC")).toEqual([]);
  });

  it("returns no rows when started_at maps to a local calendar day after the user's today", () => {
    const q = activeQuest({ started_at: "2030-01-01T00:00:00.000Z" });
    const today = new Date("2024-06-01T12:00:00.000Z");

    expect(resolveMissedDays(q, [], today, "UTC")).toEqual([]);
  });

  it("treats an existing missed row as occupying that date", () => {
    const q = activeQuest({ started_at: "2024-05-01T00:00:00.000Z" });
    const today = new Date("2024-05-04T12:00:00.000Z");
    const existing = [checkIn({ local_date: "2024-05-02", status: "missed" })];

    const rows = resolveMissedDays(q, existing, today, "UTC");

    expect(rows.map((r) => r.local_date).sort()).toEqual(["2024-05-01", "2024-05-03"]);
  });
});
