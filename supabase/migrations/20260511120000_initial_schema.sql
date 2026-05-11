/*
 * HabitQuest — initial Postgres schema (Phase 2, sub-task 2.A)
 *
 * Creates §7 tables: profiles, quests, check_ins, streaks.
 * RLS policies are deferred to sub-task 2.B.
 *
 * Rollback (run manually if needed; there is no automated down migration):
 *   DROP INDEX IF EXISTS public.check_ins_quest_date_idx;
 *   DROP INDEX IF EXISTS public.quests_one_active_per_user;
 *   DROP TABLE IF EXISTS public.streaks CASCADE;
 *   DROP TABLE IF EXISTS public.check_ins CASCADE;
 *   DROP TABLE IF EXISTS public.quests CASCADE;
 *   DROP TABLE IF EXISTS public.profiles CASCADE;
 */

-- -----------------------------------------------------------------------------
-- profiles — extends Supabase Auth; mirrors domain profile shape (PROJECT.md §7)
-- -----------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name text,
  timezone text NOT NULL,
  notify_at time,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'App profile row keyed to auth.users; timezone is IANA; notify_at is optional local reminder time.';

-- -----------------------------------------------------------------------------
-- quests — mirrors Quest discriminated union (src/domain/types.ts)
-- -----------------------------------------------------------------------------
CREATE TABLE public.quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  habit_name text NOT NULL,
  arc_id text NOT NULL,
  target_days integer NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now (),
  completed_at timestamptz,
  current_step integer NOT NULL DEFAULT 0,
  status text NOT NULL,
  avatar_state text NOT NULL DEFAULT 'idle',
  CONSTRAINT quests_target_days_positive CHECK (target_days > 0),
  CONSTRAINT quests_current_step_nonnegative CHECK (current_step >= 0),
  CONSTRAINT quests_status_values CHECK (
    status IN ('active', 'completed', 'abandoned')
  ),
  CONSTRAINT quests_avatar_state_values CHECK (
    avatar_state IN (
      'idle',
      'walking',
      'climbing',
      'slipping',
      'celebrating',
      'resting'
    )
  ),
  CONSTRAINT quests_status_completed_at_invariants CHECK (
    (
      status = 'active'
      AND completed_at IS NULL
    )
    OR (
      status = 'completed'
      AND completed_at IS NOT NULL
      AND current_step = target_days
    )
    OR (
      status = 'abandoned'
      AND completed_at IS NULL
      AND current_step < target_days
    )
  )
);

COMMENT ON TABLE public.quests IS 'One habit journey per row; status + completed_at follow the domain Quest union.';

CREATE UNIQUE INDEX quests_one_active_per_user ON public.quests (user_id)
WHERE
  status = 'active';

-- -----------------------------------------------------------------------------
-- check_ins — mirrors CheckIn (src/domain/types.ts); one row per quest per local calendar day
-- -----------------------------------------------------------------------------
CREATE TABLE public.check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  quest_id uuid NOT NULL REFERENCES public.quests (id) ON DELETE CASCADE,
  local_date date NOT NULL,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now (),
  CONSTRAINT check_ins_status_values CHECK (status IN ('done', 'skipped', 'missed')),
  CONSTRAINT check_ins_one_per_day UNIQUE (quest_id, local_date)
);

COMMENT ON TABLE public.check_ins IS 'Persisted check-ins; local_date is the user-local calendar date (maps to CheckIn.local_date ISO string).';

CREATE INDEX check_ins_quest_date_idx ON public.check_ins (quest_id, local_date DESC);

-- -----------------------------------------------------------------------------
-- streaks — mirrors Streak (src/domain/types.ts); materialized for fast reads
-- -----------------------------------------------------------------------------
CREATE TABLE public.streaks (
  quest_id uuid PRIMARY KEY REFERENCES public.quests (id) ON DELETE CASCADE,
  current_length integer NOT NULL DEFAULT 0,
  longest integer NOT NULL DEFAULT 0,
  last_done_date date
);

COMMENT ON TABLE public.streaks IS 'Per-quest streak snapshot; last_done_date is null until the first done check-in exists.';

COMMENT ON COLUMN public.streaks.last_done_date IS 'Most recent local calendar date with status done; null when none yet.';
