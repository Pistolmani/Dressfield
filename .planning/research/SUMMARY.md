# Research Summary: Dressfield

**Synthesized:** 2026-03-27
**Sources:** STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md

## Stack Recommendation

| Layer | Choice | Confidence |
|-------|--------|------------|
| Frontend | Next.js 15 + TypeScript, static export, Tailwind + shadcn/ui | High |
| Backend | ASP.NET Core 8, clean architecture (API/Core/Application/Infrastructure) | High |
| Database | MySQL 8 + Pomelo EF Core provider | High |
| State | TanStack Query 5 (server) + Zustand 5 (client) | High |
| Payments | BOG iPay via Helix.BankOfGeorgia.IpayClient | High |
| Canvas | Konva + react-konva (over Fabric.js — better React integration) | High |
| Mapping | Mapster (over AutoMapper — lighter, actively maintained) | High |
| Email | MailKit (over System.Net.Mail — more reliable) | High |
| Images | ImageSharp for processing, Azure Blob Storage for hosting | High |

## Table Stakes Features (Must Ship)

1. Product browsing with category filtering and sorting
2. Product detail with image gallery and variants
3. Shopping cart with guest support
4. Guest + account checkout
5. Bank of Georgia iPay payment (redirect flow)
6. Order tracking and management
7. Responsive mobile design
8. Georgian language UI with proper fonts
9. Admin dashboard for products, orders, custom designs
10. SEO-optimized static pages

## Primary Differentiator

**Custom design upload with live preview mockup** — customers upload an embroidery design, choose options (size, placement, material, thread colors), see it previewed on the product in real-time, and get dynamic pricing (base + add-ons). Most Georgian competitors use Instagram DMs for custom orders.

## Critical Pitfalls to Watch

| Priority | Pitfall | Phase | Mitigation |
|----------|---------|-------|------------|
| Critical | Webhook idempotency | Phase 5 | Use IPayPaymentId as key, check before update, always return 200 |
| Critical | JWT in localStorage | Phase 1 | Store in memory only, refresh token in httpOnly cookie |
| Critical | CORS misconfiguration | Phase 1 | Whitelist exact frontend origin, test in browser |
| High | Stale data after admin changes | Phase 2 | Document rebuild workflow, add "last built" timestamp |
| High | Browser crash on large canvas | Phase 3 | Limit upload to 10MB/4000x4000px, resize before canvas |
| High | Price mismatch cart vs server | Phase 4 | Server calculates final price, frontend shows estimate only |
| High | Georgian text truncation | Phase 1+ | Test all UI with Georgian text, generous max-widths |
| Medium | Hostinger .htaccess routing | Phase 1 | Use trailingSlash: true, test direct URL access |
| Medium | Azure cold starts | Phase 7 | Enable "Always On" in production |
| Medium | Database connection limits | Phase 1 | EF Core pooling, MaxPoolSize in connection string |

## Architecture Decision Records

| Decision | Chosen | Over | Why |
|----------|--------|------|-----|
| Static export | SSG at build time | SSR on Vercel | Hostinger constraint; SSG provides same SEO benefit for small catalog |
| Konva | react-konva | Fabric.js | Declarative React API, better TypeScript, smaller bundle |
| Zustand + TanStack Query | — | Redux | No boilerplate, clean separation of server/client state |
| Mapster | — | AutoMapper | AutoMapper archived; Mapster is faster, actively maintained |
| Modular monolith | — | Microservices | Solo developer, <50 products, no need for distributed complexity |
| MailKit | — | System.Net.Mail | Better reliability, modern API, active maintenance |

## Build Order Recommendation

```
Phase 1: Foundation    → Enables everything
Phase 2: Catalog       → Core content (products)
Phase 3: Custom Design → Primary differentiator
Phase 4: Cart          → Monetization path
Phase 5: Payments      → Completes purchase funnel
Phase 6: Analytics     → Optimization
Phase 7: Launch        → Production readiness
```

Each phase builds on the previous. Within each phase, plans can run in parallel where independent (e.g., admin UI and public pages in Phase 2).

---
*Summary synthesized: 2026-03-27*
