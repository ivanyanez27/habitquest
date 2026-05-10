# HabitQuest

> A narrative habit tracker. Keep your habit, your 8-bit avatar advances. Miss a day, they slip back down the mountain.

<p align="center">
  <em>React Native · TypeScript · Expo · Supabase</em>
</p>

---

## Why HabitQuest?

Most habit apps fail because missing a day feels abstract — a streak number resets, a checkmark goes grey. HabitQuest makes the consequence **visceral**. Your character physically slips down the cliff. They climb back when you do.

It's a habit tracker for people who already respond to game mechanics: progress bars, characters, journeys with a destination.

---

## Status

**Pre-MVP.** Active solo development. Not yet on the App Store or Play Store.

See [`PROJECT.md`](./PROJECT.md) for the full project description, scope, and roadmap.

---

## Quick start

### Prerequisites

- Node.js 20 or later
- pnpm (or npm/yarn — examples use pnpm)
- iOS Simulator (Xcode) or Android Emulator (Android Studio), or a physical device with [Expo Go](https://expo.dev/client)
- A Supabase project ([create one free](https://supabase.com))

### Setup

```bash
# 1. Clone
git clone https://github.com/<your-username>/habitquest.git
cd habitquest

# 2. Install dependencies
pnpm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your Supabase URL and anon key

# 4. Run the database migrations
# (Requires the Supabase CLI — see https://supabase.com/docs/guides/cli)
supabase db push

# 5. Start the dev server
pnpm start
```

Then press `i` for iOS, `a` for Android, or scan the QR code with Expo Go.

### Environment variables

| Variable                        | Description                     |
| ------------------------------- | ------------------------------- |
| `EXPO_PUBLIC_SUPABASE_URL`      | Your Supabase project URL       |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon (public) key |

Never commit `.env`. The anon key is safe in client code; it's protected by Row-Level Security.

---

## Scripts

| Command          | What it does                         |
| ---------------- | ------------------------------------ |
| `pnpm start`     | Start the Expo dev server            |
| `pnpm ios`       | Open the app in the iOS Simulator    |
| `pnpm android`   | Open the app in the Android Emulator |
| `pnpm test`      | Run domain unit tests (Vitest)       |
| `pnpm test:e2e`  | Run Maestro flows                    |
| `pnpm lint`      | ESLint + Prettier check              |
| `pnpm typecheck` | TypeScript strict check, no emit     |

---

## Project structure

```
habitquest/
├── app/                # Expo Router screens
├── src/
│   ├── domain/         # Pure TS — business logic (no React, no Supabase)
│   ├── data/           # Supabase client, repositories, local cache
│   ├── features/       # Feature-scoped UI + hooks
│   ├── ui/             # Shared design-system components
│   ├── narrative/      # Arc definitions + sprite metadata
│   └── lib/            # Generic utilities
├── assets/             # Images, fonts
├── supabase/           # SQL migrations, RLS policies
└── tests/
```

Architectural rule: **`domain/` knows nothing about React or Supabase.** Full layering rules are in [`PROJECT.md` §6](./PROJECT.md#6-architecture-overview).

---

## Tech stack

- **React Native** + **Expo** (managed workflow) — the mobile shell
- **TypeScript** in strict mode
- **Expo Router** — file-based navigation
- **Zustand** — local UI state
- **TanStack Query** — server state
- **MMKV** — local persistence
- **Supabase** — auth, Postgres, realtime
- **Reanimated 3** + **Skia** — animation and sprite rendering
- **Vitest** — domain unit tests
- **Maestro** — end-to-end flows

Rationale for each choice is in [`PROJECT.md` §5](./PROJECT.md#5-tech-stack).

---

## Contributing

This is a solo project right now, but PRs and issues are welcome.

- Read [`PROJECT.md`](./PROJECT.md) before opening a PR — especially §3 (mechanic), §6 (architecture), §7 (data model).
- Follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, …).
- One feature per branch: `feat/<short-slug>`.
- Run `pnpm lint && pnpm typecheck && pnpm test` before pushing.

If your change is generated or assisted by an AI agent, include the prompt in the PR description. The PR template will remind you.

---

## Roadmap (high level)

- **Phase 0** — Foundations
- **Phase 1** — MVP (one habit, one arc, public store release)
- **Phase 2** — Validate retention before adding more
- **Phase 3+** — Multi-arc library, social, AI integrations

Detailed phasing in [`PROJECT.md` §10](./PROJECT.md#10-roadmap).

---

## License

TBD. Until a license is added, all rights reserved.

---

## Acknowledgements

Pixel art conventions inspired by classic 8-bit RPGs. Built with [Expo](https://expo.dev), [Supabase](https://supabase.com), and a lot of caffeine.
