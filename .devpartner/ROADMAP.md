# Roadmap — GridWatch (municipal-utility-monitor)

> Vision, milestones, NFR targets, backlog snapshot, and tech debt register.
> Last updated: 2026-09-24

---

## Vision

**One-sentence product vision:**
> A community-driven municipal utility and power grid monitoring platform that enables
> citizens to report incidents, track outages, and receive real-time push notifications
> about infrastructure issues in their zone.

**Core problem solved:**
> The gap between when an infrastructure incident (power cut, water leak, pothole, dead
> street light) happens and when official crews acknowledge it — powered by citizen
> reports geotagged and mapped to zones.

---

## MVP Scope (MoSCoW)

| Priority | Feature | Status | Sprint |
|---|---|---|---|
| **Must Have** | Zone lookup + detail (schedule calendar) | ✅ Done | 1–2 |
| | Incident reporting with geolocation | ✅ Done | 2 |
| | Live incident feed (infinite scroll) + upvotes | ✅ Done | 3 |
| | Push notifications per zone | ✅ Done | 4 |
| | Deployment (Vercel + Supabase) | ⚠️ In progress | 5 |
| **Should Have** | CI/CD pipeline | ⚠️ In progress | 5 |
| | Error boundaries + loading states | ⏸ Not started | 5 |
| | Accessibility audit (WCAG 2.2 AA) | ⏸ Not started | 5 |
| | Rate limiting on server functions | ⏸ Not started | 5 |
| **Could Have** | Incident search/filter | ⏸ Not started | 6+ |
| | Photo upload | ⏸ Not started | 6+ |
| | Admin dashboard (zone management) | ⏸ Not started | 6+ |
| | Email notifications | ⏸ Not started | 6+ |
| | Real-time updates (WebSocket) | ⏸ Not started | 6+ |
| **Won't Have (v1)** | Mobile app (React Native) — later, supersedes PWA path | ❌ Excluded | — |

---

## Milestones

| # | Milestone | Target date | Status | Key features |
|---|---|---|---|---|
| M1 | MVP (Sprints 1–5) | 2026 Q4 | ⚠️ In progress | All Must/Should Have above |
| M2 | v1.1 | TBD | ⏸ Not started | Search/filter, photo upload, admin dashboard |

---

## Non-Functional Requirements (NFR Targets)

> Concrete, measurable targets. "Fast" and "scalable" are not targets.

| Requirement | Target | Measurement method | Current baseline |
|---|---|---|---|
| Page load (LCP) | < 2.5s on 4G | Lighthouse / WebPageTest | *(not measured yet)* |
| API response time (p95) | < 200ms | APM / load test | *(not measured yet)* |
| Concurrent users | 500 | Load test | *(not measured yet)* |
| Bundle size (initial JS) | < 150KB gzip | Vite/Rollup analyzer | *(not measured yet)* |
| Uptime | 99.9% | Monitoring | *(not measured yet)* |
| Accessibility | WCAG 2.2 AA | axe-core / manual audit | *(not measured yet — Sprint 5)* |
| TypeScript | 0 errors | `pnpm typecheck` | ✅ 0 errors (2026-08-27) |
| ESLint | 0 errors | `pnpm lint` | ✅ 0 errors (2026-08-27) |
| Test suite | all green | `pnpm test` | ✅ 31 tests / 8 files (2026-08-27) |

### Performance Log

| Date | Metric | Value | Notes |
|---|---|---|---|
| *(none measured yet)* | | | |

---

## Backlog Snapshot

> Full backlog in SPRINT_LOG.md. Top priorities below.

### Ready for next sprint

| ID | Story | Points | Priority |
|---|---|---|---|
| — | Error boundaries + loading states | 3 | Should Have |
| — | Accessibility audit (WCAG 2.2 AA) | 5 | Should Have |
| — | Rate limiting on server functions | 3 | Should Have |
| — | Incident search/filter | 3 | Could Have |
| — | Photo upload for reports | 5 | Could Have |

---

## Tech Debt Register

> See DECISIONS.md → Tech Debt Register for the full list.
> This section tracks the highest-priority items.

| ID | Item | Impact | Target sprint |
|---|---|---|---|
| DEBT-003 | No rate limiting on public POST endpoints | Abuse / spam risk | 5 |
| DEBT-002 | No formatter config | Formatting inconsistency | 5 |
| DEBT-005 | N+1 count queries in `getZonesWithStats` | Slow zones listing | 6 |
| DEBT-004 | Sequential push fan-out | Slow large broadcasts | 6 |
| DEBT-001 | Lat/lng stored as text, not PostGIS geometry | No spatial index | 6 |

---

## Risks

| ID | Risk | Probability | Impact | Mitigation |
|---|---|---|---|---|
| RISK-001 | PostGIS geometry stored as WKT text — spatial ops via raw SQL can drift from Drizzle schema | Medium | Medium | DEBT-001; document convention in schema comment |
| RISK-002 | Anonymous fingerprint upvotes can be spoofed (no auth) | Medium | Low | Accept for v1; log spike alerts via counts |
| RISK-003 | VAPID keys / DB URL misconfigured in prod → notifications or app fail at runtime | Medium | High | `.env.example` documented; CI validates build; ERROR_LOG ERR-002 pattern |
| RISK-004 | No E2E coverage yet | Medium | Medium | Add Playwright happy-path per feature in Sprint 6 |