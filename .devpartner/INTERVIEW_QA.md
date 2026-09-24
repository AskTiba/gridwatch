# Interview Q&A — GridWatch (municipal-utility-monitor)

> **Personal software-engineering study bank.** Generated live during development plus
> post-hoc project scans — every entry maps a real design decision, file, or code pattern
> to the question an interviewer would ask, with a teaching-grade model answer written for
> an intermediate developer working toward interview readiness.
> Source: interview-partner §7 scan, 2026-09-24 (project built Aug 2026, Sprints 1–5).
> Last updated: 2026-09-24

---

## Index

| Domain | Section | Question count |
|---|---|---|
| System Design & Architecture | §D1 | 2 |
| Language Fundamentals | §D2 | 1 |
| Frontend / React | §D3 | 3 |
| Backend / API Design | §D4 | 3 |
| Database & Queries | §D5 | 3 |
| Security | §D6 | 3 |
| Performance & Scalability | §D7 | 2 |
| Testing & QA | §D8 | 2 |
| CI/CD & DevOps | §D9 | 2 |
| Accessibility | §D10 | 1 |
| Project Deep-Dive | §D11 | 4 |
| Behavioral & Decisions | §D12 | 3 |

---

## Story Entries (Chronological)

### STORY-UPVOTE-FIX-1 — Atomic upvote increment — 2026-09-24

**Q:** "A code review flagged that your upvote handler used `count()` in an UPDATE. What was the bug, and how did you prove and fix it?"

**Direct answer:** `count()` is an aggregate, and Postgres won't allow aggregates in the SET clause — so the update threw every time. I proved it on a throwaway Postgres container, then replaced it with an atomic `column + 1` increment and added a regression test that renders the expression and asserts its shape.

**Concept:** Aggregates (`count`, `sum`, `avg`) collapse many rows into one value; UPDATE SET assigns a value per refined row, so an aggregate there is a semantic mismatch the planner rejects. `column + 1` is an atomic read-modify-write that Postgres executes without a subquery.

**Why / tradeoffs:** Increment loses self-healing if duplicate votes ever slip through the app-level dedup (a unique `(incident_id, fingerprint)` constraint is the eventual fix). A scalar subquery `(SELECT count(*) FROM upvotes WHERE ...)` would self-heal but recomputes on every vote and is heavier for a hot path.

**In this project:** `src/functions/incidents.ts` — `upvoteCountSql = sql\`${incidentReports.upvotes} + 1\`` used in `upvoteIncident`; regression test in `incidents.test.ts` renders it via `PgDialect.sqlToQuery` and asserts `+ 1` present / no `count(`.

**Edge cases / failure modes:** The dedup check-then-insert is still non-atomic — two concurrent same-fingerprint votes can both insert. The counter stays `+ 1` per successful insert, so the *count* matches the *rows*, which is the consistency that matters today.

**At scale:** Row-count and counter stay bound as long as inserts are the only writer. When abuse appears, the unique constraint + retry semantics (return "already upvoted") become the authoritative guard.

**Interviewer's intent:** Probes SQL literacy — whether you recognize invalid aggregate usage, how you'd verify a suspected SQL bug before fixing, and whether you know the atomic-increment pattern.

**Follow-ups:**
- Q: Why not wrap the insert and update in a transaction? → A: A transaction would prevent the orphan-vote state, but the increment is still the concurrency fix; do both when the DB-backed test harness lands.
- Q: How does Drizzle decide to render the column reference? → A: The `sql` template interpolates a column node, so it renders `"incident_reports"."upvotes"` — reference-safe, parameterized only for the literal.

---

### STORY-UPVOTE-FIX-2 — DB-backed integration harness for the upvote path — 2026-09-24

**Q:** "Your handler tests were skeleton existence checks. How did you get a real DB into your test suite?"

**Direct answer:** I extracted the upvote logic into a plain `upvoteIncidentCore(client, incidentId, fingerprint)` function — injectable DB, no `createServerFn` framework coupling — then wrote an integration test that provisions a real Postgres connection from `TEST_DATABASE_URL` and asserts actual row counts and dedup behavior against it. CI runs a `postgres:16` service and pushes the schema before the test job.

**Concept:** "Mock as little as possible" means testing the *contract* against what you own. The core function takes the DB as a parameter (Dependency Injection), so a test can hand it a client bound to a disposable database while the production server function just passes the module-level `db`. `describe.skipIf(!TEST_DATABASE_URL)` keeps the local default gate green (skips) but executes in CI where the service exists — an intentional, named conditional, not a sneaky skip.

**Why / tradeoffs:** This closes the systemic gap that let the ERR-003 aggregate-bug ship: no DB test ever executed a handler. Cost: the harness needs a live DB (CI service + `pnpm db:push` before tests) and the core/serializer split adds one small function. A pure mock-DB test would be cheaper but would have asserted whatever the mock returned — too far from how the software actually runs.

**In this project:** `src/functions/incidents.ts` (`upvoteIncidentCore`, used by the `upvoteIncident` server fn), `src/functions/upvotes.integration.test.ts` (truncates tables, inserts an incident, upvotes twice from one fingerprint + once from another, asserts counts 1→1→2), `.github/workflows/ci.yml` (postgres:16 service + `TEST_DATABASE_URL` + `pnpm db:push`).

**Edge cases / failure modes:** If `TEST_DATABASE_URL` is accidentally unset in CI the test skips silently — mitigated because CI sets it explicitly from the service. Truncation assumes only the test writes to the DB; parallel workers could collide (the test uses `max: 1` and would need shared isolation if parallelized further).

**At scale:** The pattern generalizes: every consumer-facing handler (incident create, subscriptions) graduates to a DB-backed test the same way, and the service-based CI stays green.

**Interviewer's intent:** Distinguishes candidates who *say* "we should test against a real DB" from ones who can stand up the harness, wire CI, and keep the default gate usable.

