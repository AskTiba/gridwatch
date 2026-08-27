# ERROR_LOG.md

## Known Issues

| Date | Context | Symptom | Root Cause | Resolution | Prevention |
|------|---------|---------|------------|------------|------------|
| 2026-08-27 | Sprint 4 | ESLint errors in service worker (`public/sw.js`) — `clients` not defined | Service worker runs in different global context than browser/Node | Added `globals.serviceworker` to ESLint config | ESLint config should include service worker globals for any SW files |
| 2026-08-27 | Sprint 4 | `event` unused warning in service worker install handler | Unused parameter | Removed parameter — `self.addEventListener("install", () => {})` | Prefix unused params with `_` |
