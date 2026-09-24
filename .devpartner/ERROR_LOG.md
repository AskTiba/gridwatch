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

### ERR-005 — 2026-09-24 — CI service container fails: port publish exit 125

| Field | Content |
|---|---|
| **Context** | First push to `origin/main` after Units 2–3 — validating `.github/workflows/ci.yml` (postgres:16 service) |
| **Symptom** | Job failed in 12s during `Initialize containers`: `docker create ... -p 5432:5432 ... postgres:16-alpine` → `Exit code 125` |
| **Root cause** | Publishing host port `5432:5432` for the service container failed on the GH-hosted runner (exit 125 from `docker create`); port publishing on shared runners is a common flake/restriction. |
| **Resolution** | Removed the `ports:` mapping and point `DATABASE_URL`/`TEST_DATABASE_URL` at the service network alias `postgres:5432` — GH Actions job steps and service containers share a network, so no host publish is needed. |
| **Prevention** | Prefer service-alias connectivity in CI; only resort to host ports when a tool cannot use the alias |
| **Related** | `ci.yml` env block |

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