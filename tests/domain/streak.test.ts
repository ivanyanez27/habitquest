import { describe, expect, it } from "vitest";

import { computeStreak, type CheckIn } from "../../src/domain";

function fixture(
  overrides: Pick<CheckIn, "local_date" | "status" | "id"> &
    Partial<Omit<CheckIn, "local_date" | "status" | "id">>
): CheckIn {
  return {
    quest_id: "quest-1",
    created_at: "2024-01-01T12:00:00Z",
    ...overrides
  };
}

describe("computeStreak", () => {
  it("returns zeros for an empty list", () => {
    expect(computeStreak([])).toEqual({ current: 0, longest: 0 });
  });

  it("counts a single done as current and longest of 1", () => {
    expect(computeStreak([fixture({ id: "a", local_date: "2024-06-01", status: "done" })])).toEqual(
      {
        current: 1,
        longest: 1
      }
    );
  });

  it("treats a single skipped as no streak", () => {
    expect(
      computeStreak([fixture({ id: "a", local_date: "2024-06-01", status: "skipped" })])
    ).toEqual({
      current: 0,
      longest: 0
    });
  });

  it("treats a single missed as no streak", () => {
    expect(
      computeStreak([fixture({ id: "a", local_date: "2024-06-01", status: "missed" })])
    ).toEqual({
      current: 0,
      longest: 0
    });
  });

  it("extends current and longest across a long run of dones", () => {
    const checkIns = Array.from({ length: 7 }, (_, i) =>
      fixture({
        id: `d${i}`,
        local_date: `2024-06-${String(i + 1).padStart(2, "0")}`,
        status: "done"
      })
    );
    expect(computeStreak(checkIns)).toEqual({ current: 7, longest: 7 });
  });

  it("resets current on skipped but preserves longest from before the break", () => {
    const checkIns = [
      fixture({ id: "a", local_date: "2024-06-01", status: "done" }),
      fixture({ id: "b", local_date: "2024-06-02", status: "done" }),
      fixture({ id: "c", local_date: "2024-06-03", status: "done" }),
      fixture({ id: "d", local_date: "2024-06-04", status: "skipped" }),
      fixture({ id: "e", local_date: "2024-06-05", status: "done" })
    ];
    expect(computeStreak(checkIns)).toEqual({ current: 1, longest: 3 });
  });

  it("resets current on missed but preserves longest from before the break", () => {
    const checkIns = [
      fixture({ id: "a", local_date: "2024-06-01", status: "done" }),
      fixture({ id: "b", local_date: "2024-06-02", status: "done" }),
      fixture({ id: "c", local_date: "2024-06-03", status: "missed" }),
      fixture({ id: "d", local_date: "2024-06-04", status: "done" })
    ];
    expect(computeStreak(checkIns)).toEqual({ current: 1, longest: 2 });
  });

  it("records longest from an earlier streak when a later streak is shorter", () => {
    const checkIns = [
      fixture({ id: "a", local_date: "2024-06-01", status: "done" }),
      fixture({ id: "b", local_date: "2024-06-02", status: "done" }),
      fixture({ id: "c", local_date: "2024-06-03", status: "done" }),
      fixture({ id: "d", local_date: "2024-06-04", status: "done" }),
      fixture({ id: "e", local_date: "2024-06-05", status: "skipped" }),
      fixture({ id: "f", local_date: "2024-06-06", status: "done" }),
      fixture({ id: "g", local_date: "2024-06-07", status: "done" })
    ];
    expect(computeStreak(checkIns)).toEqual({ current: 2, longest: 4 });
  });

  it("matches sorted order when input is out of chronological order", () => {
    const sorted = [
      fixture({ id: "a", local_date: "2024-06-01", status: "done" }),
      fixture({ id: "b", local_date: "2024-06-02", status: "done" }),
      fixture({ id: "c", local_date: "2024-06-03", status: "skipped" }),
      fixture({ id: "d", local_date: "2024-06-04", status: "done" })
    ];
    const shuffled: CheckIn[] = [
      fixture({ id: "c", local_date: "2024-06-03", status: "skipped" }),
      fixture({ id: "a", local_date: "2024-06-01", status: "done" }),
      fixture({ id: "d", local_date: "2024-06-04", status: "done" }),
      fixture({ id: "b", local_date: "2024-06-02", status: "done" })
    ];
    expect(computeStreak(shuffled)).toEqual(computeStreak(sorted));
    expect(computeStreak(shuffled)).toEqual({ current: 1, longest: 2 });
  });

  it("is deterministic for duplicate local_date: permutations yield the same result", () => {
    const first = fixture({ id: "aaa", local_date: "2024-06-01", status: "done" });
    const second = fixture({ id: "zzz", local_date: "2024-06-01", status: "skipped" });
    const permA = [first, second];
    const permB = [second, first];
    const once = computeStreak(permA);
    expect(computeStreak(permA)).toEqual(once);
    expect(computeStreak(permB)).toEqual(once);
  });

  it("does not extend longest when current ties previous longest", () => {
    const checkIns = [
      fixture({ id: "a", local_date: "2024-06-01", status: "done" }),
      fixture({ id: "b", local_date: "2024-06-02", status: "skipped" }),
      fixture({ id: "c", local_date: "2024-06-03", status: "done" })
    ];
    expect(computeStreak(checkIns)).toEqual({ current: 1, longest: 1 });
  });
});
