# Dressfield

## What This Is

Dressfield is an e-commerce website for an embroidery business based in Georgia. Customers browse pre-made embroidered products (clothing, home decor, accessories) and order custom embroidery by uploading their own designs, choosing placement/material/color options, and previewing a mockup before purchasing. Payments are processed through Bank of Georgia's iPay gateway.

## Core Value

Customers can discover embroidered products, customize their own designs with a live preview, and pay securely through Bank of Georgia — all in a premium, Georgian-language shopping experience.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User registration and login with email/password
- [ ] Guest checkout without creating an account
- [ ] Browse pre-made products by category with filtering/sorting
- [ ] View product details with image gallery and variants
- [ ] Upload custom design (photo) for embroidery
- [ ] Choose embroidery options (size, placement, material, thread colors)
- [ ] Preview mockup of design on product before ordering
- [ ] Base price + option add-on pricing for custom orders
- [ ] Add products to cart (guest and authenticated)
- [ ] Checkout with shipping address
- [ ] Pay via Bank of Georgia iPay (redirect-based flow)
- [ ] Receive order confirmation email
- [ ] Track order status
- [ ] Admin: manage products (CRUD, images, variants, pricing)
- [ ] Admin: manage categories
- [ ] Admin: view and manage orders
- [ ] Admin: review custom design orders
- [ ] SEO-optimized product and category pages (SSG)
- [ ] Meta Pixel tracking for Facebook/Instagram ad conversions
- [ ] Structured data (JSON-LD) for products

### Out of Scope

- English language support — v2, Georgian only for MVP
- Customer reviews/ratings — v2, after sufficient order volume
- Wishlist/favorites — v2, nice-to-have
- Discount codes/coupons — v2, marketing feature
- Inventory alert system — v2, small catalog managed manually
- Advanced analytics dashboard — v2, basic admin stats only for MVP
- Social login (Google/Facebook) — v2, email/password sufficient for Georgian market
- Mobile app — web-first, responsive design covers mobile

## Context

- **Business**: Small embroidery business run by friends in Georgia, using Ricoma EM-1010 machine
- **Market**: Georgian market, targeting Instagram/Facebook ad traffic
- **Catalog**: Small (<50 products), mix of pre-made and custom orders
- **Custom orders**: Customer uploads design photo → chooses options → sees preview mockup → base price + add-ons → order for review
- **Language**: Georgian only for MVP (ქართული)
- **Payment**: Bank of Georgia iPay is the only payment gateway needed (VISA, Mastercard, AmEx)
- **Traffic source**: Primarily Facebook/Instagram ads → Meta Pixel tracking is mandatory
- **Developer**: Solo developer workflow with AI assistance (Claude Opus for planning, Codex GPT-5.4 for coding/testing)

## Constraints

- **Hosting (frontend)**: Hostinger shared hosting — no Node.js runtime, requires Next.js static export (`next export`)
- **Hosting (backend)**: Azure App Service — .NET runtime for ASP.NET Core
- **Hosting (database)**: Hostinger MySQL — included in hosting plan
- **Payment gateway**: Bank of Georgia iPay only — Georgian market requirement
- **Static export**: No SSR/ISR, no Next.js API routes, no `next/image` — pages rebuild on content changes
- **Budget**: Bootstrapped small business — minimize hosting costs, use free tiers where possible
- **Tech stack**: Next.js + TypeScript (frontend), ASP.NET Core Web API (backend), MySQL + EF Core (database)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js static export over plain React SPA | SEO mandatory for product pages; SSG provides full HTML for crawlers even without SSR | — Pending |
| Hostinger for frontend (static files) | User already paying for Hostinger; static export works on shared hosting | — Pending |
| Azure App Service for backend | .NET runtime needed; free tier available; Git-based deployment | — Pending |
| Tailwind CSS + shadcn/ui | Modern, accessible, customizable; standard for Next.js projects | — Pending |
| TanStack Query + Zustand | Server state (products, orders) + client state (cart, UI) separation; avoids Redux complexity | — Pending |
| ASP.NET Identity + JWT | Built-in auth with support for guest checkout; access token in memory, refresh in httpOnly cookie | — Pending |
| Azure Blob Storage for images | Handles product photos + custom design uploads; CDN-ready; Hostinger storage not suitable | — Pending |
| BOG iPay via Helix.BankOfGeorgia.IpayClient | Official .NET library; redirect-based OAuth 2.0 flow; webhook callbacks for status updates | — Pending |
| Canvas-based design preview mockup | Show customer's uploaded design on product image; crop/rotate/resize before submission | — Pending |
| Modular monolith architecture | Small team, small project; microservices would be over-engineering | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-27 after initialization*
