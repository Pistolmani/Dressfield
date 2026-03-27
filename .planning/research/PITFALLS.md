# Pitfalls Research: E-Commerce + Payment Integration

**Researched:** 2026-03-27
**Domain:** Embroidery e-commerce, Georgian market, BOG iPay

## 1. Payment Integration Pitfalls

### P1.1: Webhook Idempotency Failure
**Warning signs:** Duplicate orders, double-charged customers, inconsistent payment/order status
**Prevention:** Use `IPayPaymentId` as idempotency key. Check current status before updating. Wrap in database transaction. Always return HTTP 200 even if already processed.
**Phase:** Phase 5 (Payments)

### P1.2: Race Condition Between Redirect and Webhook
**Warning signs:** Customer sees "payment pending" on success page even though payment succeeded
**Prevention:** Webhook may arrive before the redirect completes. Frontend should poll `/api/payments/{orderId}/status` on the success page until status confirms. Don't rely solely on the redirect URL parameters.
**Phase:** Phase 5 (Payments)

### P1.3: Webhook Endpoint Returning Non-200
**Warning signs:** iPay retries every 15 seconds, up to 5 times. If all fail, payment status never updates in your system.
**Prevention:** Never throw exceptions from the webhook endpoint. Wrap entire handler in try-catch, log errors, always return 200. Process asynchronously if needed — acknowledge receipt first, process later.
**Phase:** Phase 5 (Payments)

### P1.4: Missing Payment Status for Failed Payments
**Warning signs:** Orders stuck in "PendingPayment" indefinitely
**Prevention:** Implement a background cleanup job (or manual admin check) that marks stale PendingPayment orders as Cancelled after 30 minutes. User can also see "payment failed" status and retry.
**Phase:** Phase 5 (Payments)

### P1.5: Testing with Production Credentials
**Warning signs:** Actual charges during development
**Prevention:** Use BOG demo credentials (ClientId: 1006, SecretKey: 581ba5...) during development. Store credentials in environment variables, never in code. Separate appsettings.Development.json from appsettings.Production.json.
**Phase:** Phase 1 (config setup), Phase 5 (implementation)

## 2. Static Export Pitfalls

### P2.1: Stale Product Data After Admin Changes
**Warning signs:** Admin updates product price but website still shows old price
**Prevention:** Implement a rebuild workflow: admin saves product → API trigger → rebuild + redeploy. For MVP, manual rebuild is acceptable. Document the process clearly. Consider adding a "last built" timestamp visible to admin.
**Phase:** Phase 2 (Product Catalog)

### P2.2: Dynamic Routes Not Generated
**Warning signs:** 404 errors on product pages after build
**Prevention:** Use `generateStaticParams()` in Next.js to pre-generate all product/category slugs. Fetch from API at build time. If a new product is added without rebuild, it won't have a page.
**Phase:** Phase 2 (Product Catalog)

### P2.3: Client-Side Auth Flicker
**Warning signs:** Protected pages flash content before redirecting to login
**Prevention:** Show loading spinner while `useAuth()` initializes. Don't render protected content until auth state is resolved. Use a layout-level guard for admin pages.
**Phase:** Phase 1 (Foundation)

### P2.4: `.htaccess` Misconfiguration on Hostinger
**Warning signs:** Direct URL access returns 404 (e.g., `/products/embroidered-tshirt`)
**Prevention:** Configure `.htaccess` for SPA-like routing. With `trailingSlash: true` in Next.js config, each page generates `index.html` in a subdirectory, which Hostinger serves correctly. Test direct URL access after first deployment.
**Phase:** Phase 1 (Deployment)

### P2.5: CORS Errors Between Hostinger and Azure
**Warning signs:** API calls fail with "blocked by CORS policy" in browser console
**Prevention:** Configure CORS in ASP.NET Core to allow the exact Hostinger frontend origin. Don't use `AllowAnyOrigin()` in production. Include specific methods (GET, POST, PUT, DELETE) and headers (Authorization, Content-Type).
**Phase:** Phase 1 (Foundation)

## 3. Image Upload Pitfalls