**Follow-ups:**
- Q: Why not run these tests always locally? → A: `pnpm test` is the zero-setup gate; requiring a local Postgres would break onboarding. The env-gated skip is the documented compromise.
- Q: What does the core-vs-server-fn split buy you beyond testing? → A: It moves logic out of the RPC boundary, which is what makes Unit 3's transaction wrapping testable next.

---

### STORY-UPVOTE-FIX-3 — Transactional atomicity for the upvote path — 2026-09-24

**Q:** "Your upvote path is check-then-insert-then-increment. What happens if the increment fails, and how do you make that safe?"

**Direct answer:** Without a transaction, a failed count UPDATE leaves an orphaned Upvotes row (the INSERT already committed). I wrapped the dedup check + vote insert + count increment in a single `client.transaction`, so any failure rolls all three back.

**Concept:** A transaction is the storage engine's atomicity primitive, not an app-level nicety. By passing the DB into the core (`upvoteIncidentCore(client, ...)`), the transaction is exercised the same way in tests as in production — the harness test arms a `BEFORE UPDATE` trigger on `incident_reports` that `RAISE EXCEPTION`s, asserts the call rejects, then asserts no Upvotes row remains and the count is still 0. Drop the trigger in a `finally` so failed runs don't leak DDL into the next test.

**Why / tradeoffs:** The untested failure mode (orphan rows + phantom increments) was exactly the class that shipped ERR-003. Cost paid now: the transaction guarantees a slightly longer-read lock window (the read-for-update gap is only closed by the Unit 4 constraint). The alternative — a `UNIQUE(incident_id, fingerprint)` constraint — is the authoritative backstop we'll add next, but it still won't make the count increment atomic by itself.

**In this project:** `src/functions/incidents.ts` (`upvoteIncidentCore` now `client.transaction(...)`), `src/functions/upvotes.integration.test.ts` (2nd `it`: forced-update-failure trigger, `rejects.toThrow()`, orphan-row length 0, count 0).

**Interviewer's intent:** Tests whether the candidate distinguishes "works when the happy path is hit" from "still consistent when a step fails mid-sequence" — and whether they can force the failure deterministically in a test rather than relying on a mock that never throws.

**Follow-ups:**
- Q: Why isn't `REPEATABLE READ` or a lock used? → A: Postgres `BEGIN` (READ COMMITTED) + the row UPDATE's implicit row lock already makes the count bump safe against concurrent writers; `SERIALIZABLE` wouldn't buy correctness here but costs retry complexity.
- Q: What closes the check-then-insert race? → A: Unit 4 — a `UNIQUE(incident_id, fingerprint)` index makes the INSERT itself the de-dupe boundary; a duplicate violates the constraint and aborts the transaction. Announced for explicit approval because it needs a live `db:push`.

---

### STORY-UPVOTE-FIX-4 — Storage-layer uniqueness constraint + CI pipeline teardown — 2026-09-24

**Q:** "Your dedup check is app-level. What stops a race or a second instance from inserting duplicate votes?"

**Direct answer:** The storage layer now enforces it — `upvotes` gets a **composite UNIQUE index** on `(incident_id, fingerprint)`, so the database rejects a second row for the same incident/fingerprint outright. The app-level check then only serves to return the friendly `already_upvoted` message; the constraint is the authoritative backstop. A raw duplicate INSERT is asserted to reject in the DB-backed integration test.

**Concept:** Two layers, different jobs. The transaction (Unit 3) makes the *sequence* atomic; the unique index makes the *boundary condition* impossible. You test each: rollback via a forced-update trigger, and uniqueness via a direct duplicate INSERT that must throw. The constraint also exposed the dirty-data trap: an earlier smoke run had left two identical rows, so `db:push` refused to create the unique index — you must dedupe first, e.g. keep the oldest row per key (`row_number()` partition delete).

**Why / tradeoffs:** Correctness that survives app restarts, instance scale-out, and bugs in the check. Costs: `db:push` on live must pass a pre-flight duplicate scan (or it fails loudly — which is the good behavior), and the constraint adds a btree write cost per vote (~negligible at this scale). The alternative — locking + recheck inside the transaction — is more code and still racy if a path bypasses the app.

**In this project:** `src/db/schema.ts` (`uniqueIndex("upvotes_incident_fingerprint_idx")` replacing the non-unique `index`), `src/functions/upvotes.integration.test.ts` (3rd `it`: direct duplicate INSERT must reject), `.github/workflows/ci.yml`.

**Learnings worth interviewing on:**
- The first CI run failed in 12s at the service layer, not code: publishing host port `5432:5432` died with docker `exit 125`. Fix: drop `ports:`, reference the service by its network alias `postgres:5432` — job steps and services share a network.
- The live database connection was dead on arrival: every connection variant (pooler/direct, SSL modes) rejected `postgres.<ref>`, and `db.<ref>.supabase.co` doesn't resolve. It had never been exercised because **all DB work to date was verified on scratch Postgres**. First real integration test with a live-bound credential exposed it — evidence that CI/service-based DB tests earn their keep.

**Interviewer's intent:** Probes whether you understand *where* integrity guarantees must live (model: the DB, not the app), how to add constraints safely to a dirty table, and how to debug "works in CI but not prod" infrastructure failures.

**Follow-ups:**
- Q: Which is the de-dupe authority after this change? → A: The unique index; the app check is UX. A violation surfaces as a thrown constraint error and rolls back the enclosing transaction.
- Q: Why can't the count be derived instead of stored? → A: It could via `SELECT count(*)`, but a materialized count on the report row keeps list queries cheap and survives the write path — the constraint makes the two consistent.

---

## §D1. System Design & Architecture

### Draw this system end-to-end

**Q:** "Walk me through GridWatch's architecture. How does data flow from a citizen reporting a pothole to a subscriber getting a push notification?"

**Direct answer:** There are three layers — a React client, a TanStack Start SSR server exposing server functions, and a PostGIS PostgreSQL database — with the push notification path being fire-and-forget from the server.

