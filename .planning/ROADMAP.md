# Roadmap: Dressfield

**Created:** 2026-03-27
**Granularity:** Standard (5-8 phases, 3-5 plans each)
**Total phases:** 7
**Total v1 requirements:** 47

## Overview

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Foundation & Scaffolding | Working project skeleton with auth and layout | AUTH-01..05, UX-01..04, ADMIN-03 | 5 |
| 2 | Product Catalog | Browsable product catalog with admin management | PROD-01..09, SEO-01..05 | 5 |
| 3 | Custom Design Orders | Custom embroidery order flow with preview | CUST-01..07 | 4 |
| 4 | Cart & Checkout | Complete shopping cart and checkout flow | CART-01..05, ORD-01..02 | 4 |
| 5 | Payments & Order Management | iPay integration and order lifecycle | PAY-01..05, ORD-03..06, MAIL-01..02 | 5 |
| 6 | Analytics & SEO Polish | Meta Pixel tracking and SEO optimization | ANLYT-01..05, ADMIN-01..02 | 3 |
| 7 | Security, Polish & Launch | Production-ready hardening and deployment | (cross-cutting) | 4 |

---

## Phase Details

### Phase 1: Foundation & Scaffolding

**Goal:** Working project skeleton with authentication, layout shell, and deployment pipeline.

**Requirements:**
- AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05
- UX-01, UX-02, UX-03, UX-04
- ADMIN-03

**UI hint:** yes

**Plans:**
1. **Next.js project setup** — Initialize Next.js with TypeScript, Tailwind CSS, shadcn/ui, static export config
2. **ASP.NET Core project setup** — Create solution with API, Core, Application, Infrastructure projects; EF Core + MySQL; initial migrations (Users table)
3. **Authentication** — ASP.NET Identity + JWT; login/register/logout/password-reset endpoints; frontend auth pages + context
4. **Layout shell** — Header (logo, nav, cart icon), footer (business info, social links), responsive layout, Georgian font setup
5. **Deployment pipeline** — Azure App Service for backend, Hostinger FTP for static frontend, environment configs

**Success criteria:**
1. User can register, log in, and see their session persist across refresh
2. Guest user can browse without authentication
3. Responsive layout renders correctly on mobile and desktop with Georgian text
4. Admin-only routes are protected (redirect to login for non-admin users)
5. Both frontend and backend are deployed and accessible via their respective URLs

**Dependencies:** None (first phase)

---

### Phase 2: Product Catalog

**Goal:** Admin can manage products and categories; customers can browse, filter, and view product details with SEO-optimized pages.

**Requirements:**
- PROD-01, PROD-02, PROD-03, PROD-04, PROD-05
- PROD-06, PROD-07, PROD-08, PROD-09
- SEO-01, SEO-02, SEO-03, SEO-04, SEO-05

**UI hint:** yes

**Plans:**
1. **Database schema & API** — Categories, Products, ProductImages, ProductVariants tables; EF Core migrations; CRUD API endpoints
2. **Admin product management** — Admin pages for product CRUD, image upload to Azure Blob Storage, variant management, category management
3. **Public product pages** — Product listing (SSG), product detail (SSG) with image gallery and variant selection, category pages with filtering/sorting
4. **SEO implementation** — JSON-LD structured data, next-sitemap config, meta tags, Open Graph, Twitter Cards

**Success criteria:**
1. Admin can create a product with images, variants, and assign to category
2. Product listing page shows all active products with pagination and category filter
3. Product detail page renders full HTML at build time (view-source shows content)
4. JSON-LD structured data validates in Google's Rich Results Test
5. XML sitemap includes all product and category URLs

**Dependencies:** Phase 1 (auth, layout, deployment)

---

### Phase 3: Custom Design Orders

**Goal:** Customers can upload designs, customize options, see a live preview mockup, and submit custom embroidery orders.

**Requirements:**
- CUST-01, CUST-02, CUST-03, CUST-04, CUST-05, CUST-06, CUST-07

**UI hint:** yes

**Plans:**
1. **Design upload & editor** — File upload (react-dropzone), browser-based crop/rotate/resize editor (fabric.js or konva), image validation
2. **Options & pricing** — Embroidery option selectors (size, placement, material, thread colors), dynamic pricing engine (base + add-ons)
3. **Preview mockup** — Canvas-based product mockup showing design placement on product image, real-time updates as options change
4. **Admin custom order management** — Custom order review page, approve/reject/request-changes workflow, view uploaded design + selected options

**Success criteria:**
1. Customer can upload a JPG/PNG, crop/rotate it, and see it placed on a product mockup
2. Price updates in real-time as customer changes options
3. Custom design order appears in admin dashboard for review
4. Admin can approve or reject with feedback that the customer sees

