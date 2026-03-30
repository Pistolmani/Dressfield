# Requirements: Dressfield

**Defined:** 2026-03-27
**Core Value:** Customers can discover embroidered products, customize their own designs with a live preview, and pay securely through Bank of Georgia.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [ ] **AUTH-01**: User can create account with email and password
- [ ] **AUTH-02**: User can log in and session persists across browser refresh (JWT)
- [ ] **AUTH-03**: User can log out from any page
- [ ] **AUTH-04**: User can reset password via email link
- [ ] **AUTH-05**: Guest user can proceed through checkout without creating an account

### Products

Note: Categories were removed from MVP on 2026-03-29. Product discovery now uses a flat catalog with search/sort.

- [x] **PROD-01**: User can browse all products on a listing page
- [x] **PROD-02**: User can search and discover products from a single flat catalog page
- [x] **PROD-03**: User can sort products by price (low-high, high-low) and newest
- [x] **PROD-04**: User can view product detail page with image gallery, description, and pricing
- [x] **PROD-05**: User can select product variants (size, color) on detail page
- [x] **PROD-06**: Admin can create, edit, and delete products with title, description, price, images, and variants
- [x] **PROD-07**: Admin can upload and manage multiple images per product
- [x] **PROD-08**: Admin can create and manage product variants with individual pricing and stock
- [x] **PROD-09**: MVP uses a flat catalog without category management

### Custom Design Orders

- [x] **CUST-01**: User can upload a design image (JPG, PNG) for custom embroidery
- [x] **CUST-02**: User can crop, rotate, and resize their uploaded design in a browser-based editor
- [x] **CUST-03**: User can select embroidery size and product-specific custom-order options
- [x] **CUST-04**: User can see a live preview mockup of their design on the selected product
- [x] **CUST-05**: System calculates price based on base product price + selected option add-ons
- [x] **CUST-06**: Admin can review custom design submissions with uploaded image and selected options
- [x] **CUST-07**: Admin can approve, reject, or request changes to custom design orders

### Shopping Cart

- [x] **CART-01**: User can add products (pre-made or custom) to cart
- [x] **CART-02**: User can update quantity or remove items from cart
- [x] **CART-03**: Cart persists across page navigation (Zustand local state)
- [ ] **CART-04**: Authenticated user's cart syncs with server for cross-device access
- [x] **CART-05**: Guest user's cart persists in local storage

### Orders

- [x] **ORD-01**: User can enter shipping address during checkout
- [x] **ORD-02**: User can review order summary (items, quantities, prices, total) before payment
- [x] **ORD-03**: User receives order confirmation email after successful payment
- [x] **ORD-04**: User can view their order history with status for each order
- [x] **ORD-05**: Admin can view all orders with filtering by status
- [x] **ORD-06**: Admin can update order status (processing, shipped, delivered, cancelled)

### Payments