**Concept:** TanStack Start server functions (`createServerFn`) let you define a function once and call it from the client; the framework turns that call into an RPC over the network (JSON), while keeping it type-safe end-to-end. The DB layer uses Drizzle + the `postgres-js` driver. Everything is one Next-like app: routes in `src/routes/`, server functions in `src/functions/`, data model in `src/db/schema.ts`.

**Why / tradeoffs:** Monolith-first was right at this scale — one deployable, one language, no service boundary overhead. You'd split into a dedicated notification worker only when push fan-out (currently sequential, DEBT-004) becomes a latency problem.

**In this project:** `src/routes/report/index.tsx:88` calls `createIncidentReport` (`src/functions/incidents.ts:67`), which inserts into `incident_reports`, then invokes `sendZoneNotification` (`src/functions/notifications.ts:68`) **fire-and-forget** (`.catch(() => {})`, `incidents.ts:131`) so the response isn't blocked by push latency.

**Edge cases / failure modes:** If VAPID keys are missing in prod, push silently fails per-subscription (each send is wrapped in try/catch that deactivates stale subs). If the DB is down, the incident insert fails outright — the user sees an error, which is correct fail-loud behavior.

**At scale:** N subscribers means N sequential `webPush.sendNotification` HTTP calls (notifications.ts:107). At 100x, move to a queue (e.g. RabitMQ/BullMQ) with a worker pool and backoff.

**Interviewer's intent:** Checks whether you can explain a real system's boundaries, data flow, and where the eventual-consistency decisions are.

**Follow-ups:**
- Q: Where's the single point of failure? → A: The Postgres DB (or the DB URL config); Vercel functions are ephemeral, so state must be external.
- Q: How would you add photo upload now? → A: Client → presigned URL from a server function → upload directly to object storage (S3/R2) → store URL in the existing `photos` jsonb column.

### Scale this system 100x

**Q:** "This is now a regional platform for 10 cities. What breaks first?"

**Direct answer:** The `getZonesWithStats` N+1 counts (DEBT-005), the sequential push fan-out (DEBT-004), unindexed/lat-long-as-text geospatial lookups (DEBT-001), and the absence of rate limiting on public POSTs.

**Concept:** Compose the specific bottlenecks: query-per-row loops and serial network I/O in the hot path, then data-model shapes that can't use spatial index, then no protection on write endpoints.

**Why / tradeoffs:** You fix query-shape problems first because they're multiplicative (one page load → dozens of queries). Then fan-out, then abuse.

**In this project:** `getZonesWithStats` (`src/functions/zones.ts:49`) runs 2 count queries per zone via `Promise.all` — O(zones) queries per listing. Push loops per subscription (notifications.ts:107).

**Edge cases / failure modes:** Rate-limiting without good UX creates false "it's broken" reports; spatial migration (text → geometry) needs a data backfill + dual-write window.

**At scale:** Dedicate a `COUNT(*)`/summary table or windowed materialized view; send push from a queue worker; enable PostGIS `GIST` index on a real geometry column.

**Interviewer's intent:** Screens for data, not fancy design — candidates who can enumerate concrete bottlenecks of *this* system instead of reciting generic "use a queue" answers.

---

## §D2. Language Fundamentals

### The `postgres(undefined)` construction

**Q:** "Your db client is `postgres(process.env.DATABASE_URL!)`. What happens if `DATABASE_URL` is missing at import time?"

**Direct answer:** The non-null assertion only silences TypeScript, so `postgres(undefined)` is called at module load. The `postgres-js` client won't necessarily throw at construction — it fails when a query runs (or on connection), which is why tests that only check the module *imports* still pass.

**Concept:** `!` is a compile-time assertion, not a runtime guard. Module-level side effects (opening a client) run the first time any code imports the module — so a missing env var fails lazily, at the first query, not at boot.

**Why / tradeoffs:** Grouping connection setup at module scope is terse but couples "import this module" to "network attempt exists." A factory function would allow injection/testability but adds plumbing.

**In this project:** `src/db/index.ts:5` reads `process.env.DATABASE_URL!`; `drizzle.config.ts:8` does the same for drizzle-kit (which is why `db:*` scripts need `.env.local` — commands run with `dotenv -e .env.local`).

**Edge cases / failure modes:** A typo'd URL throws an opaque connect error on first query, far from the root cause. Guard early: validate env at startup and fail fast, or loop-include a health check.

**Interviewer's intent:** Tests whether you understand the gap between TypeScript's guarantees and runtime reality.

---

## §D3. Frontend / React

### Why does MapView render a loading placeholder during SSR?

**Q:** "MapView returns 'Loading map...' on first render and only mounts Leaflet in `useEffect`. Why?"

**Direct answer:** Leaflet touches `window`/`document` at import time, which doesn't exist during SSR. The component defers both the library import and the DOM mount to the client via `useEffect` + dynamic `import("leaflet")`.

**Concept:** SSR renders React to a string on the server. Any module reading browser globals at load time will throw server-side. The standard fix is to gate on a mounted flag (`isClient`) and lazy-load the library after hydration. Leaflet's CSS is injected via a dynamically created `<link>` for the same reason.

**Why / tradeoffs:** This is eager during interaction (map only needed in browser) and cheap (no SSR work for an interactive map). A React/Leaflet ssr library would be dependency rent for one component.

**In this project:** `src/components/MapView.tsx:33-97` — `useEffect` → `const L = await import("leaflet")`; `mapRef` div stays empty until `isClient` flips.

**Edge cases / failure modes:** The effect re-runs when `incidents` changes — the cleanup (`cancelled` flag + `mapInstanceRef.current?.remove()`) prevents duplicate map stacks; without it you'd get duplicated canvases/tile requests.

**At scale:** Loading the whole Leaflet lib client-side is a bundle cost; code-split and preload on hover/route intent if the map is below the fold.

