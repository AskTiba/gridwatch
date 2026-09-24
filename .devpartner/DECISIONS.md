# Decisions Log — GridWatch (municipal-utility-monitor)

> All non-trivial architectural, technology, process, and scope decisions — including
> disagreements and overrides — are recorded here. Settled decisions are not re-opened.
> Last updated: 2026-09-24

---

## How to Read This Log

- **Decisions** are final choices; they don't need re-discussion
- **Overrides** are logged when Emily disagreed but the developer chose differently; they
  include the accepted risk
- **Process Improvements** come from sprint retrospectives

---

## Architecture Decisions

| ID | Date | Decision | Persona | Options considered | Chosen rationale |
|---|---|---|---|---|---|
| ADR-001 | 2026-08-27 | PostgreSQL + PostGIS for geospatial queries | Staff Database Engineer | MongoDB (GeoJSON, fewer spatial ops), Supabase (adds complexity) | Native spatial support, mature, widely supported |
| ADR-002 | 2026-08-27 | Drizzle ORM over Prisma | Staff Database Engineer | Prisma (heavier), raw SQL (less safety) | Lighter, better TS inference, closer to SQL |
| ADR-003 | 2026-08-27 | TanStack Start over Next.js | Staff Software Architect | Next.js (more mature), Remix (different architecture) | SSR with TanStack ecosystem, file-based routing, server functions |
| ADR-004 | 2026-08-27 | Leaflet over Mapbox GL | Frontend | Mapbox GL (more features, API key + cost) | Free, open-source, sufficient |
| ADR-005 | 2026-08-27 | web-push for notifications | Security Engineer | Firebase Cloud Messaging (Google dep), OneSignal (3rd-party) | Standards-based, VAPID, no third-party dependency |
| ADR-006 | 2026-08-27 | Fingerprint-based upvote dedup | Security Engineer | IP-based (VPN/proxy issues), account-based (requires auth) | Anonymous users, no auth needed |
| ADR-007 | 2026-08-27 | Docker PostgreSQL for local dev | DevOps / Platform Engineer | Local PostgreSQL (manual setup), SQLite (no PostGIS) | Easy setup, reproducible |
| ADR-008 | 2026-08-27 | Exclude `*.test.ts` from route generation | Staff Software Architect | None — clear best practice | Prevent tests being treated as routes |
| ADR-009 | 2026-08-28 | pnpm as package manager | DevOps / Platform Engineer | npm, yarn, bun | Faster installs, disk-efficient store; migrated from npm |
| ADR-010 | 2026-08-28 | Vercel + Supabase production targets | DevOps / Platform Engineer | Self-hosted, other PaaS | Zero-config serverless for Nitro output; Supabase always-on Postgres |
| ADR-011 | 2026-09-24 | GitHub Actions as CI platform | DevOps / Platform Engineer | GitLab CI, CircleCI | Remote is GitHub (AskTiba/gridwatch); native integration, free runners |

---

## Technology / Dependency Choices

| ID | Date | Library/Tool | Version | Why chosen | Rejected alternatives |
|---|---|---|---|---|---|
| TECH-001 | 2026-08-27 | Drizzle + postgres-js driver | ^0.44.0 / ^3.4.0 | Light ORM, direct SQL access | Prisma, Knex |
| TECH-002 | 2026-08-28 | Vite 7 + plugin-react | ^7.0.0 | Fast HMR, optimized builds | Webpack |

---

## Developer Overrides

*(No overrides yet)*

---

## Process Improvements

| Date | Sprint | Improvement | Status |
|---|---|---|---|
| 2026-09-24 | 5 | Apply Skill 6.0 protocol — full 7-file .devpartner/, CI scaffold, interview bank | In progress |

---

## Tech Debt Register

| ID | Date | Item | Impact | Target sprint to address |
|---|---|---|---|---|
| DEBT-001 | 2026-08-27 | GPS coords stored as `text` (lat/lng), not PostGIS `geometry` | Spatially indexed queries not possible; `geom_wkt` kept in sync manually | Sprint 6+ |
| DEBT-002 | 2026-09-24 | No formatter config (ESLint only) | No enforced formatting consistency | Sprint 5 |
| DEBT-003 | 2026-09-24 | No rate limiting on server functions | Public POST endpoints (incident create, upvote) abuse-able | Sprint 5 |
| DEBT-004 | 2026-09-24 | Push send loops subscriptions sequentially | Slow fan-out at scale (N subscribers = N network calls) | Sprint 6+ |
| DEBT-005 | 2026-09-24 | `getZonesWithStats` runs N+1 count queries (2 per zone) | Proportional query cost per zone listed | Sprint 6+ |