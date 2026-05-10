# Contributing to HabitQuest

> Welcome. This file is a one-page on-ramp. It does not duplicate information from other docs — it points you at the right one for whatever you're trying to do.

---

## Start here

If you have **5 minutes** and you're new to the project, read this file end-to-end and skim [`PROJECT.md`](./PROJECT.md) §1–4 (Vision, User, Mechanic, Scope). That's enough to understand what HabitQuest is and what's in/out of scope.

If you have **30 minutes**, read [`PROJECT.md`](./PROJECT.md) in full, then [`PRACTICES.md`](./PRACTICES.md) Parts 1 and 5. You'll then have everything you need to make a meaningful change.

---

## Where to find what

| Your question                                           | Document                                          |
| ------------------------------------------------------- | ------------------------------------------------- |
| What is this project? Why does it exist?                | [`PROJECT.md`](./PROJECT.md) §1                   |
| How do I install and run it?                            | [`README.md`](./README.md) — Quick start          |
| What's in the MVP? What's out of scope?                 | [`PROJECT.md`](./PROJECT.md) §4                   |
| Why this tech stack?                                    | [`PROJECT.md`](./PROJECT.md) §5                   |
| How is the code organized? Where does X live?           | [`PROJECT.md`](./PROJECT.md) §6                   |
| What's the database schema?                             | [`PROJECT.md`](./PROJECT.md) §7                   |
| What are the avatar / streak rules?                     | [`PROJECT.md`](./PROJECT.md) §3                   |
| How do I add a new narrative arc?                       | [`PROJECT.md`](./PROJECT.md) §9                   |
| How should I name things, structure functions, etc.?    | [`PRACTICES.md`](./PRACTICES.md) Part 1           |
| How should I think about UI/UX decisions?               | [`PRACTICES.md`](./PRACTICES.md) Part 2           |
| What are the security baselines?                        | [`PRACTICES.md`](./PRACTICES.md) Part 3           |
| How do I keep things performant?                        | [`PRACTICES.md`](./PRACTICES.md) Part 4           |
| What's expected when I open a PR?                       | [`.github/PULL_REQUEST_TEMPLATE.md`](./.github/PULL_REQUEST_TEMPLATE.md) |
| I have an idea outside the current scope                | Add it to `PROPOSALS.md` (see below)              |

---

## The contribution loop

```
 1. Pick or open an issue   →   2. Branch   →   3. Build   →   4. PR   →   5. Merge
```

### 1. Pick or open an issue

- **Bug fix:** open an issue first if one doesn't exist. Reproducer steps required.
- **Feature within MVP scope** (per `PROJECT.md` §4): proceed.
- **Feature outside MVP scope:** add it to `PROPOSALS.md` first. Don't start building until it's been accepted into a phase. This is the single biggest discipline that keeps a solo project shippable.

### 2. Branch

From `main`, named by intent:

```
feat/<short-slug>     # new feature
fix/<short-slug>      # bug fix
chore/<short-slug>    # tooling, deps, config
docs/<short-slug>     # documentation only
refactor/<short-slug> # internal change, no behavior change
```

### 3. Build

- Follow the layering rule in [`PROJECT.md` §6](./PROJECT.md#6-architecture-overview). It is the single most-violated rule and the easiest to violate by accident.
- Follow [`PRACTICES.md`](./PRACTICES.md) — especially Part 1.3 (types) and Part 1.4 (errors), which are where most defects originate.
- Update docs in the same change. If you touch the data model, the state machine, or the arc schema, the corresponding section of `PROJECT.md` must update with it. PRs that change behavior without updating docs will be sent back.
- Run the local checks before pushing:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

### 4. PR

- Title in [Conventional Commits](https://www.conventionalcommits.org/) format: `feat: add slip animation`, `fix: streak resets at the wrong timezone`.
- Fill out the PR template. The "Layering check," "Scope check," and "AI-assisted?" sections are required, not optional.
- Keep PRs small. A 200-line PR gets a real review; a 2,000-line PR gets a rubber stamp. Split aggressively.

### 5. Merge

- Squash-merge to keep `main` linear.
- The squash commit message is the Conventional Commit message. Make it good — it's what shows up in the changelog.

---

## Working with AI agents

HabitQuest is built with the assumption that AI agents (Claude Code, Cursor, Copilot, etc.) will contribute alongside humans. That's fine, but two rules are non-negotiable:

1. **Disclose AI assistance in the PR.** The PR template has a section for this. Paste the prompt(s) you used. This isn't about judgment — it's a paper trail. If a regression is later traced to an AI-generated change, the prompt is the most useful debugging artifact.
2. **You are responsible for the code, not the agent.** Read every line before you commit. "The AI wrote it" is not a defense for a broken merge. Treat agent output the way you'd treat a draft from an enthusiastic intern: probably right, sometimes wildly wrong, always needing your judgment.

If you are an AI agent reading this directly: also read [`PROJECT.md` §13](./PROJECT.md#13-for-ai-agents--start-here) before writing any code.

---

## Proposing changes outside scope

The hardest part of a solo side project is saying no to your own ideas. `PROPOSALS.md` exists for this. The format is intentionally lightweight:

```markdown
## <Idea name>

**Date:** YYYY-MM-DD
**Status:** proposed | accepted (Phase N) | rejected | deferred

### What
One paragraph.

### Why
What problem does it solve? Whose problem?

### Cost
Rough sense of effort. New screens? New tables? New dependencies?

### Open questions
What would need to be answered before this could be built?
```

Add the entry, open a PR with just the proposal, get it accepted into a phase, *then* implement it. The discipline is the point.

---

## Code of conduct

Be kind. Assume good intent. Write reviews you'd want to receive.

If you're disagreeing with someone's design choice, lead with the goal you both share before the trade-off you see differently. "I want this to be easy for new contributors to read, and I'm worried this abstraction makes that harder" lands better than "this is over-engineered."

---

## Questions

Open an issue with the `question` label. There's no Discord, no email list, no Slack — keep the conversation in the repo where it's searchable for the next person with the same question.