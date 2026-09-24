# Error Log — GridWatch (municipal-utility-monitor)

> Every non-trivial error (anything that took real diagnosis, not a typo) is logged here
> at the time it's resolved — not reconstructed from memory later.
> Newest entries at top. Last updated: 2026-09-24

---

## Format

```
## ERR-[NNN] — [Date] — [Short title]

| Field | Content |
|---|---|
| **Context** | What task was in progress when this occurred |
| **Symptom** | What was observed — exact error message, stack trace, or behavior |
| **Root cause** | The actual underlying cause, not just the surface symptom |
| **Resolution** | What was changed — file/line references |
| **Prevention** | What would catch this earlier next time (test, lint rule, pre-flight check) |
| **Related** | Links to other ERR entries or DECISIONS.md entries if relevant |
```

---

## Errors

### ERR-004 — 2026-09-24 — Live DATABASE_URL cannot authenticate against Supabase (deploy blocker)

| Field | Content |
|---|---|
| **Context** | Unit 4 — pushing the `UNIQUE(incident_id, fingerprint)` upvote constraint to the live Supabase DB via `pnpm db:push` |
| **Symptom** | Every connection attempt fails. Original URL → `(ENOTFOUND) tenant/user postgres.mcznaoulxtwqnnhmaaot not found`. Direct host variant `db.<ref>.supabase.co` → `getaddrinfo ENOTFOUND`. Pooler user `postgres` → `no tenant identifier provided`. SSL `no-verify` → `self-signed certificate` (TLS on wrong endpoint). |
| **Root cause** | The project ref `mcznaoulxtwqnnhmaaot` in `.env.local` does not resolve as a Supabase tenant, and the pooler rejects its `postgres.<ref>` user. Credentials/ref are stale or belong to a different project/customer. No prior unit verified live connectivity — all DB work was validated on scratch Postgres, so this was first exposed now. |
| **Resolution** | **Not yet resolved — blocked.** Pre-tag `pre-unique-upvotes-20260924` created; constraint is verified locally + in CI on scratch Postgres. Awaiting a verified live connection string from the developer account before `db:push` touches live. |
| **Prevention** | A connectivity pre-check step before any live `db:push`; seed `.env.example` with connection-string shape (never real creds); routine app DB calls against live should go through an identity check in CI (separate, session-pooler job) |
| **Related** | Unit 4 constraint work; DECISIONS.md risk protocol (pre-tag before live mutation) |

### ERR-005 — 2026-09-24 — CI service container fails: docker create exit 125 (health-cmd parsing)

| Field | Content |
|---|---|
| **Context** | First pushes to `origin/main` after Units 2–3 — validating `.github/workflows/ci.yml` (postgres:16 service) |
| **Symptom** | Job failed in ~12s during `Initialize containers`: `docker create ... postgres:16-alpine` → `Usage: docker create [OPTIONS] IMAGE [COMMAND] [ARG...]` then `##[error]Exit code 125` |
| **Root cause** | The multi-word `--health-cmd pg_isready -U postgres` in the service `options:` string is split by the runner's arg parsing into `--health-cmd pg_isready` + `-U postgres`; docker then reads `-U` as an unknown docker flag and aborts with usage + exit 125.\n\nⓘ *First diagnosis (blamed host `-p 5432:5432` publish) was wrong — both runs failed on the same health-cmd split; the port publish was never reached.* The alias-based `postgres:5432` URL change is still correct and kept. |
| **Resolution** | Dropped the `-U postgres` tokens → single-word health command `--health-cmd pg_isready` (default user/DB in the container matches POSTGRES_USER=postgres). Connectivity stays host-port based: steps run on the runner **host**, so the service must publish `5432:5432` and the URL targets `localhost:5432` — the network-alias form only works when a job `container:` shares the service network (ERR-006 branch, see resolution below) |
| **Prevention** | Keep service `--health-cmd` single-word; choose alias-vs-localhost connectivity based on whether the job runs in a `container:` (alias) or on the host (published port + localhost) |
| **Related** | `ci.yml` `services:` block; the erroneous first pass is superseded by this entry |

### ERR-006 — 2026-09-24 — pnpm 11 install fails in CI: ERR_PNPM_IGNORED_BUILDS

