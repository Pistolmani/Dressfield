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

- [ ] **PROD-01**: User can browse all products on a listing page with pagination
- [ ] **PROD-02**: User can filter products by category
- [ ] **PROD-03**: User can sort products by price (low-high, high-low) and newest
- [ ] **PROD-04**: User can view product detail page with image gallery, description, and pricing
- [ ] **PROD-05**: User can select product variants (size, color) on detail page
- [ ] **PROD-06**: Admin can create, edit, and delete products with title, description, price, and category
- [ ] **PROD-07**: Admin can upload and manage multiple images per product
- [ ] **PROD-08**: Admin can create and manage product variants with individual pricing and stock
- [ ] **PROD-09**: Admin can create, edit, and delete categories with name, slug, and image

### Custom Design Orders

- [ ] **CUST-01**: User can upload a design image (JPG, PNG) for custom embroidery
- [ ] **CUST-02**: User can crop, rotate, and resize their uploaded design in a browser-based editor
- [ ] **CUST-03**: User can select embroidery options (size, placement area, material, thread colors)
- [ ] **CUST-04**: User can see a live preview mockup of their design on the selected product
- [ ] **CUST-05**: System calculates price based on base product price + selected option add-ons
- [ ] **CUST-06**: Admin can review custom design submissions with uploaded image and selected options
- [ ] **CUST-07**: Admin can approve, reject, or request changes to custom design orders

### Shopping Cart

- [ ] **CART-01**: User can add products (pre-made or custom) to cart
- [ ] **CART-02**: User can update quantity or remove items from cart
- [ ] **CART-03**: Cart persists across page navigation (Zustand local state)
- [ ] **CART-04**: Authenticated user's cart syncs with server for cross-device access
- [ ] **CART-05**: Guest user's cart persists in local storage

### Orders

- [ ] **ORD-01**: User can enter shipping address during checkout
- [ ] **ORD-02**: User can review order summary (items, quantities, prices, total) before payment
- [ ] **ORD-03**: User receives order confirmation email after successful payment
- [ ] **ORD-04**: User can view their order history with status for each order
- [ ] **ORD-05**: Admin can view all orders with filtering by status
- [ ] **ORD-06**: Admin can update order status (processing, shipped, delivered, cancelled)

### Payments

- [ ] **PAY-01**: User is redirected to Bank of Georgia iPay payment form during checkout
- [ ] **PAY-02**: After payment, user is redirected back to success or failure page
- [ ] **PAY-03**: Backend receives iPay webhook callback and updates order/payment status
- [ ] **PAY-04**: Webhook handler is idempotent (duplicate callbacks don't create duplicate state changes)
- [ ] **PAY-05**: Payment status is visible to user on order detail page

### SEO

- [ ] **SEO-01**: Product pages are statically generated (SSG) with full HTML for search engine crawlers
- [ ] **SEO-02**: Category pages are statically generated with proper meta titles and descriptions
- [ ] **SEO-03**: Site generates XML sitemap automatically via next-sitemap
- [ ] **SEO-04**: Product pages include JSON-LD structured data (Product schema)
- [ ] **SEO-05**: Pages include Open Graph and Twitter Card meta tags for social sharing

### Analytics

- [ ] **ANLYT-01**: Meta Pixel initializes on every page load (PageView event)
- [ ] **ANLYT-02**: ViewContent event fires when user views a product detail page
- [ ] **ANLYT-03**: AddToCart event fires when user adds item to cart
- [ ] **ANLYT-04**: InitiateCheckout event fires when user starts checkout
- [ ] **ANLYT-05**: Purchase event fires on order confirmation page after successful payment

### Admin

- [ ] **ADMIN-01**: Admin dashboard shows summary stats (total orders, revenue, pending custom orders)
- [ ] **ADMIN-02**: Admin can access product management, order management, and custom order review
- [ ] **ADMIN-03**: Admin pages are protected by role-based authorization (admin role required)

### Email

- [ ] **MAIL-01**: System sends order confirmation email with order details after successful payment
- [ ] **MAIL-02**: System sends shipping notification email when admin updates order to "shipped"

### Layout & UX

- [ ] **UX-01**: Site has responsive layout that works on mobile, tablet, and desktop
- [ ] **UX-02**: Site has consistent header with logo, navigation, cart icon with item count
- [ ] **UX-03**: Site has footer with business info, contact details, and social links
- [ ] **UX-04**: Georgian text renders correctly with appropriate fonts

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

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| (Populated during roadmap creation) | | |

**Coverage:**
- v1 requirements: 47 total
- Mapped to phases: 0
- Unmapped: 47 ⚠️ (will be mapped during roadmap creation)

---
*Requirements defined: 2026-03-27*
*Last updated: 2026-03-27 after initial definition*
