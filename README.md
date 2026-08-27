<div align="center">

# ⚡ GridWatch

**Real-time municipal infrastructure monitoring — powered by citizens.**

A full-stack platform for reporting power outages, water leaks, and municipal infrastructure issues, with zone-based tracking, interactive maps, and push notifications.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TanStack Start](https://img.shields.io/badge/TanStack-Start-DC0032)](https://tanstack.com/start)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://postgresql.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)

</div>

---

## Overview

GridWatch enables citizens to report infrastructure issues (power cuts, water leaks, potholes, broken street lights) in real-time. Reports are geotagged, zone-mapped, and visualized on an interactive map. Zone subscribers receive push notifications when new incidents are reported in their area.

**Key value proposition:** Community-driven monitoring fills the gap between when an outage happens and when official crews arrive — giving residents real-time visibility into their neighborhood's infrastructure status.

## Features

| Feature | Description |
|---------|-------------|
| **Zone Management** | Browse zones, view grid schedules, see active incidents per zone |
| **Incident Reporting** | Submit geotagged reports with type, description, and location capture |
| **Live Incident Feed** | Infinite-scroll feed of all reported incidents with upvote support |
| **Interactive Map** | Leaflet-powered map showing zones and incident locations |
| **Push Notifications** | Browser push alerts when new incidents are reported in subscribed zones |
| **Theme System** | System/Light/Dark toggle with OS preference detection and localStorage persistence |
| **Responsive Design** | Mobile-first layout across all viewports (320px → ultrawide) |
| **Accessibility** | WCAG 2.2 AA — semantic HTML, keyboard navigation, focus rings, screen reader support |

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Framework** | [TanStack Start](https://tanstack.com/start) | Full-stack React with SSR, file-based routing, server functions |
| **Routing** | [TanStack Router](https://tanstack.com/router) | Type-safe file-based routing with automatic code splitting |
| **Data Fetching** | [TanStack Query](https://tanstack.com/query) | Server state management with caching, infinite scroll, mutations |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) | Utility-first CSS with custom design tokens |
| **Database** | [PostgreSQL](https://postgresql.org) + [PostGIS](https://postgis.net) | Geospatial queries for zone/incident proximity |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team) | Type-safe SQL, zero-overhead, PostgreSQL-native |
| **Maps** | [Leaflet](https://leafletjs.com) + [React-Leaflet](https://react-leaflet.js.org) | Interactive maps with zone boundaries and incident markers |
| **Notifications** | [Web Push](https://developers.google.com/web/fundamentals/push-notifications) | VAPID-authenticated browser push notifications |
| **Testing** | [Vitest](https://vitest.dev) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) | Component and integration testing |
| **Build** | [Vite](https://vitejs.dev) | Fast HMR, optimized production builds |

## Design System

The UI follows a token-based design system for consistency across light, dark, and system themes.

| Token | Purpose |
|-------|---------|
| `--color-primary` | Indigo-based trust palette (light: `#3730a3`, dark: `#818cf8`) |
| `--color-surface` / `--color-surface-elevated` | Layered surfaces with dark mode elevation |
| `--color-*-subtle` | Tinted backgrounds for primary, danger, warning, success states |
| `--shadow-sm/md/lg` | Progressive elevation system |
| `--radius` / `--radius-lg` / `--radius-xl` | Consistent border radius scale |

**Motion:** CSS transitions (150–200ms) on all interactive elements, entrance animations with stagger delays, `prefers-reduced-motion` fully respected.

**Typography:** Inter font family, `text-wrap: balance` on headings, `text-wrap: pretty` on paragraphs, fluid spacing.

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                         │
│                                                              │
│  Zones Page    Incidents Feed    Report Form    Map View     │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                   TANSTACK START SERVER                      │
│                                                              │
│  getZones            getZoneById          getZoneOutages     │
│  getIncidents        createIncidentReport upvoteIncident     │
│  getVapidPublicKey   subscribeToPush      sendNotification   │
│  unsubscribeFromPush                                         │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                    PostgreSQL + PostGIS                      │
│                                                              │
│  zones    outages    incident_reports    upvotes             │
│                                          notification_subs   │
└──────────────────────────────────────────────────────────────┘
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18+
- [Docker](https://docker.com) (for local PostgreSQL)
- [pnpm](https://pnpm.io)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/gridwatch.git
cd gridwatch

# Install dependencies
pnpm install

# Start PostgreSQL (via Docker)
docker run -d \
  --name gridwatch-pg \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=gridwatch \
  -p 5432:5432 \
  postgres:16-alpine

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database URL and VAPID keys

# Push database schema
pnpm exec dotenv -e .env.local -- pnpm exec drizzle-kit push

# Seed test zones (optional)
docker exec gridwatch-pg psql -U postgres -d gridwatch -c "
INSERT INTO zones (id, name, neighborhood, municipality, geom_wkt) VALUES
('zone-1', 'Zone 1 - Downtown', 'Downtown Central', 'Springfield', 'POINT(-74.0060 40.7128)'),
('zone-2', 'Zone 2 - Riverside', 'Riverside District', 'Springfield', 'POINT(-74.0030 40.7148)'),
('zone-3', 'Zone 3 - Hillcrest', 'Hillcrest Heights', 'Springfield', 'POINT(-74.0090 40.7108)');
"

# Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `VAPID_PUBLIC_KEY` | Web Push VAPID public key | For notifications |
| `VAPID_PRIVATE_KEY` | Web Push VAPID private key | For notifications |
| `VAPID_EMAIL` | Contact email for VAPID | For notifications |

Generate VAPID keys with:
```bash
npx web-push generate-vapid-keys
```

## Database Schema

```
┌────────────────────┐       ┌────────────────────┐
│       zones        │       │      outages       │
├────────────────────┤       ├────────────────────┤
│ id          (UUID) │◄──┐   │ id          (UUID) │
│ name        (TEXT) │   │   │ zone_id     (UUID) │──┐
│ postal_code (TEXT) │   ├───│ type        (TEXT) │  │
│ neighborhood(TEXT) │   │   │ status      (TEXT) │  │
│ municipality(TEXT) │   │   │ scheduled_start    │  │
│ geom_wkt    (TEXT) │   │   │ scheduled_end      │  │
│ created_at  (TS)   │   │   │ reason      (TEXT) │  │
└────────────────────┘   │   │ source      (TEXT) │  │
                         │   └────────────────────┘  │
                         │                           │
                         │   ┌────────────────────┐  │
                         │   │  incident_reports  │  │
                         │   ├────────────────────┤  │
                         │   │ id          (UUID) │◄─┘
                         ├───│ zone_id     (UUID) │
                         │   │ type        (TEXT) │
                         │   │ description (TEXT) │
                         │   │ latitude    (TEXT) │
                         │   │ longitude   (TEXT) │
                         │   │ status      (TEXT) │
                         │   │ upvotes     (INT)  │
                         │   │ created_at  (TS)   │
                         │   └─────────┬──────────┘
                         │             │
                         │             │ 1:N
                         │             ▼
                         │   ┌────────────────────┐
                         │   │     upvotes        │
                         │   ├────────────────────┤
                         │   │ id          (UUID) │
                         │   │ incident_id (UUID) │──┐
                         │   │ fingerprint (TEXT) │  │ FK → incident_reports
                         │   │ created_at  (TS)   │  │
                         │   └────────────────────┘  │
                         │                           │
                         │   ┌────────────────────┐  │
                         │   │ notification_      │  │
                         │   │   subscriptions    │  │
                         │   ├────────────────────┤  │
                         │   │ id          (UUID) │  │
                         └───│ zone_id     (UUID) │──┘ FK → zones
                             │ endpoint    (TEXT) │
                             │ p256dh      (TEXT) │
                             │ auth        (TEXT) │
                             │ types       (JSONB)│
                             │ active      (BOOL) │
                             │ created_at  (TS)   │
                             └────────────────────┘
```

- **zones** — Geographic zones with PostGIS geometry
- **outages** — Scheduled and active power/water outages
- **incident_reports** — Citizen-submitted infrastructure reports
- **upvotes** — Fingerprint-based deduped upvotes on incidents
- **notification_subscriptions** — Push notification subscriptions per zone

## Project Structure

```
gridwatch/
├── public/
│   └── sw.js                    # Service worker for push notifications
├── src/
│   ├── components/
│   │   ├── Header.tsx           # App header with navigation
│   │   ├── Footer.tsx           # App footer
│   │   ├── MapView.tsx          # Leaflet map (client-only)
│   │   └── ThemeToggle.tsx      # Dark/light mode toggle
│   ├── db/
│   │   ├── index.ts             # Drizzle database client
│   │   └── schema.ts            # PostgreSQL schema (5 tables)
│   ├── functions/
│   │   ├── incidents.ts         # Incident CRUD + upvotes
│   │   ├── notifications.ts     # Push notification management
│   │   └── zones.ts             # Zone queries + outages
│   ├── hooks/
│   │   └── usePushSubscription.ts # Push subscription React hook
│   ├── routes/
│   │   ├── __root.tsx           # Root layout
│   │   ├── index.tsx            # Home page
│   │   ├── zones/
│   │   │   ├── index.tsx        # Zone lookup
│   │   │   └── $zoneId.tsx      # Zone detail
│   │   ├── incidents/
│   │   │   └── index.tsx        # Incident feed
│   │   └── report/
│   │       └── index.tsx        # Report form
│   ├── router.tsx               # TanStack Router config
│   └── styles.css               # Tailwind + design tokens
├── drizzle.config.ts            # Drizzle Kit configuration
├── vite.config.ts               # Vite + TanStack Start config
└── package.json
```

## Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run type checking
pnpm typecheck

# Run linting
pnpm lint
```

**Test coverage:** 31 tests across 8 test files covering components, server functions, and routes.

| Category | What's Tested |
|----------|---------------|
| Components | Header, Footer, MapView rendering and interactions |
| Server Functions | Zone queries, incident CRUD, notification subscriptions |
| Routes | Home page, report form submission and validation |

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import repository in [Vercel Dashboard](https://vercel.com)
3. Set environment variables (see [Environment Variables](#environment-variables))
4. Deploy — Vercel handles build and serverless functions automatically

### Database (Supabase)

For production, use [Supabase](https://supabase.com) (always-on PostgreSQL):

1. Create a Supabase project
2. Copy the connection string from **Settings > Database** (use the `Transaction` mode pooler URL)
3. Set `DATABASE_URL` in Vercel environment variables
4. Run `pnpm exec dotenv -e .env.local -- pnpm exec drizzle-kit push` against Supabase to create tables
5. Seed zones into the production database
6. Vercel + Supabase = zero-config deployment with no cold starts

## License

MIT

---

<div align="center">

**Built with** [TanStack](https://tanstack.com) **•** [React](https://react.dev) **•** [PostgreSQL](https://postgresql.org) **•** [Drizzle](https://orm.drizzle.team)

</div>
