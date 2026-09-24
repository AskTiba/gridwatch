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