**Interviewer's intent:** Probes hydration/SSR understanding and whether you know *why* dynamic imports are used, not just that they're "a thing."

### Controlled form vs server analysis

**Q:** "The report form passes `latitude`/`longitude` as strings into the server function. What's the right validation boundary?"

**Direct answer:** Validation must live at the server boundary — the client form is convenience, not trust. Currently the server only type-checks the shape; range/value validation (e.g. `-90 ≤ lat ≤ 90`) is the gap.

**Concept:** Anything a client sends is attacker-controlled. Server functions accept whatever payloads arrive over RPC, so they are the trust boundary — validate there (Zod/superstruct), not relying on the `<input type=text>`.

**Why / tradeoffs:** The tradeoff is benign now (nothing sensitive), but this exact endpoint is unauthenticated public write — a spam vector (DEBT-003). Cheap to validate types *and* ranges.

**In this project:** `createIncidentReport` validator (`src/functions/incidents.ts:68-79`) types the input; the route uses `navigator.geolocation.getCurrentPosition` + `toFixed(6)` (`report/index.tsx:72-78`).

**Edge cases / failure modes:** `parseFloat("12abc")` returns `12` — auto-zone creation would silently use a garbage coordinate. Range check + format check closes this.

**Interviewer's intent:** Screens for security posture maturity: does the candidate know client validation is UX, not security?

### Why a `useCallback` in requestPermission?

**Q:** "`requestPermission` is wrapped in `useCallback`. Is that actually solving anything here?"

**Direct answer:** Not much alone — the real value is consistency with the hook's other stable references and avoiding re-creating the function on every render if it's consumed by memoized children. On its own it's near-noop.

**Concept:** `useCallback` memoizes a function between renders as long as deps don't change. It only buys re-render savings if the function is passed to memoized components or appears in `useEffect`/`useMemo` dep arrays. Premature memoization is a classic micro-optimization.

**Why / tradeoffs:** Alternative — skip it, or use `useMemo` for the returned object. The returned object is recreated every render regardless, so memoizing the *member* function has limited effect here.

**In this project:** `src/hooks/usePushSubscription.ts:93-97` returns `requestPermission` among a fresh object literal (`usePushSubscription.ts:99-108`).

**Edge cases:** If a Parent passes the whole hook result to a memoized child as props, the object identity changes each render and memoization fails anyway.

**Interviewer's intent:** Sorts candidates who understand memoization semantics from ones who sprinkle it "because it's good."

---

## §D4. Backend / API Design

### Server functions as an API layer

**Q:** "You didn't write REST routes — you used `createServerFn`. Defend that."

**Direct answer:** For a single-app SSR codebase, server functions remove the boilerplate of defining routes and clients separately while preserving full TypeScript contract from call site to query. It's RPC-on-JSON over HTTP with per-function `GET`/`POST` semantics.

**Concept:** TanStack Start compiles each server-side function into an HTTP handler (a Nitro route under the hood) and every client call into a fetch. Validators become the request schema boundary; `.validator()` runs on the server, so untrusted input still passes through it.

**Why / tradeoffs:** You lose the per-resource HTTP semantics (no clean `PUT /incidents/:id`, caching layers tuned to URLs). When you need a public REST/GraphQL API for third parties, you'd stand that up separately next to the function layer.

**In this project:** `createServerFn({ method: "POST" })` — `createIncidentReport` (`incidents.ts:67`), `upvoteIncident` (`incidents.ts:137`), `subscribeToPush`, `unsubscribeFromPush`, `sendZoneNotification`.

**Edge cases / failure modes:** Server functions can leak server-only concerns (env vars) if you return them — `getVapidPublicKey` deliberately returns only the public key (`notifications.ts:6`).

**Interviewer's intent:** Does the candidate evaluate tradeoffs instead of cargo-culting "REST is always right"?

### GET vs POST for state-changing server functions

**Q:** "Why is `upvoteIncident` POST, while queries are GET?"

**Direct answer:** Mutating state must never ride GET — browsers/proxies can pre-fetch or re-issue GETs, and it's semantically wrong for caching. Query servers return data; mutations change state and return a small ack.

**Concept:** HTTP method is part of the API contract. GET should be safe (no side effects) and idempotent; POST is neither guaranteed-safe nor guaranteed-idempotent — which is why the upvote handler explicitly dedupes the same fingerprint to make it idempotent-at-app-level.

**Why / tradeoffs:** RPC-style GETs still carry arguments (`?id=...&fingerprint=...`) — you trade cacheability of *results* for simplicity. The dedup makes the POST effectively idempotent per user, negating retry-with-double-insert risk.

**In this project:** `getZones`/`getIncidents` are `method: "GET"` with validators (`zones.ts:6`, `incidents.ts:45`); `upvoteIncident` checks existing upvote before inserting (`incidents.ts:143-156`).

**Interviewer's intent:** Checks fundamentals: method semantics, idempotency, and where the app-level dedup paper works vs a DB constraint.

### What does `.validator()` actually guard?

**Q:** "What does `createServerFn(...).validator((input) => input)` type-check, and what doesn't it do?"

**Direct answer:** It defines the *shape* of the payload that flows client→server and runs on the server before the handler — so TypeScript and runtime type-shape enforcement are consistent. It does **not** do value validation (ranges, formats, enum membership) out of the box; it's a pass-through identity validator here.

**Concept:** `validator` is a "schema boundary" hook: you can insert Zod there. Non-identity validators `throw` to reject. Because it's server-side, client payloads can't bypass it by calling the endpoint directly.

**Why / tradeoffs:** The project chose not to add a validation lib (dependency budget + the fields are strings/numbers only). That cost is stored as DEBT-003.

**In this project:** `getIncidents` validator types `{ zoneId?, type?, limit?, offset? }` (`incidents.ts:46`); the runtime is defaulted server-side (`limit = 20`).