**Dependencies:** Phase 2 (products, images, admin pages)

---

### Phase 4: Cart & Checkout

**Goal:** Complete shopping cart with guest support and checkout flow up to the payment step.

**Requirements:**
- CART-01, CART-02, CART-03, CART-04, CART-05
- ORD-01, ORD-02

**UI hint:** yes

**Plans:**
1. **Shopping cart** — Zustand cart store, add/remove/update items, cart drawer/page, localStorage persistence for guests, API sync for authenticated users
2. **Checkout flow** — Shipping address form, order summary review, cart → checkout transition, order creation API endpoint (status: PendingPayment)

**Success criteria:**
1. Guest can add items to cart, items persist after page reload
2. Authenticated user's cart syncs across devices
3. User can proceed through checkout, enter shipping address, and see order summary
4. Order is created in database with PendingPayment status

**Dependencies:** Phase 2 (products), Phase 3 (custom orders added to cart)

---

### Phase 5: Payments & Order Management

**Goal:** iPay payment integration with webhook handling, order lifecycle management, and email notifications.

**Requirements:**
- PAY-01, PAY-02, PAY-03, PAY-04, PAY-05
- ORD-03, ORD-04, ORD-05, ORD-06
- MAIL-01, MAIL-02

**UI hint:** yes

**Plans:**
1. **iPay integration** — Helix.BankOfGeorgia.IpayClient setup, create payment endpoint, redirect flow, success/failure pages
2. **Webhook handler** — Callback endpoint, signature verification, idempotent status updates, retry handling
3. **Order management** — Customer order history page, order detail with payment status, admin order list with filtering, status update workflow
4. **Email notifications** — SMTP via Hostinger, order confirmation email template, shipping notification email template

**Success criteria:**
1. User is redirected to BOG payment form and can complete payment (test mode)
2. Webhook updates order status correctly; duplicate webhooks don't cause double updates
3. Customer can view order history and see payment/order status
4. Admin can update order status and customer receives shipping notification email
5. Order confirmation email is sent after successful payment

**Dependencies:** Phase 4 (checkout, order creation)

---

### Phase 6: Analytics & SEO Polish

**Goal:** Meta Pixel tracking for ad conversions and admin dashboard with summary stats.

**Requirements:**
- ANLYT-01, ANLYT-02, ANLYT-03, ANLYT-04, ANLYT-05
- ADMIN-01, ADMIN-02

**UI hint:** yes

**Plans:**
1. **Meta Pixel integration** — Pixel initialization in root layout, PageView on navigation, ViewContent/AddToCart/InitiateCheckout/Purchase events with correct parameters
2. **Admin dashboard** — Summary stats (total orders, revenue, pending custom orders), quick links to product/order/custom-order management
3. **SEO audit** — Lighthouse performance audit, fix any issues, verify structured data, test social sharing cards

**Success criteria:**
1. Meta Pixel fires correct events at each stage of the purchase funnel (verifiable in Facebook Events Manager)
2. Admin dashboard shows accurate summary statistics
3. Lighthouse SEO score is 90+ on product pages

**Dependencies:** Phase 5 (purchase events need payment flow)

---

### Phase 7: Security, Polish & Launch

**Goal:** Production-ready application with security hardening, error handling, and final deployment.

**Requirements:** Cross-cutting (no specific REQ-IDs, covers quality attributes across all phases)

**UI hint:** no

**Plans:**
1. **Security hardening** — CORS configuration, rate limiting on API, input validation (FluentValidation), HTTPS enforcement, secure headers, file upload validation
2. **Error handling & logging** — Serilog for backend structured logging, React error boundaries, user-friendly error pages (404, 500), global exception handler
3. **Performance & polish** — Image optimization pipeline, bundle analysis, lazy loading, loading states, empty states
4. **Production deployment** — Environment-specific configs (dev/staging/prod), final DNS setup, SSL certificates, health check endpoint, monitoring

**Success criteria:**
1. No critical security vulnerabilities (OWASP top 10 checked)
2. All API endpoints have proper validation and return meaningful error messages
3. Application handles errors gracefully without exposing stack traces
4. Production deployment is stable and monitored

**Dependencies:** All previous phases

---

## Phase Execution Order

```
Phase 1 ──→ Phase 2 ──→ Phase 3 ──→ Phase 4 ──→ Phase 5 ──→ Phase 6 ──→ Phase 7
Foundation   Catalog     Custom      Cart &       Payments    Analytics   Security
                         Design      Checkout     & Orders    & SEO       & Launch
```

Phases are sequential — each depends on the previous. Within each phase, plans can run in parallel where independent.

---
*Roadmap created: 2026-03-27*
*Last updated: 2026-03-27 after initial creation*
