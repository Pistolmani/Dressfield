# Project State: Dressfield

## Project Reference

See: `.planning/PROJECT.md`

Core value: Customers can discover embroidered products, customize their own designs with a live preview, and pay securely through Bank of Georgia.
Current focus: Phase 7 - Security, Launch Integration, and Deployment Cutover.

## Current Phase

**Phase 7: Security, Polish & Launch**
- Status: In Progress
- Goal: Final QA, launch readiness, and cloud deployment cutover (Azure + Hostinger + BOG live)
- Requirements: Cross-cutting launch hardening and operational readiness

## Recent Updates (2026-04-01)

- [x] Added authenticated server-side cart sync API (`/api/cart`) and frontend merge/sync flow.
- [x] Added public guest order status lookup endpoint (`GET /api/orders/status?orderId=&key=`).
- [x] Added backend test project (xUnit + SQLite in-memory) and frontend Vitest coverage for cart logic.
- [x] Wired CI to run backend/frontend tests before build.
- [x] Added development env templates (`.env.example`, `appsettings.Development.example.json`).
- [x] Fixed EF translation issue in order detail lookups (`/api/orders/my/{id}`).
- [x] Fixed EF translation issue in custom order detail lookups (`/api/custom-orders/*/{id}`).
- [x] Stabilized custom-order background removal flow with guarded async handling and non-breaking fallback behavior.
- [x] Added smooth blocking loading overlay (animated dots) during background removal to prevent conflicting interactions.
- [x] Prevented side-switch race conditions and duplicate/broken design artifacts while removal is in progress.
- [x] Persisted design transforms (position/scale/rotation) across side flips and image replacement.
- [x] Improved customizer drag stability by reducing over-frequent persistence updates.
- [x] Removed global cursor-trail animation for better runtime performance and cleaner UX.
- [x] Completed launch-readiness QA gate:
  - `dotnet build` + `dotnet test` passing
  - `npm test` + `npm run lint` + `npx tsc --noEmit` + `npm run build` passing
  - API smoke verified for guest/auth order flow, cart flow, and custom-order flow

## Previous Phases

**Phase 1: Foundation & Scaffolding** - COMPLETE  
**Phase 2: Product Catalog** - COMPLETE  
**Phase 3: Custom Design Orders** - COMPLETE  
**Phase 4: Cart & Checkout** - COMPLETE  
**Phase 5: Payments & Order Management** - COMPLETE  
**Phase 6: Analytics & SEO Polish** - In Progress  

## Phase History

| Phase | Status | Completed |
|-------|--------|-----------|
| 1. Foundation & Scaffolding | Complete | 2026-03-28 |
| 2. Product Catalog | Complete | 2026-03-28 |
| 3. Custom Design Orders | Complete | 2026-03-28 |
| 4. Cart & Checkout | Complete | 2026-03-28 |
| 5. Payments & Order Management | Complete | 2026-03-30 |
| 6. Analytics & SEO Polish | In Progress | 2026-04-01 |
| 7. Security, Polish & Launch | In Progress | 2026-04-01 |

## Blockers

- Admin local login uses a rotated/non-default credential in the current local DB snapshot (not a code blocker).

---
Last updated: 2026-04-01
