# DECISIONS.md

## Technical Decisions

| Date | Decision | Rationale | Alternatives Considered |
|------|----------|-----------|------------------------|
| 2026-08-27 | Use PostgreSQL + PostGIS for geospatial queries | Native spatial support, mature, widely supported | MongoDB (GeoJSON but less spatial ops), Supabase (adds complexity) |
| 2026-08-27 | Use Drizzle ORM over Prisma | Lighter, better TypeScript inference, closer to SQL | Prisma (heavier, more abstraction), raw SQL (more control but less safety) |
| 2026-08-27 | Use TanStack Start over Next.js | SSR with TanStack ecosystem, file-based routing, server functions | Next.js (more mature but different ecosystem), Remix (different architecture) |
| 2026-08-27 | Use Leaflet over Mapbox GL | Free, open-source, sufficient for this use case | Mapbox GL (more features but requires API key + cost) |
| 2026-08-27 | Use web-push for notifications | Standards-based, works with VAPID, no third-party dependency | Firebase Cloud Messaging (Google dependency), OneSignal (third-party) |
| 2026-08-27 | Use fingerprint-based upvote dedup | Anonymous users, no auth needed, simple | IP-based (VPN/proxy issues), account-based (requires auth) |
| 2026-08-27 | Docker PostgreSQL for local dev | Easy setup, reproducible, no local install | Local PostgreSQL (manual setup), SQLite (no PostGIS) |
| 2026-08-27 | Exclude `.test.ts` files from route generation | Avoid test files being treated as routes by TanStack Router | None — clear best practice |
