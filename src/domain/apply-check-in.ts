import { nextAvatarState as transitionAvatarState } from "./avatar-state";
import { computeNextStep } from "./progress";
import type { AvatarState, NarrativeArc, Quest, QuestEvent } from "./types";

/**
 * Composes path progression and avatar transitions for a single check-in.
 *
 * - **Summit detection lives only here.** After a `done` event, if the clamped
 *   step equals `arc.totalSteps`, the avatar enters `celebrating`.
 * - The standalone `nextAvatarState` helper implements the daily-loop state
 *   machine and **never** returns `celebrating`; that state is reached only
 *   through this function.
 */
export function applyCheckIn(
  quest: Quest,
  event: QuestEvent,
  arc: NarrativeArc
): { nextStep: number; nextAvatarState: AvatarState } {
  const nextStep = computeNextStep(quest.current_step, event, arc);

  const nextAvatarState: AvatarState =
    event === "done" && nextStep === arc.totalSteps
      ? "celebrating"
      : transitionAvatarState(quest.avatar_state, event);

  return { nextStep, nextAvatarState };
}