### P3.1: Browser Memory Overflow with Large Canvas
**Warning signs:** Browser tab crashes or becomes unresponsive during design editing
**Prevention:** Limit upload to 10MB and 4000x4000px. Resize image before loading into Konva canvas (use createImageBitmap or offscreen canvas). Show error message for oversized files.
**Phase:** Phase 3 (Custom Design)

### P3.2: Malicious File Upload
**Warning signs:** Server-side vulnerabilities from executable uploads disguised as images
**Prevention:** Validate MIME type AND file extension on both client and server. Use ImageSharp to actually decode the image — if it fails, reject the file. Never serve uploads from the application domain (use Azure Blob Storage with separate domain).
**Phase:** Phase 3 (Custom Design), Phase 7 (Security)

### P3.3: Missing Image Optimization
**Warning signs:** Product pages load slowly due to 5MB+ images
**Prevention:** Use ImageSharp to resize and compress on upload. Generate thumbnails for listings (400x400) and full-size for detail pages (max 2000x2000). Set quality to 80% for JPG.
**Phase:** Phase 2 (Product Catalog)

### P3.4: Lost Upload on Network Failure
**Warning signs:** User uploads large design image, network drops, no feedback
**Prevention:** Show upload progress bar. Implement chunked upload for large files (or accept the simplicity of single upload with size limit). Show clear error message on failure with retry option.
**Phase:** Phase 3 (Custom Design)

## 4. E-Commerce Pitfalls

### P4.1: Cart Abandonment at Checkout
**Warning signs:** Users add items but never complete purchase
**Prevention:** Keep checkout flow short (2 steps max: address → payment). Show cart summary at all times. Don't force account creation. Save shipping address for returning customers. v2: abandoned cart emails.
**Phase:** Phase 4 (Cart & Checkout)

### P4.2: Guest Checkout Edge Cases
**Warning signs:** Guest orders orphaned (no user to link to), duplicate guest orders
**Prevention:** Link guest orders by email address. On order confirmation, offer account creation with pre-filled email. Don't send password — just offer "create account" option.
**Phase:** Phase 4 (Cart & Checkout)

### P4.3: Price Mismatch Between Cart and Checkout
**Warning signs:** Price changed between add-to-cart and checkout
**Prevention:** Re-validate prices server-side when creating the order. If prices changed, return error with updated prices. Frontend shows "price updated" message and asks user to confirm.
**Phase:** Phase 4 (Cart & Checkout)

### P4.4: Custom Design Pricing Inconsistency
**Warning signs:** Frontend calculates different price than backend
**Prevention:** Single source of truth: backend calculates final price. Frontend shows estimated price for UX, but order creation uses server-calculated price. Store option prices in database, not hardcoded.
**Phase:** Phase 3 (Custom Design)

## 5. Security Pitfalls

### P5.1: JWT in localStorage
**Warning signs:** XSS attack steals token from localStorage
**Prevention:** Store access token in JavaScript variable (memory only), NOT localStorage. Store refresh token in httpOnly secure cookie (set by API, inaccessible to JavaScript). Access token is short-lived (15 min).
**Phase:** Phase 1 (Authentication)

### P5.2: CORS Misconfiguration
**Warning signs:** API accessible from any origin, or frontend can't reach API
**Prevention:** Whitelist exact frontend origin: `https://dressfield.ge`. Don't use `*` for AllowAnyOrigin. Set `AllowCredentials()` if using cookies for refresh token. Test with browser DevTools.
**Phase:** Phase 1 (Foundation)

### P5.3: SQL Injection via EF Core
**Warning signs:** Raw SQL queries with string interpolation
**Prevention:** Always use parameterized queries or LINQ. EF Core parameterizes by default for LINQ queries. If raw SQL is needed, use `FromSqlInterpolated()` (parameterized) never `FromSqlRaw()` with string concatenation.
**Phase:** Phase 2+ (all database queries)

### P5.4: Missing Rate Limiting on Auth Endpoints
**Warning signs:** Brute-force password attacks succeed
**Prevention:** Rate limit login endpoint (10 requests per minute per IP). ASP.NET Core 8 has built-in rate limiting middleware. Also enforce account lockout after 5 failed attempts via ASP.NET Identity.
**Phase:** Phase 7 (Security)

