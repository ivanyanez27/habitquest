export type QuestEvent = "done" | "skipped" | "missed";

export type AvatarState = "idle" | "walking" | "climbing" | "slipping" | "celebrating" | "resting";

export type QuestStatus = "active" | "completed" | "abandoned";

type QuestCommonFields = {
  id: string;
  user_id: string;
  habit_name: string;
  arc_id: string;
  target_days: number;
  started_at: string;
  current_step: number;
};

export type Quest =
  | (QuestCommonFields & { status: "active"; completed_at: null })
  | (QuestCommonFields & { status: "completed"; completed_at: string })
  | (QuestCommonFields & { status: "abandoned"; completed_at: null });

export type CheckInStatus = "done" | "skipped" | "missed";

export type CheckIn = {
  id: string;
  quest_id: string;
  local_date: string;
  status: CheckInStatus;
  created_at: string;
};

export type Streak = {
  quest_id: string;
  current_length: number;
  longest: number;
  last_done_date: string;
};

export type ArcMilestone = {
  atStep: number;
  scene: string;
  label: string;
};

export type ArcSpriteState = {
  frames: number[];
  fps: number;
};

export type NarrativeArc = {
  id: string;
  name: string;
  description: string;
  totalSteps: number;
  milestones: ArcMilestone[];
  slipDistance: number;
  spriteSheet: string;
  spriteStates: Record<AvatarState, ArcSpriteState>;
};
