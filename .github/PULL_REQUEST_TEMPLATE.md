<!--
Thanks for opening a PR! Please fill out the sections below.
Sections marked (required) must be completed before review.
-->

## Summary (required)

<!-- One or two sentences. What does this PR do? -->

## Why (required)

<!-- What problem does this solve, or what value does it add?
     Link to the issue if there is one: e.g. "Closes #42" -->

## Changes

<!-- Bullet list of the notable changes. -->

-
-
-

## Type of change (required)

<!-- Check all that apply. -->

- [ ] `feat` — new feature
- [ ] `fix` — bug fix
- [ ] `chore` — tooling, config, deps
- [ ] `refactor` — internal change, no behavior change
- [ ] `docs` — documentation only
- [ ] `test` — adds or improves tests
- [ ] `perf` — performance improvement
- [ ] `style` — formatting, no logic change

## Layering check (required)

HabitQuest enforces a strict dependency direction (see `PROJECT.md` §6):

```
app/  →  features/  →  domain/  ←  data/
                  ↘   ui/   ↙
```

- [ ] `domain/` does not import from React, Supabase, or any I/O module
- [ ] `data/` may import `domain/` interfaces, but `domain/` does not import `data/`
- [ ] No new `any` types in `domain/`

## Scope check (required)

- [ ] This change is within the current MVP scope (`PROJECT.md` §4), **or**
- [ ] This change has been added to `PROPOSALS.md` and approved before this PR

## Data model / state-machine changes

<!-- If this PR changes the Supabase schema, the avatar state machine,
     or the narrative arc JSON schema, confirm the docs are updated. -->

- [ ] Not applicable
- [ ] `PROJECT.md` §7 (data model) updated
- [ ] `PROJECT.md` §3 / state-machine diagram updated
- [ ] `PROJECT.md` §9 (arc schema) updated
- [ ] Supabase migration added under `supabase/migrations/`

## Tests

- [ ] Domain logic touched → unit tests added/updated (≥90% line coverage maintained)
- [ ] Critical user flow touched → Maestro flow updated
- [ ] No tests needed (explain why):

<!-- If "no tests needed", briefly justify. -->

## Manual verification

<!-- Steps you took to verify this works. Screenshots / screen recordings
     are very welcome for any UI change. -->

1.
2.
3.

## Screenshots / recordings

<!-- Drag images or video here, or remove this section. -->

## AI-assisted? (required)

If any part of this PR was generated or substantially modified by an AI agent
(Claude Code, Cursor, Copilot, etc.), please disclose:

- [ ] No AI assistance
- [ ] AI-assisted — prompt(s) below

<details>
<summary>Prompt(s) used</summary>

```
<!-- Paste the prompt(s) you used. -->
```

</details>

## Pre-merge checklist (required)

- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test` passes
- [ ] Self-reviewed the diff
- [ ] No secrets, API keys, or `.env` values committed
- [ ] Conventional Commit message on the merge commit (e.g. `feat: add slip animation`)