### P5.5: Unvalidated File Upload Content Type
**Warning signs:** Uploaded SVGs with embedded JavaScript, or executables renamed to .jpg
**Prevention:** Check both Content-Type header AND magic bytes. Use ImageSharp to decode — if it can't parse as an image, reject. Serve from Blob Storage (separate domain) with `Content-Disposition: inline` and strict Content-Type.
**Phase:** Phase 3 (Custom Design), Phase 7 (Security)

## 6. Deployment Pitfalls

### P6.1: Hostinger Shared Hosting File Limits
**Warning signs:** Deployment fails due to inode limits or storage quota
**Prevention:** Keep static export lean. Don't deploy node_modules or source files. Only deploy the `out/` directory contents. Monitor Hostinger storage usage.
**Phase:** Phase 1 (Deployment)

### P6.2: Azure App Service Cold Starts
**Warning signs:** First request after idle period takes 10+ seconds
**Prevention:** Use Azure App Service "Always On" setting (requires Basic tier or higher). For free/shared tier, accept cold starts or implement health check pings.
**Phase:** Phase 1 (Deployment), Phase 7 (Production)

### P6.3: Database Connection Limits
**Warning signs:** "Too many connections" errors under load
**Prevention:** Hostinger shared MySQL has connection limits (typically 30-50). Use EF Core connection pooling. Set MaxPoolSize in connection string. Don't hold connections open longer than needed.
**Phase:** Phase 1 (Foundation)

### P6.4: Mixed Content (HTTP/HTTPS)
**Warning signs:** Browser blocks API calls or images due to mixed content
**Prevention:** Enforce HTTPS everywhere. Set `app.UseHttpsRedirection()` in ASP.NET Core. Ensure all image URLs from Blob Storage use HTTPS. Verify Hostinger SSL is configured.
**Phase:** Phase 7 (Security)

### P6.5: Environment Variable Leaks
**Warning signs:** API keys visible in client-side JavaScript
**Prevention:** Only `NEXT_PUBLIC_*` vars are embedded in static build. Never prefix secrets with `NEXT_PUBLIC_`. Backend secrets go in Azure Configuration (not in code). Add `.env` to `.gitignore`.
**Phase:** Phase 1 (Foundation)

## 7. Georgian Market Pitfalls

### P7.1: Georgian Font Not Loading
**Warning signs:** Georgian text (ქართული) renders in fallback font, looks unprofessional
**Prevention:** Self-host Georgian web fonts (BPG fonts or Noto Sans Georgian from Google Fonts). Include in Next.js via `next/font/local` or `next/font/google`. Test on Windows, macOS, and Android.
**Phase:** Phase 1 (Layout)

### P7.2: Georgian Text Truncation
**Warning signs:** Georgian characters are wider/taller than Latin, causing text overflow in UI elements
**Prevention:** Test all UI components with Georgian text (not just English placeholders). Georgian words can be significantly longer. Use `text-ellipsis` and `overflow-hidden` with generous max-widths. Set appropriate `line-height` for Georgian script.
**Phase:** Phase 1 (Layout), Phase 2+ (all UI)

### P7.3: Currency Formatting
**Warning signs:** Price shown as "100" instead of "₾100.00" or "100 ₾"
**Prevention:** Use `Intl.NumberFormat('ka-GE', { style: 'currency', currency: 'GEL' })` for consistent formatting. Georgian convention: `100,00 ₾` (comma decimal, lari symbol after). Test with various amounts.
**Phase:** Phase 2 (Product Catalog)

### P7.4: Phone Number Validation
**Warning signs:** Georgian phone numbers rejected by validation
**Prevention:** Georgian mobile numbers: +995 5XX XXX XXX (9 digits after country code). Don't use US-centric phone validation libraries. Use a simple regex or libphonenumber-js with Georgian locale.
**Phase:** Phase 4 (Checkout)

### P7.5: Address Format
**Warning signs:** Shipping address form expects US/EU format
**Prevention:** Georgian addresses don't always have postal codes (only Tbilisi has reliable ones). Make postal code optional. City field should include Georgian cities. Don't use address autocomplete APIs that don't support Georgia.
**Phase:** Phase 4 (Checkout)

---
*Research completed: 2026-03-27*
