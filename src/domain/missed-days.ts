import { addDays } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

import type { CheckIn, NewCheckIn, Quest } from "./types";

/**
 * Builds synthetic `missed` check-ins for past local calendar days that have no row yet.
 * Does not merge or return existing check-ins. Today is never included — the user may still act.
 *
 * @see PROJECT.md §8 — `resolveMissedDays`
 */
export function resolveMissedDays(
  quest: Quest,
  existingCheckIns: CheckIn[],
  today: Date,
  tz: string
): NewCheckIn[] {
  const questId = quest.id;
  const startLocalDate = formatInTimeZone(quest.started_at, tz, "yyyy-MM-dd");
  const todayLocalDate = formatInTimeZone(today, tz, "yyyy-MM-dd");

  const existingDates = new Set(
    existingCheckIns.filter((row) => row.quest_id === questId).map((row) => row.local_date)
  );

  const synthetic: NewCheckIn[] = [];

  let cursor = startLocalDate;
  while (cursor < todayLocalDate) {
    if (!existingDates.has(cursor)) {
      synthetic.push({
        quest_id: questId,
        local_date: cursor,
        status: "missed"
      });
    }
    cursor = addOneLocalCalendarDay(cursor, tz);
  }

  return synthetic;
}

/** Advance one calendar day in `tz` (noon anchor avoids DST midnight quirks). */
function addOneLocalCalendarDay(ymd: string, tz: string): string {
  const noonInstant = fromZonedTime(`${ymd}T12:00:00`, tz);
  const next = addDays(noonInstant, 1);
  return formatInTimeZone(next, tz, "yyyy-MM-dd");
}
