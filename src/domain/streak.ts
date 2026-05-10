import type { CheckIn } from "./types";

/**
 * Computes consecutive-day streak from check-ins (PROJECT.md §3, §8).
 * Sorted by local_date ascending, then id lexicographically (stable tie-break for corrupt duplicates).
 */
export function computeStreak(checkIns: CheckIn[]): { current: number; longest: number } {
  if (checkIns.length === 0) {
    return { current: 0, longest: 0 };
  }

  const sorted = [...checkIns].sort((a, b) => {
    const byDate = a.local_date.localeCompare(b.local_date);
    if (byDate !== 0) {
      return byDate;
    }
    return a.id.localeCompare(b.id);
  });

  let current = 0;
  let longest = 0;

  for (const checkIn of sorted) {
    if (checkIn.status === "done") {
      current += 1;
      if (current > longest) {
        longest = current;
      }
    } else {
      current = 0;
    }
  }

  return { current, longest };
}
