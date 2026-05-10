# HabitQuest — Project Description

> **Single source of truth.** This document describes what HabitQuest is, how it is built, and the conventions any contributor (human or AI agent) must follow. If something is ambiguous here, fix the document — do not improvise in code.

---

## 1. Vision

HabitQuest is a **narrative habit tracker** for mobile. The user picks a habit (e.g. "meditate daily") and chooses a narrative arc (e.g. "climb a mountain"). An 8-bit avatar lives inside that arc and physically progresses or regresses based on whether the user keeps the habit.

The differentiator is **visceral consequence**:

- Most habit apps show abstract feedback — a streak counter, a checkmark, a bar.
- HabitQuest shows **embodied feedback** — your character climbs a step, slips down the cliff, reaches the summit.

This is the entire product thesis. Every design decision should reinforce it. If a feature does not make the avatar's journey more meaningful or more visible, it does not belong in the MVP.

---

## 2. Target User

- **Primary:** People who have tried habit trackers and bounced off them. Especially people who are **gaming-adjacent** — they respond to progress mechanics, characters, and loot loops.
- **Platform:** Mobile-first (iOS + Android). No web app in the MVP.
- **Ambition level:** Public release. Solo-developer-shippable side project. Not a venture-scale product (yet).

---

## 3. Core Mechanic (Unambiguous Definition)

A user has **one active Quest** at a time. A Quest binds:

- One **Habit** (the real-world action being tracked, e.g. "30 min reading")
- One **Narrative Arc** (the journey, e.g. "Climb Mount Aera — 30 days to summit")
- One **Avatar** (sprite + state machine)

### Daily loop

1. The user opens the app.
2. They mark today's habit as **done** or **skipped** (or do nothing — see "Missed day" rules).
3. The avatar's state updates **immediately** with an animated transition.
4. The user sees the new position on the path.

### Progress rules (MVP)

| Event                          | Avatar effect                        | Streak effect        |
| ------------------------------ | ------------------------------------ | -------------------- |
| Habit completed                | Advance 1 step on the path           | Streak +1            |
| Habit skipped (user marks)     | Avatar idles. No advance. No fall.   | Streak resets        |
| Habit missed (no input by EOD) | Avatar slips back N steps            | Streak resets        |
| Habit completed after a slip   | Avatar resumes from current position | Streak restarts at 1 |

- **N (slip distance)** is configurable per arc. MVP default: **3 steps**, capped at the start of the current milestone scene.
- **End of day (EOD)** is the user's local midnight. We rely on device timezone for MVP; server reconciliation comes in v1.
- A Quest has a **target length** (MVP: 30 days). On completion the user picks a new arc.

### Avatar states (MVP — exactly 6)

`idle`, `walking`, `climbing`, `slipping`, `celebrating`, `resting`

The state machine is deterministic. Given `(previous_state, event)` there is exactly one `next_state`. AI agents extending the system must update the state-machine diagram in `/docs/state-machine.md` (to be created in Phase 1) before adding new states.

---

## 4. Scope

### MVP (in)

- Email/password auth (via Supabase Auth)
- Onboarding: pick a habit, pick a narrative arc (1 arc shipped — "Mount Aera")
- Daily check-in flow (done / skipped)
- Avatar rendering with the 6 states above
- Path visualisation (linear, ~30 milestone scenes)
- Streak tracker
- Local notifications (1/day, user-configurable time)
- Settings (notification time, account, sign out)

### MVP (explicitly out)

- Multiple simultaneous habits
- Multiple narrative arcs
- Social features (friends, leaderboards, sharing)
- Custom avatars / skins / cosmetics
- Cloud sync conflict resolution beyond last-write-wins
- AI-generated content
- Payment / monetization
- Web app
- Apple Health / Google Fit integration
- Deep analytics dashboards

### v1 candidates (after MVP validation)

Multi-arc library, second habit slot, streak freezes, push notifications via server, basic shareable end-of-arc card.