**Interviewer's intent:** Whether the candidate knows the difference between "typed" and "validated," and where the trust boundary lives.

---

## §D5. Database & Queries

### Why is the upvote stored in a separate table with a unique-ish index?

**Q:** "Explain the upvote schema: separate `upvotes` table + fingerprint, not just `incident_reports.upvotes++`."

**Direct answer:** A normalized `upvotes` table makes each vote auditable and dedup-able by a stable key (incident_id, fingerprint); the composite index closes duplicate votes at the query level. The denormalized `upvotes` integer on the incident is a read cache for display.

**Concept:** You can't trust a client-sent boolean/inc() — the origin of each vote must be stored once. Doubling a counter + inserting the vote row in separate statements is not atomic; the window is what the dedup check guards (with a real DB you'd also add a unique constraint on `(incident_id, fingerprint)`).

**Why / tradeoffs:** Normalized = more writes and joins, but gives you "which reports are confirmed by how many people" as real data (feed sorting, spam detection). A pure counter would be cheap but blind.

**In this project:** `src/db/schema.ts:80-91` — `upvotes` table, `index("upvotes_incident_fingerprint_idx").on(t.incidentId, t.fingerprint)`.

**Edge cases / failure modes:** The count-update in `upvoteIncident` (`incidents.ts:164`) sets `upvotes` to an aggregate expression — worth verifying against Postgres semantics (aggregates in UPDATE SET need a subquery); a regression test with a real DB is missing for this path.

**At scale:** Add a genuine `UNIQUE` constraint on `(incident_id, fingerprint)` and let Postgres reject dupes inside a transaction, instead of check-then-insert.

**Interviewer's intent:** Distinguishes schema design from "add a counter column" thinking, and probes transaction/atomicity awareness.

### Lat/lng as TEXT instead of PostGIS geometry

**Q:** "Why is `latitude`/`longitude` stored as text while you went through the trouble of PostGIS?"

**Direct answer:** Drizzle's PostGIS type support was thin at the time, so coordinates were stored as text and a WKT string side-channel (`geom_wkt`) is used for spatial ops via raw SQL. It works, but you lose native `GIST`-indexed spatial queries — that's logged tech debt (DEBT-001).

**Concept:** PostGIS gives you geometry types (`POINT`, `POLYGON`), a `GIST` index for `ST_DWithin`, `ST_Intersects` etc. Text columns can't be spatially indexed; every distance/average query scans, and `ST_` casts misbehave.

**Why / tradeoffs:** Pragmatic schema for the build speed; the cost is query-time conversion and no spatial index. The fix is a real `geometry` column with a backfill migration — scheduled, not emergency.

**In this project:** `zones.geomWkt` (`schema.ts:23`, comment documents the raw-SQL approach); incident lat/lng text columns (`schema.ts:62-63`).

**Edge cases:** Mixing "saved as WKT" with "computed from lat/lng text" can drift unless writes keep both synchronized — the auto-zone path writes `POINT(lng lat)` verbatim (`incidents.ts:31`).

**At scale:** 100x → geospatial queries (nearest incident, zone overlap) are O(n) scan; with a GIST index they're index-range.

**Interviewer's intent:** Tests whether you understand *why* PostGIS exists and what textual coordinates can't do — the classic "we store coordinates as VARCHAR" trap.

### N+1 in getZonesWithStats

**Q:** "Spot the performance bug in `getZonesWithStats`."

**Direct answer:** It issues 2 `COUNT` queries per zone inside a `Promise.all` loop — for 100 zones that's 201 queries per page load.

**Concept:** N+1 happens when you fetch a list, then per-row query for related data. Fixes: LEFT JOIN + `GROUP BY` with `count(...)`, a single aggregated CTE, or a window function — all match the result set to the number of zones without the loop.

**Why / tradeoffs:** Clarity vs efficiency: the loop is easy to read. Grouped aggregates are harder to assemble into shape but drop the query count to 1.

**In this project:** `src/functions/zones.ts:49-81` — `zonesList.map` with two inner `count(*)` queries each (outages active/scheduled + non-resolved incidents), DEBT-005.

**Edge cases:** Index/statistics sensitivity — counts on filtered status columns benefit from the existing indexes (`outages_status_idx`, `incident_reports_status_idx`).

**Interviewer's intent:** The extract-and-diagnose question: can you recognize the N+1 signature and propose both the fix and the index support.

---

## §D6. Security

### Anonymous, unauthenticated write endpoints

**Q:** "Anyone can POST an incident or a push subscription without signup. Defend or attack that."

**Direct answer:** Attack — this is the weakest surface in the system. Unauthenticated POSTs are correct for anonymous citizen reporting (forcing auth kills participation), but they need rate limiting per IP/fingerprint (DEBT-003), payload size caps, and content validation.

**Concept:** Threat model: spam incidents poisoning the feed, upvote gaming via fingerprint spoofing (fingerprints are client-generated — trivially re-forgeable), pushing junk into `notification_subscriptions`, unbounded description text.

**Why / tradeoffs:** Full auth (email/phone + OTP, the realistic choice for Uganda) is backlog — the product chose frictionless first. Accept the risk, monitor counts per fingerprint/IP, add limits when abuse appears.

**In this project:** `createIncidentReport` (public POST, `incidents.ts:67`), `upvoteIncident` (public POST, `incidents.ts:137`), `subscribeToPush` (public POST, `notifications.ts:12`).

**Edge cases:** Upvote flooding inflates the counter; oversized `description` (no length cap) bloats the feed table; fake subscriptions hijack the push broadcast queue.

**Interviewer's intent:** Security maturity: does the candidate reason about threat models and defense-in-depth rather than declaring "no auth = broken" or "no auth = fine"?

### VAPID keys and secrets hygiene

**Q:** "Where do push credentials live, and what would alarm you at deploy time?"

