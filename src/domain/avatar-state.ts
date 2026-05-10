import type { AvatarState, QuestEvent } from "./types";

/**
 * Daily-loop avatar transitions.
 *
 * | Previous state | done        | skipped | missed   |
 * | -------------- | ----------- | ------- | -------- |
 * | idle           | walking     | resting | slipping |
 * | walking        | walking     | resting | slipping |
 * | climbing       | climbing    | resting | slipping |
 * | slipping       | walking     | resting | slipping |
 * | celebrating    | celebrating | resting | slipping |
 * | resting        | walking     | resting | slipping |
 *
 * This function never produces 'celebrating'. That state is reached only via summit detection in applyCheckIn (PROJECT.md §8).
 */
export function nextAvatarState(previousState: AvatarState, event: QuestEvent): AvatarState {
  if (event === "missed") {
    return "slipping";
  }

  if (event === "skipped") {
    return "resting";
  }

  if (previousState === "climbing" || previousState === "celebrating") {
    return previousState;
  }

  return "walking";
}
