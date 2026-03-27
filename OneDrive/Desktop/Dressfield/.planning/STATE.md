# Project State: Dressfield

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-27)

**Core value:** Customers can discover embroidered products, customize their own designs with a live preview, and pay securely through Bank of Georgia.
**Current focus:** Phase 1 — Foundation & Scaffolding

## Current Phase

**Phase 1: Foundation & Scaffolding**
- Status: Planned (ready for execution)
- Goal: Working project skeleton with authentication, layout shell, and deployment pipeline
- Requirements: AUTH-01..05, UX-01..04, ADMIN-03
- Plans: 5 (Next.js setup, ASP.NET setup, Auth, Layout shell, Deployment)
- UI-SPEC: Approved 2026-03-27

## Phase History

| Phase | Status | Completed |
|-------|--------|-----------|
| 1. Foundation & Scaffolding | Planned | — |
| 2. Product Catalog | Not Started | — |
| 3. Custom Design Orders | Not Started | — |
| 4. Cart & Checkout | Not Started | — |
| 5. Payments & Order Management | Not Started | — |
| 6. Analytics & SEO Polish | Not Started | — |
| 7. Security, Polish & Launch | Not Started | — |

## Decisions Log

| Date | Decision | Context |
|------|----------|---------|
| 2026-03-27 | Next.js static export for frontend | SEO via SSG; Hostinger can't run Node.js SSR |
| 2026-03-27 | Hostinger for frontend hosting | User preference, already paid for |
| 2026-03-27 | Azure App Service for backend | .NET runtime needed for ASP.NET Core |
| 2026-03-27 | Georgian only for MVP | English deferred to v2 |
| 2026-03-27 | Guest checkout supported | Reduces friction, higher conversion |
| 2026-03-27 | Canvas-based design preview | Customer sees design on product before ordering |
| 2026-03-27 | Base price + option add-ons | Flexible pricing for custom orders |

## Blockers

None.

---
*Last updated: 2026-03-27 after initialization*
