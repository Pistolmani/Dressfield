# Project State: Dressfield

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-27)

**Core value:** Customers can discover embroidered products, customize their own designs with a live preview, and pay securely through Bank of Georgia.
**Current focus:** Phase 2 — Product Catalog (Plans 1-3 complete, Plan 4 in progress)

## Current Phase

**Phase 2: Product Catalog**
- Status: In Progress (nearly complete)
- Goal: Browsable product catalog with admin management and SEO-optimized pages
- Requirements: PROD-01..09, SEO-01..05
- Plans: 4 total
  - [x] Plan 1: Database schema & API — COMPLETE (commit 2a5423b, 2026-03-28)
  - [x] Plan 2: Admin product management UI — COMPLETE (Codex + reviewed 2026-03-28)
  - [x] Plan 3: Public product pages (SSG) — COMPLETE (Codex + category pages + homepage 2026-03-28)
  - [ ] Plan 4: SEO implementation — IN PROGRESS
    - [x] generateMetadata on product detail pages (title, description, OG, product:price meta)
    - [x] JSON-LD Product schema on product detail pages
    - [x] generateMetadata on category pages (title, description, OG)
    - [ ] next-sitemap XML sitemap config
    - [ ] Global OG/Twitter Card defaults in layout.tsx

## Phase History

| Phase | Status | Completed |
|-------|--------|-----------|
| 1. Foundation & Scaffolding | Complete | 2026-03-28 |
| 2. Product Catalog | In Progress | — |
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
| 2026-03-28 | Custom-first storefront direction | Core differentiator is upload flow; pre-made products are secondary |
| 2026-03-28 | UI direction: 70% Modern Boutique + 20% Editorial Luxury + 10% Cultural Craft | Premium independent brand feel, not a generic marketplace |
| 2026-03-28 | Admin edit route: query-string pattern | /admin/products/edit?id=X instead of [id]/edit — no generateStaticParams needed, works for any new product without rebuild |
| 2026-03-28 | SVG logo component | Single source of truth, scales via className, currentColor inherits context (white in header/footer, dark on light pages) |
| 2026-03-28 | Homepage fetch graceful fallback | getStaticProducts().catch([])) on homepage — build succeeds without backend; generateStaticParams still throws to catch build errors |

## Blockers

None.

---
*Last updated: 2026-03-28 — Phase 2 Plans 1-3 complete, Plan 4 SEO in progress*
