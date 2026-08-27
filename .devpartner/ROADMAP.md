# ROADMAP.md

## Vision
A community-driven municipal utility and power grid monitoring platform that enables citizens to report incidents, track outages, and receive real-time notifications about infrastructure issues in their zone.

## Non-Functional Requirements

| Category | Target | Status |
|----------|--------|--------|
| TypeScript | 0 errors | ✅ Passing |
| ESLint | 0 errors | ✅ Passing |
| Test Coverage | 31 tests across 8 files | ✅ Passing |
| Bundle Size | Not measured | ⏳ Pending |
| LCP | < 2.5s | ⏳ Pending |
| CLS | < 0.1 | ⏳ Pending |

## Sprints

### Sprint 1: Foundation ✅
- TanStack Start + Router + Query setup
- Drizzle + PostGIS schema
- App shell (Header, Footer, ThemeToggle)
- CSS custom properties theming
- Dark mode

### Sprint 2: Core Features ✅
- Zone lookup page with search
- Zone detail page with grid schedule
- Incident report form
- Live incident feed

### Sprint 3: Database Wiring ✅
- Server functions for all CRUD
- Wired report form → DB
- Wired upvotes → DB
- Leaflet MapView component
- Zone 404 handling

### Sprint 4: Push Notifications ✅
- web-push + VAPID keys
- Notification server functions
- Service worker
- Push subscription hook
- Subscribe/unsubscribe UI
- Incident → notification trigger

### Sprint 5: Deployment & Polish (Next)
- Vercel deployment setup
- CI/CD pipeline (GitHub Actions)
- Error boundaries and loading states
- Accessibility audit
- Rate limiting on server functions

## Backlog
- Photo upload for incident reports
- Admin dashboard for zone management
- Search/filter for incidents feed
- Email notifications (in addition to push)
- Mobile app (React Native)
- Real-time updates via WebSocket
