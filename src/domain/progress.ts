import type { NarrativeArc, QuestEvent } from "./types";

/**
 * Computes the next step for a quest given an event.
 *
 * @invariant arc.slipDistance is assumed >= 0. Arcs with
 *   invalid values produce undefined behavior; validation
 *   belongs at the arc-loading boundary.
 */
export function computeNextStep(currentStep: number, event: QuestEvent, arc: NarrativeArc): number {
  switch (event) {
    case "done":
      return Math.min(currentStep + 1, arc.totalSteps);
    case "skipped":
      return currentStep;
    case "missed": {
      const floor = milestoneFloorAtOrBelow(arc.milestones, currentStep);
      return Math.max(currentStep - arc.slipDistance, floor);
    }
  }
}

function milestoneFloorAtOrBelow(
  milestones: NarrativeArc["milestones"],
  currentStep: number
): number {
  let highest = -Infinity;
  for (const milestone of milestones) {
    if (milestone.atStep <= currentStep && milestone.atStep > highest) {
      highest = milestone.atStep;
    }
  }
  return highest === -Infinity ? 0 : highest;
}
