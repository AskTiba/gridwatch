# Project State — GridWatch (municipal-utility-monitor)

> **Single source of truth for project continuity across sessions.**
> The AI reads this file at the start of every session. Keep it current — it IS the memory.
> Last updated: 2026-09-24

---

## What Currently Works

| Feature / Component | Verified by | Date |
|---|---|---|
| TanStack Start SSR app (React 19, TanStack Router + Query) | typecheck + build | 2026-08-27 |
| PostgreSQL 16 (Docker) + PostGIS + Drizzle schema (5 tables: zones, outages, incident_reports, upvotes, notification_subscriptions) | drizzle-kit push | 2026-08-27 |
| App shell: Header, Footer, ThemeToggle (light/dark/system) | component tests | 2026-08-27 |
| Zone lookup page with search | route tests | 2026-08-27 |
| Zone detail page with grid schedule calendar | manual | 2026-08-27 |
| Incident report form with geolocation capture | route tests | 2026-08-27 |
| Live incident feed with infinite scroll | manual | 2026-08-27 |
| Leaflet MapView (client-only SSR-safe) | component tests | 2026-08-27 |
| Server functions for all CRUD (zones, incidents, upvotes, notifications) | function tests | 2026-08-27 |
| Upvote system with fingerprint dedup | function tests | 2026-08-27 |
| Push notification system (VAPID, sw.js, server fns, usePushSubscription hook) | function + manual | 2026-08-27 |
| Subscribe/unsubscribe button on zone detail page | manual | 2026-08-27 |
| Zones auto-created from GPS on report; web-push crash fixed; Kampala defaults | commit a3d0f64 | 2026-08-28 |
| 31 tests passing across 8 test files; TS 0 errors; ESLint 0 errors | `pnpm test` / `typecheck` / `lint` | 2026-08-27 |
| pnpm package manager | pnpm-lock.yaml | 2026-08-28 |

---

## In Progress (Exact Next Step)

| Story/Task | Current Unit | Exact Next Action | Files |
|---|---|---|---|
| DB-backed integration harness | Unit 2 done (commit pending) | Push branch → watch CI run integration test against postgres service | `src/functions/upvotes.integration.test.ts`, `.github/workflows/ci.yml` |
| Unit 3: upvote atomicity | Transaction around check+insert+increment (app-level, no schema push) | Wrap core in `db.transaction`, extend integration test to assert rollback | `src/functions/incidents.ts` |
| Unit 4: UNIQUE constraint | Needs live `db:push` → explicit decision + pre-tag | Present options to developer before acting | `src/db/schema.ts` |
| Skill 6.0 bootstrap | CI scaffolding (committed 1a84c67) | Push branch | `.github/workflows/ci.yml` |

---

## Broken / Blocked

| Issue | Symptom | Blocking what | Owner |
|---|---|---|---|
| *(none known)* | — | — | — |

---

## Planned Next (Prioritized)

1. Finish Sprint 5: CI/CD pipeline (in progress), error boundaries/loading states, WCAG 2.2 audit, rate limiting on server functions
2. Backlog (ROADMAP.md): incident search/filter, photo upload, admin dashboard, email notifications, mobile app, WebSockets

---

## Architecture & Conventions

### Stack

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Runtime | Node.js | 18+ (dev: 24, CI: 22) | Vite 7 requires Node ≥20.19 |
| Framework | TanStack Start | ^1.121.0 | SSR, file-based routing |
| Router | TanStack Router | ^1.121.0 | `getRouter` export |
| Data fetching | TanStack Query | ^5.84.0 | caching, infinite scroll |
| Forms | TanStack Form | — | report form |
| Database | PostgreSQL 16 + PostGIS | Docker (municipal-pg, :5432) | PostGIS for geospatial |
| ORM | Drizzle ORM | ^0.44.0 | `drizzle-orm/postgres-js` |
| Maps | Leaflet + react-leaflet | ^1.9.4 / ^5.0.0 | SSR-safe client-only |
| Notifications | web-push | ^3.6.7 | VAPID |
| Styling | Tailwind CSS v4 | ^4.1.0 | `@import "tailwindcss"` + `@theme` |
| Testing | Vitest + RTL + userEvent + jsdom | ^4.1.10 | |
| Build | Vite | ^7.0.0 | Nitro server output (`.output`) |

### Project Structure

```
src/
  components/   ← Header, Footer, MapView, ThemeToggle + tests
  db/           ← index.ts (client), schema.ts (5 tables)
  functions/    ← zones.ts, incidents.ts, notifications.ts + tests (createServerFn)
  hooks/        ← usePushSubscription.ts
  routes/       ← __root, index, zones/{index,$zoneId}, incidents/index, report/index + tests
  lib/          ← geocoding.ts
  integrations/tanstack-query  ← root-provider, devtools
  router.tsx, styles.css, test-setup.ts
public/sw.js    ← service worker (push)
```

### Key Commands

```bash
pnpm install         # install dependencies
pnpm dev             # dev server (vite dev)
pnpm build           # production build (vite build → .output)
pnpm start           # vite preview
pnpm test            # vitest run
pnpm test:watch      # vitest
pnpm lint            # eslint .
pnpm typecheck       # tsc --noEmit
pnpm db:generate     # drizzle-kit generate
pnpm db:migrate      # drizzle-kit migrate
pnpm db:push         # drizzle-kit push (schema to live DB)
pnpm db:studio       # drizzle-kit studio
```

### Conventions

- **Browser / platform support:** modern evergreen (Chrome/Firefox/Safari current 2)
- **Breakpoints:** mobile-first, fluid (320px → ultrawide)
- **Accessibility conformance target:** WCAG 2.2 AA (not yet audited — Sprint 5)
- **Test strategy:** Vitest unit/component tests for server functions, components, routes; no E2E (Playwright) yet
- **Commit message format:** conventional commits — `feat:`, `fix:`, `chore:`, `docs:`
- **Branch strategy:** GitHub Flow — `main` + feature branches via PR (established at bootstrap 2026-09-24)
- **Server functions:** `createServerFn` from `@tanstack/react-start`
- **CSS:** Tailwind v4 `@import "tailwindcss"` + `@theme` custom properties

### Environment Setup

- **Required env vars:** see `.env.example` — `DATABASE_URL`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_EMAIL`
- **Services required locally:** PostgreSQL 16 on port 5432 with PostGIS

### Checkpoints / Rollback Points

| Tag | What it marks | Date |
|---|---|---|
| *(none yet)* | — | — |

---

## Active Sprint

| Field | Value |
|---|---|
| Sprint # | 5 |
| Sprint goal | Deployment & Polish |
| End date | — |
| See also | SPRINT_LOG.md |