**Direct answer:** The VAPID public/private keypair and `DATABASE_URL` come from env vars only — `.env.example` documents them without values, `.env.local` is gitignored. The public key is exposed (it's meant to be), the private key is never returned by any server function.

**Concept:** VAPID: public key signs subscriptions client-side and is sent to the push service; the private key signs sends server-side. Leaking the private key lets an attacker impersonate your push identity (spoof notifications).

**Why / tradeoffs:** Setting VAPID server-side once per send (`webPush.setVapidDetails`) keeps no secrets in code. `getVapidPublicKey` returning only the public half (`notifications.ts:6-10`) is the intended boundary.

**Edge cases:** Missing keys are silently no-op (the `if` guard, `notifications.ts:80`); a wrong DB URL produces a connection-time error instead of a clear config error.

**Interviewer's intent:** Secret handling, env discipline, and whether you'd know a real push-spoofing leak from a config hiccup.

### The reverse-geocoding SSRF-ish surface

**Q:** "`reverseGeocode` fetches `https://nominatim.openstreetmap.org/reverse?...` from server-side code with user-supplied lat/lng. Any concern?"

**Direct answer:** Low severity by design — the host is hardcoded to OpenStreetMap and only numbers are interpolated into the path, so there's no URL/path injection or arbitrary-host SSRF. The residual risks are quota/abuse (each report triggers an external call) and upstream latency.

**Concept:** SSRF = attacker influences the *target* of a server request. Here impact is limited to query parameters on a fixed host. Genuine risks: nominatim usage policy (requires a proper `User-Agent` — set at `geocoding.ts:29`), rate limits, and blocking your server on a third-party hop.

**Why / tradeoffs:** The auto-zone creation (incidents.ts:8-43) trades a failing geocode for a coordinate-derived placeholder name rather than failing the whole report — good resilience, but it means zone quality depends on a public API.

**Edge cases:** If nominatim is down, every report silently lands in a "nearest coords" zone; the catch at `incidents.ts:90-93` means the report still saves with `zoneId = null`.

**Interviewer's intent:** Filters candidates who can articulate *which* server-side fetch patterns are actually dangerous versus textbook fear.

---

## §D7. Performance & Scalability

### Bundle and hydration of the map path

**Q:** "What's the client payload story for the home page and the map?"

**Direct answer:** Leaflet and its CSS load only on the client, dynamically, and only when `MapView` mounts — so the SSR HTML sent to the browser doesn't include a framework map bundle. The cost is a separate JS round-trip (plus the CARTO tile CDN).

**Concept:** Code-splitting via dynamic `import` means the module participates in client-side splitting; `React.lazy`/route splitting would do the same at route granularity. The switch from `window` access to client-gated import *both* fixes SSR and reduces initial bytes.

**Why / tradeoffs:** You trade a slightly slower first map paint (extra fetch) for faster initial load of the rest of the page. No caching headers on the tile proxy = repeated fetch risk; acceptable for v1.

**In this project:** `src/components/MapView.tsx:29-44` — `isClient` gate + `import("leaflet")` + dynamic `<link>` for `leaflet.css`.

**Interviewer's intent:** Links SSR-safety and performance: can the candidate connect hydration, code splitting, and async CSS ordering?

### Postgres connection pooling story

**Q:** "Your serverless deploy (Vercel) will run many concurrent function instances, each creating a `postgres()` client. Problem?"

**Direct answer:** Yes — each cold function instance is a new client; serverless instance spikes can exhaust the Postgres connection pool on Supabase. The fix is a pooler connection (pgBouncer / Supabase pooler URL, already noted in `.env.example`) plus client reuse where Warmers allow.

**Concept:** `postgres-js` keeps a bounded pool per client instance, but "instance" here maps to a serverless process lifetime. Many ephemeral instances × pool size = more connections than the DB allows (default ~100). Pooler URL (transaction mode) floors it.

**Why / tradeoffs:** The `.env.example` already documents the Supabase transaction- pooler URL for production. Locally (Docker Postgres) it's a non-issue.

**Edge cases:** Stale connections after deploys; connection total vs active — Supabase "transaction" pooler mode handles most browser-style short queries.

**Interviewer's intent:** Deployment-awareness: knowing that "it worked locally in one process" flips in serverless is the senior tell.

---

## §D8. Testing & QA

### Why do the server-function tests only assert `typeof x === "function"`?

**Q:** "`zones.test.ts` just checks functions exist. Is that a real test?"

**Direct answer:** No — it's a smoke/skeleton test proving the server-function factory is exported, not behavior. It's honest as a *contract* (the exports are server functions, not plain functions) but covers zero query logic; the meaningful integration coverage lives at the route/component level.

**Concept:** Testing Trophy ordering: integration > unit > static > e2e. "Does calling `getZones` return zones filtered by search" needs a DB/integration harness — currently missing. The typed `createServerFn` chain plus `tsc` catches *some* shape drift statically.

**Why / tradeoffs:** No test DB in CI + `createServerFn` handlers wrapping `db` makes unit-testing awkward without an in-memory/mocked adapter, so behavioral tests were skipped. That's recorded debt (ROADMAP RISK-004: no E2E).

**In this project:** `src/functions/zones.test.ts` (all three assertions are existence checks); route tests `src/routes/report/index.test.tsx`, `src/routes/index.test.tsx` cover submit/validation flow via RTL.

**Interviewer's intent:** Whether the candidate reads tests critically — the interview itself is testing your testing.

### Testing a browser-push hook in jsdom

**Q:** "How would you test `usePushSubscription` — it touches `navigator.serviceWorker`, `Notification`, `atob` — in jsdom?"

**Direct answer:** You'd fake the browser APIs: stub `navigator.serviceWorker.ready`, `pushManager.getSubscription/subscribe`, `Notification.permission/requestPermission`, and mock the three imported server functions. With Vitest you can `vi.stubGlobal`/`vi.mock` and assert the returned state machine transitions.

**Concept:** jsdom doesn't implement service workers or push — so the *test* stubs the browser boundary and asserts the hook's logic (which key is used, what payload is sent to `subscribeToPush`). The real behavior gets verified manually/E2E in a real browser.

**Why / tradeoffs:** This is the correct level of mocking — you mock the platform you don't own (browser), and mock the network call, but you do test your own state transitions. `urlBase64ToUint8Array` is a pure function perfect for plain unit tests.

**In this project:** `src/hooks/usePushSubscription.ts:9-18` (pure base64→Uint8Array), mutation closure sends `{zoneId, endpoint, p256dh, auth, types}` (`usePushSubscription.ts:60-68`). A `usePushSubscription.test.ts` does not exist yet.

**Interviewer's intent:** Separate candidates who know *what* to mock (things you don't own) from those who mock everything, including their own logic.

