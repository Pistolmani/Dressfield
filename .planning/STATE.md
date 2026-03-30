# Project State: Dressfield

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-27)

**Core value:** Customers can discover embroidered products, customize their own designs with a live preview, and pay securely through Bank of Georgia.
**Current focus:** Phase 4 — Cart & Checkout

## Current Phase

**Phase 5: Payments & Order Management**
- Status: Not Started
- Goal: BOG iPay live integration, order status emails, admin order management
- Requirements: PAY-01..05

## Previous Phases (Completed)

**Phase 4: Cart & Checkout** — COMPLETE (commits b70270a..d6cf650, 2026-03-28)
- [x] Plan 1: Order domain — entities, EF migration, OrderService, BogIPayService, MockPaymentService
- [x] Plan 2: API — OrdersController, PaymentsController, Program.cs wiring
- [x] Plan 3: Frontend — cart store, checkout page (2-step), order-confirmation, order-failed
- [x] Plan 4: Admin orders UI — orders table, order detail + status update
- [x] Plan 5: Architecture review & fixes — EF inline projection, image include, BOG URL split, formatPrice consolidation, SHIPPING_COST env var

**Phase 3: Custom Design Orders** — COMPLETE (commits 9184c22..ab832f5, 2026-03-28)
- [x] Plan 1: Custom order domain — entities, service, API, EF migration
- [x] Plan 2: Azure Blob Storage upload (LocalStorageService dev fallback)
- [x] Plans 3-6: Full wizard UI — product picker, dropzone upload, fabric.js canvas, options, mockup preview, contact form, admin review

**Phase 2: Product Catalog** — COMPLETE (commit a98e961, 2026-03-28)
- [x] Plan 1: Database schema & API
- [x] Plan 2: Admin product management UI
- [x] Plan 3: Public product pages (SSG) — homepage, /products, /products/[slug], categories
- [x] Plan 4: SEO — generateMetadata, JSON-LD, global OG/Twitter defaults, next-sitemap, robots.txt

## Phase History

| Phase | Status | Completed |
|-------|--------|-----------|
| 1. Foundation & Scaffolding | Complete | 2026-03-28 |
| 2. Product Catalog | Complete | 2026-03-28 |
| 3. Custom Design Orders | Complete | 2026-03-28 |
| 4. Cart & Checkout | Complete | 2026-03-28 |
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
*Last updated: 2026-03-28 — Phase 4 complete. Starting Phase 5: Payments & Order Management.*
