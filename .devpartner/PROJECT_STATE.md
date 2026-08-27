# PROJECT_STATE.md

## Current State (2026-08-27)

### What Currently Works
- TanStack Start SSR app with TanStack Router (file-based routing)
- PostgreSQL + PostGIS + Drizzle ORM schema (5 tables: zones, outages, incident_reports, upvotes, notification_subscriptions)
- App shell: Header, Footer, ThemeToggle with dark mode
- Zone lookup page with search
- Zone detail page with grid schedule calendar
- Incident report form with geolocation capture
- Live incident feed with infinite scroll
- Leaflet MapView component (client-only SSR-safe)
- Server functions for all CRUD operations
- Upvote system with fingerprint dedup
- Push notification system (VAPID, service worker, server functions, React hook)
- Subscribe/unsubscribe button on zone detail page
- 31 tests passing across 8 test files
- TypeScript: 0 errors, ESLint: 0 errors

### In Progress
- No active work in progress

### Broken/Blocked
- Working tree has uncommitted package.json changes + pnpm-lock.yaml (npm → pnpm migration artifact)

### Next Steps (Sprint 5 candidates)
- Vercel deployment setup
- CI/CD pipeline (GitHub Actions)
- Error boundaries and loading states
- Accessibility audit (WCAG 2.2 AA)
- Rate limiting on server functions
- Search/filter for incidents feed
- Photo upload for incident reports
- Admin dashboard for zone management

### Key Architecture Facts
- Stack: TanStack Start + TanStack Router + TanStack Query + TanStack Form + Tailwind CSS v4 + Shadcn/UI patterns + PostgreSQL/PostGIS + Drizzle ORM + Leaflet + web-push
- Database: PostgreSQL 16 via Docker (municipal-pg container, port 5432)
- Testing: Vitest + React Testing Library + userEvent + jsdom
- Router export: `getRouter` (not `createRouter`)
- CSS: Tailwind v4 via `@import "tailwindcss"` + `@theme` custom properties
- Server functions: `createServerFn` from `@tanstack/react-start`