- [x] **PAY-01**: User is redirected to Bank of Georgia iPay payment form during checkout
- [x] **PAY-02**: After payment, user is redirected back to success or failure page
- [x] **PAY-03**: Backend receives iPay callback and updates order/payment status
- [x] **PAY-04**: Callback handler is signed and idempotent (duplicate callbacks don't create duplicate state changes)
- [x] **PAY-05**: Payment status is visible to user on order detail page

### SEO

- [x] **SEO-01**: Product pages are statically generated (SSG) with full HTML for search engine crawlers
- [x] **SEO-02**: Catalog pages are statically generated with proper meta titles and descriptions
- [x] **SEO-03**: Site generates XML sitemap automatically via next-sitemap
- [x] **SEO-04**: Product pages include JSON-LD structured data (Product schema)
- [x] **SEO-05**: Pages include Open Graph and Twitter Card meta tags for social sharing

### Analytics

- [ ] **ANLYT-01**: Meta Pixel initializes on every page load (PageView event)
- [ ] **ANLYT-02**: ViewContent event fires when user views a product detail page
- [ ] **ANLYT-03**: AddToCart event fires when user adds item to cart
- [ ] **ANLYT-04**: InitiateCheckout event fires when user starts checkout
- [ ] **ANLYT-05**: Purchase event fires on order confirmation page after successful payment

### Admin

- [ ] **ADMIN-01**: Admin dashboard shows summary stats (total orders, revenue, pending custom orders)
- [x] **ADMIN-02**: Admin can access product management, order management, and custom order review
- [x] **ADMIN-03**: Admin pages are protected by role-based authorization (admin role required)

### Email

- [x] **MAIL-01**: System sends order confirmation email with order details after successful payment
- [x] **MAIL-02**: System sends shipping notification email when admin updates order to "shipped"

### Layout & UX

- [x] **UX-01**: Site has responsive layout that works on mobile, tablet, and desktop
- [x] **UX-02**: Site has consistent header with logo, navigation, cart icon with item count
- [x] **UX-03**: Site has footer with business info, contact details, and social links
- [x] **UX-04**: Georgian text renders correctly with appropriate fonts

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Internationalization

- **I18N-01**: Site available in both Georgian and English
- **I18N-02**: Language switcher in header
- **I18N-03**: Product content available in both languages

### Social & Engagement

- **SOCL-01**: Customer can leave reviews/ratings on products
- **SOCL-02**: Customer can add products to wishlist/favorites
- **SOCL-03**: Customer can share products via social media buttons

### Marketing

- **MKTG-01**: Admin can create and manage discount codes/coupons
- **MKTG-02**: Admin can set sale prices with date ranges
- **MKTG-03**: System sends abandoned cart reminder emails

### Inventory

- **INV-01**: System tracks stock levels per variant
- **INV-02**: Admin receives low-stock alerts
- **INV-03**: Out-of-stock products show "unavailable" state

### Advanced Analytics

- **ADV-01**: Admin dashboard shows sales charts and trends
- **ADV-02**: Google Analytics 4 integration
- **ADV-03**: Conversion funnel visualization

## Out of Scope

| Feature | Reason |
|---------|--------|
| Mobile app | Web-first with responsive design; native app not justified for <50 product catalog |
| Social login (Google/Facebook) | Email/password sufficient for Georgian market; adds OAuth complexity |
| Real-time chat/support | Small team can handle via phone/WhatsApp; live chat adds maintenance burden |
| Multi-currency | Georgian Lari (GEL) only; Bank of Georgia processes in GEL |
| Subscription/recurring orders | Embroidery is one-time purchase; no subscription model |
| Marketplace (multiple sellers) | Single business, not a platform |
| AI-powered recommendations | <50 products; manual categorization sufficient |
| Payment methods beyond BOG | iPay covers VISA/MC/AmEx; no need for PayPal, crypto, etc. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Completed |
| AUTH-02 | Phase 1 | Completed |
| AUTH-03 | Phase 1 | Completed |
| AUTH-04 | Phase 1 | Completed |
| AUTH-05 | Phase 1 | Completed |
| UX-01 | Phase 1 | Completed |
| UX-02 | Phase 1 | Completed |
| UX-03 | Phase 1 | Completed |
| UX-04 | Phase 1 | Completed |
| ADMIN-03 | Phase 1 | Completed |
| PROD-01 | Phase 2 | Completed |
| PROD-02 | Phase 2 | Completed |
| PROD-03 | Phase 2 | Completed |
| PROD-04 | Phase 2 | Completed |
| PROD-05 | Phase 2 | Completed |
| PROD-06 | Phase 2 | Completed |
| PROD-07 | Phase 2 | Completed |
| PROD-08 | Phase 2 | Completed |
| PROD-09 | Phase 2 | Completed |
| SEO-01 | Phase 2 | Completed |
| SEO-02 | Phase 2 | Completed |
| SEO-03 | Phase 2 | Completed |
| SEO-04 | Phase 2 | Completed |
| SEO-05 | Phase 2 | Completed |
| CUST-01 | Phase 3 | Completed |
| CUST-02 | Phase 3 | Completed |
| CUST-03 | Phase 3 | Completed |
| CUST-04 | Phase 3 | Completed |
| CUST-05 | Phase 3 | Completed |
| CUST-06 | Phase 3 | Completed |
| CUST-07 | Phase 3 | Completed |
| CART-01 | Phase 4 | Completed |
| CART-02 | Phase 4 | Completed |
| CART-03 | Phase 4 | Completed |
| CART-04 | Phase 4 | Pending |
| CART-05 | Phase 4 | Completed |
| ORD-01 | Phase 4 | Completed |
| ORD-02 | Phase 4 | Completed |
| PAY-01 | Phase 5 | Completed |
| PAY-02 | Phase 5 | Completed |
| PAY-03 | Phase 5 | Completed |
| PAY-04 | Phase 5 | Completed |
| PAY-05 | Phase 5 | Completed |
| ORD-03 | Phase 5 | Completed |
| ORD-04 | Phase 5 | Completed |
| ORD-05 | Phase 5 | Completed |
| ORD-06 | Phase 5 | Completed |
| MAIL-01 | Phase 5 | Completed |
| MAIL-02 | Phase 5 | Completed |
| ANLYT-01 | Phase 6 | Pending |
| ANLYT-02 | Phase 6 | Pending |
| ANLYT-03 | Phase 6 | Pending |
| ANLYT-04 | Phase 6 | Pending |
| ANLYT-05 | Phase 6 | Pending |
| ADMIN-01 | Phase 6 | Pending |
| ADMIN-02 | Phase 6 | Completed |

**Coverage:**
- v1 requirements: 47 total
- Mapped to phases: 47
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-27*
*Last updated: 2026-03-30 after Phase 5 completion and flat-catalog scope update*