---

## 5. Tech Stack

| Layer                | Choice                                         | Rationale                                                                 |
| -------------------- | ---------------------------------------------- | ------------------------------------------------------------------------- |
| Mobile framework     | **React Native + Expo (managed workflow)**     | Leverages existing React/TypeScript skill; Expo removes native build pain |
| Language             | **TypeScript (strict mode)**                   | Type safety across UI and domain logic                                    |
| Navigation           | **Expo Router** (file-based)                   | Idiomatic for Expo SDK 50+, simpler than React Navigation config          |
| State management     | **Zustand**                                    | Minimal boilerplate, fits the small surface area                          |
| Server state / cache | **TanStack Query (React Query)**               | Handles Supabase fetch caching, retries, optimistic updates               |
| Local persistence    | **MMKV** (via `react-native-mmkv`)             | Fast key-value store for offline state and last-known avatar position     |
| Backend              | **Supabase** (Postgres + Auth + Realtime)      | Hosted, generous free tier, SQL when needed, realtime if v1 demands it    |
| Auth                 | **Supabase Auth** (email + password initially) | Comes free with Supabase; OAuth providers added later                     |
| Animations           | **React Native Reanimated 3** + **Skia**       | Skia for pixel-art rendering and scene transitions                        |
| Sprite rendering     | **react-native-skia** with PNG sprite sheets   | Avoids per-frame React reconciliation cost                                |
| Notifications        | **expo-notifications** (local only for MVP)    | No server push needed yet                                                 |
| Testing              | **Vitest** (domain logic) + **Maestro** (E2E)  | Vitest is fast for the pure logic layer; Maestro handles mobile flows     |
| CI/CD                | **EAS Build + GitHub Actions**                 | Standard for Expo apps                                                    |
| Error tracking       | **Sentry**                                     | Free tier covers solo-dev volume                                          |

**Pinned versions live in `package.json`. Do not bump major versions without updating this document.**

---

## 6. Architecture Overview

### Folder structure

```
habitquest/
├── app/                        # Expo Router routes (screens)
│   ├── (auth)/                 # Sign-in, sign-up
│   ├── (main)/                 # Home, quest detail, settings
│   └── _layout.tsx
├── src/
│   ├── domain/                 # Pure TS — no React, no Supabase
│   │   ├── quest.ts            # Quest entity + invariants
│   │   ├── streak.ts           # Streak calculation
│   │   ├── avatar-state.ts     # State machine
│   │   └── progress.ts         # Step advance / slip rules
│   ├── data/                   # Supabase clients, repositories, MMKV
│   │   ├── supabase.ts
│   │   ├── repositories/
│   │   └── local-cache.ts
│   ├── features/               # Feature-scoped UI + hooks
│   │   ├── onboarding/
│   │   ├── check-in/
│   │   ├── avatar/
│   │   └── settings/
│   ├── ui/                     # Shared design-system components
│   ├── narrative/              # Arc definitions (JSON), sprite metadata
│   │   └── arcs/
│   │       └── mount-aera/
│   │           ├── arc.json
│   │           └── sprites/
│   └── lib/                    # Generic utilities (date, logger)
├── assets/                     # Static images, fonts
├── tests/
└── PROJECT.md                  # ← this file
```

### Layering rule

**Strict, one-directional dependency:**

```
app/  →  features/  →  domain/  ←  data/
                ↘    ui/    ↙
```

- `domain/` knows nothing about React, Supabase, or React Native.
- `data/` may import from `domain/` (to satisfy interfaces) but `domain/` may not import from `data/`.
- `features/` is the only layer that wires `domain/` and `data/` together for the UI.

This is the most important architectural rule in the project. AI agents that violate it should be corrected on review.

---

## 7. Data Model

Tables live in Supabase Postgres. The domain layer mirrors them as TypeScript types.

### `users` (managed by Supabase Auth)

Standard Supabase Auth user. We extend with a `profiles` table.

