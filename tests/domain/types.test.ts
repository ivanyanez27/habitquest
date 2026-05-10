import type { CheckIn, NarrativeArc, Quest, Streak } from "../../src/domain";

/** Compile-only fixtures — strict-mode proof that the shapes accept realistic values. */
describe("domain types", () => {
  it("accepts representative values", () => {
    const activeQuest = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      user_id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      habit_name: "Read for 30 minutes",
      arc_id: "mount-aera",
      target_days: 30,
      started_at: "2026-05-01T12:00:00.000Z",
      current_step: 4,
      avatar_state: "idle",
      status: "active",
      completed_at: null
    } satisfies Quest;

    const completedQuest = {
      id: "650e8400-e29b-41d4-a716-446655440001",
      user_id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      habit_name: "Meditate",
      arc_id: "mount-aera",
      target_days: 30,
      started_at: "2026-04-01T08:00:00.000Z",
      current_step: 29,
      avatar_state: "celebrating",
      status: "completed",
      completed_at: "2026-05-10T23:59:59.999Z"
    } satisfies Quest;

    const abandonedQuest = {
      id: "750e8400-e29b-41d4-a716-446655440002",
      user_id: "7ba7b810-9dad-11d1-80b4-00c04fd430c9",
      habit_name: "Journal",
      arc_id: "mount-aera",
      target_days: 30,
      started_at: "2026-03-15T06:30:00.000Z",
      current_step: 7,
      avatar_state: "resting",
      status: "abandoned",
      completed_at: null
    } satisfies Quest;

    const checkIn = {
      id: "850e8400-e29b-41d4-a716-446655440003",
      quest_id: activeQuest.id,
      local_date: "2026-05-10",
      status: "done",
      created_at: "2026-05-10T09:15:00.000Z"
    } satisfies CheckIn;

    const streak = {
      quest_id: activeQuest.id,
      current_length: 5,
      longest: 12,
      last_done_date: "2026-05-10"
    } satisfies Streak;

    const arc = {
      id: "mount-aera",
      name: "Mount Aera",
      description: "A 30-day climb to the summit.",
      totalSteps: 30,
      milestones: [
        { atStep: 0, scene: "base-camp", label: "Base Camp" },
        { atStep: 10, scene: "treeline", label: "Above the Treeline" },
        { atStep: 20, scene: "ridge", label: "The Ridge" },
        { atStep: 30, scene: "summit", label: "Summit" }
      ],
      slipDistance: 3,
      spriteSheet: "sprites/avatar.png",
      spriteStates: {
        idle: { frames: [0, 1], fps: 4 },
        walking: { frames: [2, 3, 4, 5], fps: 8 },
        climbing: { frames: [6, 7, 8, 9], fps: 8 },
        slipping: { frames: [10, 11], fps: 12 },
        celebrating: { frames: [12, 13], fps: 6 },
        resting: { frames: [14], fps: 1 }
      }
    } satisfies NarrativeArc;

    void activeQuest;
    void completedQuest;
    void abandonedQuest;
    void checkIn;
    void streak;
    void arc;
  });
});