---

## §D9. CI/CD & DevOps

### What should the CI gate enforce for this stack?

**Q:** "Design the CI pipeline for this repo."

**Direct answer:** One quality job mirrors the local commit gate in order: install (frozen lockfile) → lint → typecheck → test → build. No DB service is needed because the suite doesn't hit a real database today — so the pipeline can run free and fast.

**Concept:** CI should reproduce the local gate (§1.1 of ci-partner) so the two never diverge: local `pnpm lint && pnpm typecheck && pnpm test && pnpm build` must equal CI's steps, in the same order, on the same Node major.

**Why / tradeoffs:** Adding a Postgres service now buys nothing (tests don't query). When integration tests with a real DB arrive, add a `postgres:16` service step — until then it's pure wall-clock cost.

**In this project:** Node 22 (Vite 7 needs ≥20.19), pnpm frozen-lockfile install, `eslint .`, `tsc --noEmit`, `vitest run`, `vite build`. Formatter stage skipped — no `.prettierrc`/`.biome.json` (would be added with a formatter decision).

**Interviewer's intent:** Does the candidate derive steps from the actual repo (lockfiles, scripts, Node engines) instead of pasting a template?

### Vercel + Nitro deploy specifics

**Q:** "What's special about deploying a TanStack Start app to Vercel?"

**Direct answer:** The build emits a Nitro server bundle (`.output/`) rather than a static site — so Vercel must run it as serverless/server via Nitro's Vercel preset, and the project carries a Nitro plugin (commit 3bd8781) to wire that. Env vars (DB URL, VAPID) are set in the Vercel dashboard, never committed.

**Concept:** TanStack Start fronts an SSR server (Nitro handles SSR + server functions as serverless functions). Vercel supports Nitro's `preset: vercel`, emitting a handler that adapts to serverless runtime. SSR + Web Push both require a server — no static-only deploy.

**Why / tradeoffs:** Supabase database keeps serverless cold starts free of cluster setup; you pay the SSR cold-start tax per function instance, mitigated by warm-up invocations or regional config.

**In this project:** `.output` is gitignored (built in CI/deploy), `vite.config.ts` + the Nitro plugin produce the server bundle; `.env.example` documents the prod DB as Supabase.

**Interviewer's intent:** Operational realism — most candidates can't describe how SSR/SSR-functions deploy; here it's proven by repo artifacts.

---

## §D10. Accessibility

### The report form's chosen type-control

**Q:** "Assess the report form's type selector for assistive tech and keyboard use."

**Direct answer:** Good structure — it uses `<fieldset>/<legend>` semantics shared by a group of labeled buttons, so a screen reader names the group and announces each option as selected. Buttons are keyboard-activatable and the selected state is conveyed by border/color + `aria-pressed` (currently visual-only — the aria attribute is missing).

**Concept:** WCAG requires programmatic state disclosure, not just visual. A "selected" card that only changes border/background fails 1.3.1/4.1.2 for non-visual users — `aria-pressed=true/false` or proper radio-group semantics fixes it. `fieldset/legend` gives the group a name, labels give each control a name.

**Why / tradeoffs:** Pixel-perfect card UI usually sacrifices radio semantics; the fix (add `aria-pressed`) is minimal — a corner case where a11y is nearly free.

**In this project:** `src/routes/report/index.tsx:148-171` — `fieldset` → per-type `<button>` with `onClick` state swap.

**Edge cases:** Keyboard users get cursor-move + Enter activation on buttons — that works; the gap is state announcement on `aria-pressed`.

**Interviewer's intent:** Real a11y fluency — a candidate who cites specific ARIA attributes and WCAG SCs instead of vague "make it accessible" claims.

---

## §D11. Project Deep-Dive

### Why TanStack Start and not Next.js?

**Q:** "You chose TanStack Start over the industry default. Walk an interviewer through that."

**Direct answer:** It was a deliberate bet (ADR-003): file-based routing, `createServerFn` RPC with end-to-end type safety, React 19 compatibility, and staying inside the TanStack ecosystem (Router/Query/Form) whose model this app is built on.

**Concept:** Next.js is more battle-tested with a bigger ecosystem and more hiring-market familiarity. TanStack Start trades that predictability for a tighter type contract and the modern file-based router, at the cost of a smaller community and chancier release cadence (a Nitro beta pin in `package.json` shows the bleed).

**Why / tradeoffs:** For an SSR app whose whole domain is typed data (zones/incidents/subscriptions), the type-safe RPC layer is a concrete daily win. The risk is long-term support/maintenance — a known, accepted frontier risk.

**In this project:** Every data path is a `createServerFn` (`src/functions/*`), Router export is `getRouter` (`router.tsx`), and a Nitro beta is pinned (`package.json` → `nitro`).

**Interviewer's intent:** Judgments over buzzwords — can you articulate a real tradeoff you took personally?

### Why web-push and not FCM?

**Q:** "Why self-host Web Push with VAPID instead of Firebase Cloud Messaging?"

**Direct answer:** FCM would add a Google developer dependency, a second vendor SDK, and platform-specific wiring for zero feature gain here — the browser's native Push API + VAPID covers Chrome/Firefox/Safari desktop push for this audience.

**Concept:** Web Push is the standard: browser hands the app a unique subscription, VAPID ties the sender identity to a keypair you control. FCM is a transport you don't own; you'd send *through* it. Self-hosting means delivering via the browser's push service directly.

**Why / tradeoffs:** The costs are real: subscription lifecycle management (deactivated subs must be cleaned), payload size limits (~4KB), and no fallback when the OS kills push service. The diagnostic path you own (deactivate-on-error, `notifications.ts:117-123`) is a documented choice.

**In this project:** VAPID keyserver-side, `usePushSubscription` subscribes with the public key (`usePushSubscription.ts:52-55`), and sends are fire-and-forget (`incidents.ts:131`).

**Interviewer's intent:** Deeper "why this library" reasoning — most candidates have never implemented Web Push, so the answer separates theory from shipped reality.

### The growable zone graph

**Q:** "Zones auto-create from GPS on a report. What's the failure mode if two people report the same spot?"

**Direct answer:** The same area resolves to the same geocoded name and matches an existing zone via `ilike(zone.name)` — so they usually collapse to one zone. Race window: two concurrent reports can both miss the match and insert duplicates before either commit lands.

**Concept:** Check-then-insert is non-atomic. The mitigation is a unique index on the name-normalized column or `INSERT ... ON CONFLICT`; matching on `ilike` is fuzzy (case/whitespace) so a plain unique constraint wouldn't fully de-dup either.

**Why / tradeoffs:** Auto-creation maximizes citizens' value (no zone picker friction) at the cost of schema drift — free-form names, no official polygon per zone (that's the real future: admin-drawn zone polygons).