### `profiles`

| Column         | Type        | Notes                      |
| -------------- | ----------- | -------------------------- |
| `id`           | uuid (PK)   | FK to `auth.users.id`      |
| `display_name` | text        | Optional                   |
| `timezone`     | text        | IANA tz; set at onboarding |
| `notify_at`    | time        | Daily check-in reminder    |
| `created_at`   | timestamptz |                            |

### `quests`

| Column         | Type        | Notes                                           |
| -------------- | ----------- | ----------------------------------------------- |
| `id`           | uuid (PK)   |                                                 |
| `user_id`      | uuid (FK)   | → `profiles.id`                                 |
| `habit_name`   | text        | User-entered                                    |
| `arc_id`       | text        | References a static arc def (e.g. `mount-aera`) |
| `target_days`  | int         | MVP: 30                                         |
| `started_at`   | timestamptz |                                                 |
| `completed_at` | timestamptz | Null until summit reached                       |
| `current_step` | int         | 0-indexed position on the path                  |
| `is_active`    | boolean     | Only one active quest per user (enforced)       |

### `check_ins`

| Column       | Type        | Notes                           |
| ------------ | ----------- | ------------------------------- |
| `id`         | uuid (PK)   |                                 |
| `quest_id`   | uuid (FK)   |                                 |
| `local_date` | date        | The user-local calendar day     |
| `status`     | enum        | `done` \| `skipped` \| `missed` |
| `created_at` | timestamptz |                                 |

Unique constraint on `(quest_id, local_date)` — one check-in per day per quest.

### `streaks` (derived, materialized for speed)

| Column           | Type      | Notes |
| ---------------- | --------- | ----- |
| `quest_id`       | uuid (PK) |       |
| `current_length` | int       |       |
| `longest`        | int       |       |
| `last_done_date` | date      |       |

Streak values are also recalculable from `check_ins`. The materialized row is for fast reads; treat `check_ins` as the source of truth.

### Row-Level Security

All tables have RLS enabled. Users may read/write only rows where `user_id = auth.uid()`. Policies are defined in `supabase/migrations/` and committed to the repo.

---

## 8. Domain Logic Reference

These functions live in `src/domain/` and are pure (no I/O, no globals). They are the heart of the app and must be unit-tested.

| Function                                        | Input                                                        | Output                              | Behaviour                                                                                                                                                                                                                                           |
| ----------------------------------------------- | ------------------------------------------------------------ | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `computeNextStep(currentStep, event, arc)`      | step, `done`/`skipped`/`missed`, arc def                     | new step (clamped)                  | Applies progress rules from §3                                                                                                                                                                                                                      |
| `computeStreak(checkIns)`                       | array of check-ins                                           | `{ current, longest }`              | Walks check-ins chronologically                                                                                                                                                                                                                     |
| `nextAvatarState(prev, event)`                  | state, event                                                 | new state                           | Deterministic state machine for the daily loop. Never produces `celebrating` — that state is reached only via `applyCheckIn` summit detection.                                                                                                      |
| `resolveMissedDays(quest, checkIns, today, tz)` | quest, existing check-ins, today's local date, IANA timezone | array of synthetic missed check-ins | Backfills `missed` rows for dates between `started_at` and `today` (exclusive) that have no existing check-in. Caller is responsible for loading check-ins; `check_ins` remains the source of truth (per §7).                                       |
| `applyCheckIn(quest, event, arc)`               | quest, event, arc def                                        | `{ nextStep, nextAvatarState }`     | Composes `computeNextStep` and `nextAvatarState`. If the new step equals `arc.totalSteps` after a `done` event, sets `nextAvatarState` to `'celebrating'`; otherwise delegates to `nextAvatarState(prev, event)`. Single home for summit detection. |

`resolveMissedDays` runs on every app launch and on day-boundary cross.

---

## 9. Narrative Arc Format

