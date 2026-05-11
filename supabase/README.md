# Supabase (HabitQuest)

SQL migrations in this folder define the Postgres schema for production and local development.

## Apply migrations locally

From the repository root (with [Docker](https://docs.docker.com/get-docker/) running):

```bash
pnpm dlx supabase@latest start
pnpm dlx supabase@latest db reset
```

`db reset` recreates the local database and applies every file in `migrations/` in timestamp order.

To apply new migrations to an already-running local stack without wiping data:

```bash
pnpm dlx supabase@latest migration up
```

Alternatively, `pnpm dlx supabase@latest db push` syncs the local database to the migration history (useful in some workflows; see the [Supabase CLI docs](https://supabase.com/docs/reference/cli/introduction)).

## Roll back

- **Full local reset:** `pnpm dlx supabase@latest db reset` rebuilds the DB from migrations (no manual undo SQL).
- **Surgical undo:** each migration file begins with a comment block listing `DROP TABLE` / `DROP INDEX` statements you can run manually against the target database. There are no checked-in “down” migrations; append a new forward migration if you need to change production.

## Add a new migration

```bash
pnpm dlx supabase@latest migration new <short_description>
```

Edit the generated file under `supabase/migrations/`. Use a new timestamped filename; the CLI picks the next prefix automatically.

## Conventions

- **Append-only:** never edit a migration that has already been merged to `main`. Fix schema drift by adding a new migration on top.
- **Ordering:** filenames use `YYYYMMDDHHMMSS_description.sql` so Postgres applies them in a stable order.
- **RLS:** row-level security policies live in their own migrations (see Phase 2 sub-task 2.B).