**In this project:** `findOrCreateZone` (`incidents.ts:8-43`) — reverse geocode → `ilike` match → else insert with `POINT(lng lat)` WKT.

**Interviewer's intent:** Data-integrity reasoning: does the candidate see the race and the constraint-based fix, and the semantic fuzziness of name-matching geographic zones?

### The silent notification chain

**Q:** "Trace the notification path for a real new incident. Where can it silently drop?"

**Direct answer:** Report insert → if a zone resolved, label + `sendZoneNotification` fire-and-forget → selects active subs for zone → per-sub `webPush.sendNotification`. Silent drops: geocode failure (`zoneId` null → no notify), no active subs, expired subscription (deactivated), and the outer `.catch(() => {})` swallowing a wholesale send failure.

**Concept:** Fire-and-forget trades durability for latency — an accepted product trade. Each drop point is intentional but invisible: no retries, no dead-letter, no audit log of "intended recipients vs delivered."

**Why / tradeoffs:** The anti-pattern would be blocking the report response on push (a 2-second per-sub network call horror). The accepted cost appears later: debugging "why didn't Nana get notified?" requires DB spelunking.

**In this project:** `incidents.ts:111-132` (gate + fire-and-forget), `notifications.ts:98-127` (selection, send loop, deactivate-on-error).

**Interviewer's intent:** End-to-end tracing under failure — the "where does it break" fluency that distinguishes debugging seniors.

---

## §D12. Behavioral & Decisions

### Choosing between two strong options

**Q:** "Tell me about a time you chose between two strong technical options."

**Answer (STAR):**
- **Situation:** Bootstrapping a citizen-reporting platform, needed a geospatial store and a notification path.
- **Task:** Pick the stack; both directions credible.
- **Action:** Weighted by long-term ownership + cost: Postgres/PostGIS for mature spatial ops even though MongoDB was simpler to start; pushed the Drizzle-over-Prisma call on type safety and closeness to SQL, documented rejected alternatives in DECISIONS.md (ADR-001/ADR-002).
- **Result:** Five-table PostGIS schema shipped and wired without a rewrite; the choices stayed settled through four sprints (verified in DECISIONS.md), and the one regret (text lat/lng) is tracked debt, not a surprise.

### A hard bug, diagnosed

**Q:** "Walk me through a hard bug you found."

**Answer (STAR):**
- **Situation:** After pushing notifications live, sends crashed at runtime and GPS zone auto-creation failed.
- **Task:** Root-cause both on the same deploy surface.
- **Action:** Split the symptoms — push crash traced to unguarded VAPID/subscription paths; auto-creation traced to missing geocode fallback. Added fire-and-forget wrapping and coordinate-fallback naming, and seeded Kampala defaults (commit a3d0f64). Logged the recovery pattern in ERROR_LOG ERR-002.
- **Result:** Hard-crash eliminated; the fix survived as the reference pattern for the notification path (documented in INTERVIEW_QA and ERROR_LOG).

### Scope pressure / cutting a feature

**Q:** "How do you handle scope pressure or cutting a feature you wanted?"

**Answer (STAR):**
- **Situation:** Four sprints in, demanded breadth (photo upload, admin dashboard, mobile app) versus finishing deployment reliability (CI, error boundaries, rate limiting).
- **Task:** Protect the "Should Have" core while not quietly killing the backlog.
- **Action:** MoSCoW explicit in ROADMAP.md: reclassified mobile app to Won't-Have-v1 with a reason; pushed rate limiting to Sprint 5 as a demonstrable risk (public POSTs); kept photo upload + admin dashboard as Could-Have with owners.
- **Result:** The platform shipped deployable (Vercel/Nitro/Supabase) before any excluded feature; the backlog survived visibly in ROADMAP instead of being silently deleted.

---

## Personal Study Queue

| Question | Domain | Status | Last drilled |
|---|---|---|---|
| Aggregate in UPDATE SET (incidents.ts:164) — correct semantics? | Database | weak | — |
| Serverless connection pooling for postgres-js | Performance | weak | — |
| aria-pressed vs radio-group for card selectors | Accessibility | weak | — |
| VAPID private key leak impact | Security | medium | — |
| Unique constraint vs app-level dedup for upvotes | Database | medium | — |
| Test strategy: skeleton tests vs integration tests | Testing | medium | — |