A narrative arc is a static JSON file under `src/narrative/arcs/<arc-id>/arc.json`. AI agents adding new arcs must follow this schema exactly:

```json
{
  "id": "mount-aera",
  "name": "Mount Aera",
  "description": "A 30-day climb to the summit.",
  "totalSteps": 30,
  "milestones": [
    { "atStep": 0, "scene": "base-camp", "label": "Base Camp" },
    { "atStep": 10, "scene": "treeline", "label": "Above the Treeline" },
    { "atStep": 20, "scene": "ridge", "label": "The Ridge" },
    { "atStep": 30, "scene": "summit", "label": "Summit" }
  ],
  "slipDistance": 3,
  "spriteSheet": "sprites/avatar.png",
  "spriteStates": {
    "idle": { "frames": [0, 1], "fps": 4 },
    "walking": { "frames": [2, 3, 4, 5], "fps": 8 },
    "climbing": { "frames": [6, 7, 8, 9], "fps": 8 },
    "slipping": { "frames": [10, 11], "fps": 12 },
    "celebrating": { "frames": [12, 13], "fps": 6 },
    "resting": { "frames": [14], "fps": 1 }
  }
}
```

Sprite sheets are 16×16 pixel art at 4× display scale. Backgrounds are per-scene PNGs.

---

## 10. Roadmap

### Phase 0 — Foundations (Week 1)

Repo setup, Expo init, Supabase project, CI, base navigation, design tokens, sprite renderer proof-of-concept.

### Phase 1 — MVP (Weeks 2–6)

All "MVP (in)" items from §4. Goal: TestFlight + Play Console internal testing build.

### Phase 2 — Public release (Weeks 7–8)

Polish, store assets, privacy policy, App Store / Play Store submission.

### Phase 3 — Validate (1–2 months post-launch)

Watch retention. Hard rule: **do not start v1 until you have 30 weekly active users who hit day-7 retention.** This is an anti-scope-creep gate.

### Phase 4+ — Open

Multi-arc library, social, AI integration. Direction depends on what users actually do.

---

## 11. Future: AI Agents

This section is intentionally open. The architecture above keeps it that way:

- Narrative arcs are static JSON, so an arc-generation agent can output the same schema.
- Domain logic is pure, so a coaching agent can read user check-in history without touching UI code.
- Supabase has a SQL surface that an agent can query via a service-role key behind a Cloudflare Worker.

Concrete agent integrations are deferred. When they are added, they go in `src/ai/` and follow the same layering rule (no direct UI access; expose hooks via `features/`).

---

## 12. Conventions

- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, etc.)
- **Branches:** `main` is always shippable. Feature branches: `feat/<short-slug>`.
- **PRs:** Self-review checklist in `.github/PULL_REQUEST_TEMPLATE.md`. AI-agent PRs must include the prompt that produced the change in the description.
- **Linting:** ESLint + Prettier, pre-commit via Husky + lint-staged.
- **No `any`** in `src/domain/` — ever. Strict TS everywhere; `any` allowed only at integration boundaries with a comment explaining why.
- **Tests:** Domain layer must have ≥90% line coverage. UI tested via Maestro flows for the critical paths (onboarding, check-in, slip).

---

## 13. For AI Agents — Start Here

If you are an AI agent picking up this project:

1. **Read this entire file before writing code.** Especially §3 (mechanic), §6 (architecture), §7 (data model), §8 (domain logic).
2. **Respect the layering rule in §6.** Most mistakes will come from importing `data/` into `domain/` or sneaking React into `domain/`.
3. **Do not expand MVP scope.** §4 is a contract. New ideas go in a `PROPOSALS.md` file (create if missing), not into code.
4. **Update this file when you change conventions.** A change to the data model, the state machine, or the arc schema must be reflected here in the same PR.
5. **When uncertain, ask.** Comment a question in the PR rather than guessing. Ambiguity is the failure mode this document exists to prevent.

---

_Document version: 0.1 — initial draft. Update the version and add a changelog entry when revising._
