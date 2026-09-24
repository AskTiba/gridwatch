# Skill Evolution — GridWatch (municipal-utility-monitor)

> This file is how Emily learns and adapts to this specific project over time.
> It is read at the START of every session (before anything else) and updated at the
> END of every session and every sprint retrospective.
>
> These entries OVERRIDE the defaults in BOOT.md and the individual SKILL.md files
> for this project. They are the highest-priority configuration source.
>
> Last updated: 2026-09-24

---

## How This Works

1. **Session start:** Emily reads this file FIRST, before BOOT.md or any SKILL.md
2. **Session end:** Emily updates this file with corrections, new conventions, and learnings
3. **Sprint retrospective:** Developer and Emily explicitly discuss what to add here
4. **Evolution is cumulative:** entries are never deleted, only superseded
   (add a "Superseded by:" note if a rule changes)

---

## Developer Preferences

> Things the developer has explicitly asked for that differ from the default protocol.

| Date | Preference | Context |
|---|---|---|
| *(none yet)* | | |

---

## Project-Specific Conventions

> Technical or process conventions established for this project that aren't in the default skills.

| Date | Convention | Established in |
|---|---|---|
| 2026-09-24 | Package manager is **pnpm** (v11) with `pnpm-lock.yaml` — used for all install scripts | PROVISIONAL (npm → pnpm migration was the last committed change) |
| 2026-09-24 | No formatter configured (no `.prettierrc`/`.biome.json`) — CI format stage skipped | ci-partner stack detection, bootstrap |
| 2026-09-24 | Schema changes are pushed via `db:push` — no `src/db/migrations/` dir is committed | CI omits ORM generate step |
| 2026-09-24 | PostGIS geometry stored as WKT text with raw SQL for spatial ops (Drizzle limitation) | schema.ts:23 comment |

---

## Corrections Logged

> Moments where Emily was corrected — captures the specific behavior to avoid or change.

| Date | Session # | Was about to do | Should do instead |
|---|---|---|---|
| *(none yet)* | | | |

---

## What Worked Well

> Patterns, approaches, or habits that produced good results — worth doing consistently.

| Date | Pattern | Why it worked |
|---|---|---|
| *(none yet)* | | |

---

## Standing Technical Decisions (Project-Level)

> Decisions that were made once and are now settled conventions — so Emily doesn't
> re-propose them each session.

| Decision | Settled | Date | Reference |
|---|---|---|---|
| PostgreSQL + PostGIS for geospatial | Yes | 2026-08-27 | DECISIONS.md |
| Drizzle ORM over Prisma | Yes | 2026-08-27 | DECISIONS.md |
| TanStack Start over Next.js | Yes | 2026-08-27 | DECISIONS.md |
| Leaflet over Mapbox GL | Yes | 2026-08-27 | DECISIONS.md |
| web-push for notifications | Yes | 2026-08-27 | DECISIONS.md |
| Fingerprint-based upvote dedup | Yes | 2026-08-27 | DECISIONS.md |
| pnpm as package manager | Yes | 2026-08-28 | git commit 5d9fe0b |
| Vercel + Supabase production target | Yes | 2026-08-28 | README.md → Deployment |