| Field | Content |
|---|---|
| **Context** | First CI runs after enabling the pipeline — `pnpm install --frozen-lockfile` on the runner |
| **Symptom** | `[ERR_PNPM_IGNORED_BUILDS] Ignored build scripts: esbuild@0.18.20, esbuild@0.25.12, esbuild@0.28.2` then exit 1. Locally the identical install succeeds. |
| **Root cause** | pnpm **v11 removed `onlyBuiltDependencies`** (and the `pnpm` field in package.json generally) in favor of an `allowBuilds` map in `pnpm-workspace.yaml`; the legacy key is **silently ignored**. Local installs passed the whole time only because the machine's global pnpm config has `dangerouslyAllowAllBuilds: true` — masking the bug in every local run. CI has no such config, so the strict gate fired. |
| **Resolution** | `pnpm-workspace.yaml` now declares `allowBuilds: { esbuild: true }` (esbuild's postinstall builds its platform binary; it must run or the binary is absent). Verified against a strict install (`--config.dangerouslyAllowAllBuilds=false`) in a scratch project. Local install re-verified. |
| **Prevention** | CI must be the source of truth (it is — the strict gate caught it); reproduce CI strictness locally with `pnpm install --config.dangerouslyAllowAllBuilds=false`; grep `pnpm config list` for `dangerouslyAllowAllBuilds` when "works here, fails there" |
| **Related** | ERR-005 (service layer); prior wrong-fix commits `7962b26` (package.json pnpm field — v11 no longer reads it) and `dc231fa` (legacy `onlyBuiltDependencies` key) superseded by the `allowBuilds` map in `9eccc9f` |

### ERR-003 — 2026-09-24 — Upvote count update emits invalid Postgres SQL

| Field | Content |
|---|---|
| **Context** | Bootstrap review of `src/functions/incidents.ts` during Skill 6.0 install |
| **Symptom** | Every `upvoteIncident` call 500s after inserting the upvote row; user sees an error, and the un-transacted insert leaves a half-applied vote (retry then falsely reports "already_upvoted") |
| **Root cause** | `incidents.ts:164` used `.set({ upvotes: drizzleCount(upvotes.id) })` — `count()` is an aggregate and Postgres rejects aggregate functions in the UPDATE SET clause (proven on scratch Postgres 16: `missing FROM-clause entry` / `aggregate functions are not allowed in UPDATE`) |
| **Resolution** | Replaced with `upvoteCountSql = sql\`${incidentReports.upvotes} + 1\`` — an atomic increment; exported from `incidents.ts` and covered by a rendering regression test (`incidents.test.ts` "upvote count update") |
| **Prevention** | New test asserts the SET expression contains `+ 1` and no `count(`; systemic gap — no DB-backed integration test executed any handler (tracked, next unit) |
| **Related** | INTERVIEW_QA §D5 "Why is the upvote stored in a separate table" (edge cases); DECISIONS DEBT — DB-facing handler tests missing |

### ERR-002 — 2026-08-28 — Web push send crash + GPS zone auto-create failure

| Field | Content |
|---|---|
| **Context** | Sprint 5 polish pass after portfolio README |
| **Symptom** | Web push notification sending crashed at runtime; zones were not auto-created from GPS when reporting an incident without `zoneId` |
| **Root cause** | Notification path did not guard against missing VAPID config / invalid subscription payloads; `findOrCreateZone` lacked fallbacks for reverse-geocoding failures and produced non-Kampala area naming |
| **Resolution** | Commit `a3d0f64` — web-push crash fix, GPS-driven zone auto-creation, Kampala default seeding (`src/functions/incidents.ts` `findOrCreateZone`, `src/functions/notifications.ts` `sendZoneNotification`) |
| **Prevention** | Fire-and-forget `sendZoneNotification(...).catch(() => {})` wraps failures; geocoding failure path falls back to lat/lng-derived name instead of throwing |

### ERR-001 — 2026-08-27 — ESLint errors in service worker

| Field | Content |
|---|---|
| **Context** | Sprint 4 — Push notifications (service worker `public/sw.js`) |
| **Symptom** | ESLint errors: `clients` is not defined in `public/sw.js` |
| **Root cause** | Service worker runs in a different global context (ServiceWorkerGlobalScope) than browser or Node, so `globals.browser`/`globals.node` didn't cover `clients`, `self.addEventListener`, etc. |
| **Resolution** | Added a files override in `eslint.config.js` that applies `globals.serviceworker` to `public/**/*.js` |
| **Prevention** | ESLint config should include service worker globals for any SW files |

---

## Related

- DEBT-003 (rate limiting) tracks exposure of public POST endpoints identified during the
  bootstrap review.