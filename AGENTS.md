# AGENTS.md

## Cursor Cloud specific instructions

### Repository state

This is a **pre-MVP** project. The README describes the intended tech stack and project structure, but as of the initial commit, only `README.md` and `.gitignore` are tracked. There is no `package.json`, no source code, and no runnable application yet.

### Prerequisites (already available in Cloud VM)

- **Node.js 20+** (v22 installed via nvm)
- **pnpm** (v10 installed globally)

### Planned tech stack (per README)

- React Native + Expo (managed workflow), TypeScript strict mode
- Expo Router, Zustand, TanStack Query, MMKV, Supabase
- Reanimated 3 + Skia for animation
- Vitest for unit tests, Maestro for E2E
- ESLint + Prettier for linting

### When source code is added

Once a `package.json` exists, the update script will run `pnpm install`. The README documents the following dev commands:

| Command          | Purpose                 |
| ---------------- | ----------------------- |
| `pnpm start`     | Start Expo dev server   |
| `pnpm test`      | Run Vitest unit tests   |
| `pnpm lint`      | ESLint + Prettier check |
| `pnpm typecheck` | TypeScript strict check |

### Environment variables

Two env vars are required (see README):

- `EXPO_PUBLIC_SUPABASE_URL` — Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key

These should be added as Cursor Cloud secrets when a Supabase project is provisioned.

### Notes

- Several project docs (`PROJECT.md`, `PRACTICES.md`, `CONTRIBUTING.md`, etc.) are `.gitignore`d and only exist on the original developer's machine. AI agents will not have access to these.
- The `.gitignore` also excludes `.github/PULL_REQUEST_TEMPLATE.md`, so GitHub will not auto-fill PR descriptions.
- Supabase can be run locally via `supabase start` (requires Docker) or connected to a cloud project.
