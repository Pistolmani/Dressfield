# Dressfield — Technical Concerns & Constraints

**Last Updated:** 2026-04-01
**Scope:** Frontend (Next.js 15 static export), Backend (ASP.NET Core 8), Infrastructure (Hostinger + Azure)
**Status:** MVP phase (Phase 7 in progress — soft launch ready)

---

## 1. Deployment Constraints (Critical)

### Static Export Rebuild Requirement
- **Constraint:** Next.js static export (`output: "export"` in next.config.ts) requires full rebuild and redeployment for any product/catalog changes
- **Impact:** Product price updates, new products, category changes all require `npm run build` + redeploy
- **Mitigation:** For MVP with <50 products, rebuild is acceptable (takes seconds). Document the workflow for admin. Add "Last built" timestamp visible to admin dashboard.
- **Future Scaling:** Migration to Vercel for ISR/SSR if catalog grows rapidly or frequent updates needed

### No Server-Side Rendering (SSR)
- **Constraint:** Hostinger shared hosting cannot run Node.js runtime
- **Impact:**
  - No Server Components with database queries in page.tsx
  - No dynamic route generation (use `generateStaticParams()` instead)
  - No incremental static regeneration (ISR)
  - No Next.js API routes (`/api/*` routes won't execute on Hostinger)
- **Mitigation:** All API calls routed to Azure ASP.NET Core backend. Client-side data fetching via TanStack Query. SEO handled via build-time static generation.

### Image Optimization Disabled
- **Constraint:** `images: { unoptimized: true }` in next.config.ts disables next/image optimization
- **Impact:** Product images not automatically compressed or resized by Next.js
- **Mitigation:** Must handle image compression server-side (backend Azure Blob Storage with ImageSharp). Ensure all product images are pre-optimized before upload.

### Trailing Slash Requirement
- **Constraint:** `trailingSlash: true` in next.config.ts generates `index.html` in subdirectories
- **Impact:** Direct URL access (e.g., `/products/embroidered-tshirt/`) may fail if .htaccess not configured
- **Mitigation:** Test direct URL access after Hostinger deployment. May need .htaccess SPA fallback rule.

---

## 2. Hosting & Infrastructure Constraints

### Hostinger Shared Hosting Limits
- **File Limits:** Shared hosting has inode and storage quota restrictions
  - **Mitigation:** Deploy only `out/` directory contents (static files), not node_modules or source code. Monitor storage usage regularly.
- **FTP/Git Deployment:** Manual upload or Git push to Hostinger
  - **Mitigation:** Document deployment steps. Consider automating via GitHub Actions + FTP if possible.
- **No Background Jobs:** Cannot run Node.js background processes
  - **Mitigation:** Use Azure backend for scheduled jobs (email cleanup, stale order purging via Hangfire if needed)

### Hostinger MySQL Connection Limits
- **Constraint:** Shared MySQL typically allows 30-50 concurrent connections
- **Risk:** "Too many connections" errors under load
- **Current Mitigation:** EF Core connection pooling enabled. MaxPoolSize configured in connection string. Not an issue for MVP (<100 concurrent users).
- **Future:** If traffic grows, upgrade to managed MySQL or implement connection pooling middleware

### Azure App Service Cold Starts
- **Constraint:** B1 tier (Basic) on Azure may incur cold starts after idle periods
- **Risk:** First request after 10+ minutes idle can take 10+ seconds
- **Current:** "Always On" setting not enabled (cost optimization for MVP)
- **Mitigation:** Accept cold starts for now. Enable "Always On" in production if SLA requires <5s first response.

### Mixed Content Risk (HTTP/HTTPS)
- **Constraint:** All API calls must use HTTPS; Blob Storage images must use HTTPS
- **Risk:** Browser blocks mixed content (HTTP images loaded on HTTPS page)
- **Mitigation:** Enforce HTTPS in ASP.NET Core (`app.UseHttpsRedirection()`). Verify all image URLs in responses use HTTPS.

---

## 3. Frontend Architecture Concerns

### JWT Token Storage Security
- **Current Implementation:** Access token stored in JavaScript memory (not localStorage)
- **Status:** CORRECT. Refresh token stored in httpOnly secure cookie.
- **Risk Mitigation:** If changed to localStorage, tokens would be vulnerable to XSS attacks. Keep current approach.

### CORS Misconfiguration Risk
- **Configuration:** `Cors: { "Origins": [ "https://dressfield.ge" ] }` in appsettings.json
- **Current Status:** Correctly whitelists single origin. Not using `AllowAnyOrigin()`.
- **Staging Concern:** Staging subdomain (e.g., `https://staging.dressfield.ge`) not in list. Must update for staging environment.
- **Mitigation:** Use environment-specific appsettings files (appsettings.Production.json, appsettings.Staging.json).

### Unoptimized Images in Listings
- **Risk:** Product listing pages may load large (2-5MB+) images without compression
- **Current:** Image optimization disabled in Next.js; relies on backend to serve compressed versions
- **Mitigation:** Ensure backend generates thumbnails (400x400px for listings, max 2000x2000 for detail pages) on upload.

### Canvas Editor Memory Constraints
- **Risk:** Large design uploads (>10MB or >4000x4000px) can crash browser tab when loaded into fabric canvas
- **Mitigation:** Enforce upload size limit (10MB max). Validate image dimensions client-side. Resize image before canvas rendering.
- **Current Status:** Upload limit not yet enforced in code (check custom-design upload validation).

---

## 4. Backend & Database Concerns

### Empty Secrets in Configuration
- **Current State:** appsettings.json has empty values for:
  - `Jwt.Secret` — Must be set before production
  - `AzureStorage.ConnectionString` — Must be set for image uploads
  - `BogIPay.ClientId` / `ClientSecret` — Demo credentials for dev, production credentials needed for launch
  - `Smtp.*` — Email sending disabled until configured
- **Risk:** Empty secrets will cause runtime errors. Must populate before production deployment.
- **Mitigation:** Use Azure Key Vault or environment variables for production. Never commit secrets.

### Helix.BankOfGeorgia.IpayClient Dependency
- **Package:** Not found in Dressfield.Infrastructure.csproj
- **Risk:** Payment flow may fail if iPay client not installed or properly referenced
- **Mitigation:** Verify NuGet package is installed. Check Program.cs for DI registration of PaymentService.
- **Note:** iPay integration is critical for Phase 5 (Payments). Ensure integration tests pass before production.

### Missing ClamAV Antivirus Integration
- **Current State:** `Security.ClamAv.Enabled = false` in appsettings.json
- **Risk:** Uploaded design files not scanned for malware
- **Mitigation:** For MVP, acceptable to skip (files stored in Azure Blob, not served from app domain). Enable before public launch if needed.
- **Note:** ImageSharp validation of file content mitigates most risks.

### EF Core Query Translation Issues
- **Fixed:** Recent fixes for order detail lookups (`/api/orders/my/{id}` and custom order lookups)
- **Remaining Risk:** LINQ queries with client-side projections may fail on translation to SQL
- **Mitigation:** Use `.AsEnumerable()` only after filtering on server. Test all queries with SQL profiler.

### No Database Backup Strategy Documented
- **Risk:** Data loss if Hostinger MySQL has issues
- **Mitigation:** Document backup procedure for Hostinger. Consider automated daily exports or replication.
- **Production Concern:** Establish backup & restore SLA before launch.

---

## 5. Payment Processing Concerns (Phase 5)

### Webhook Idempotency Risk
- **Critical:** BOG iPay webhook may be retried if response is non-200
- **Risk:** Duplicate orders, double-charged customers if webhook handler processes twice
- **Current Mitigation:** Documented in PITFALLS.md. Use `IPayPaymentId` as idempotency key. Check status before updating.
- **Code Status:** Must verify webhook handler in `PaymentsController.cs` implements checks and returns 200 always.

### Race Condition: Redirect vs Webhook
- **Risk:** Customer redirected to success page before webhook confirms payment in database
- **Scenario:** Webhook arrives 2+ seconds after redirect completes
- **Mitigation:** Frontend polls `/api/payments/{orderId}/status` on success page. Don't rely solely on URL parameters.
- **Code Status:** Check if PaymentSuccess page implements polling.

### Demo/Production Credential Separation
- **Current:** appsettings.json has empty ClientId/ClientSecret
- **Development:** Demo credentials available (ClientId: 1006)
- **Risk:** Accidental use of production credentials in development environment
- **Mitigation:** Use separate appsettings files. Never hardcode credentials. Document demo vs production setup clearly.

### Missing Payment Timeout Cleanup
- **Risk:** Orders in "PendingPayment" status indefinitely if customer abandons checkout
- **Mitigation:** Implement background job to mark stale PendingPayment orders as Cancelled after 30 minutes.
- **Status:** Not yet implemented. Add to Phase 7 or future release.

---

## 6. Security Concerns

### Input Validation
- **Status:** FluentValidation configured in application layer
- **Phone Validation:** Georgian format enforced (+995 5XX XXX XXX)
- **File Upload Validation:** Documented (type, size, dimensions checks needed)
- **Concern:** Validate that all user inputs are validated before reaching database

### Rate Limiting
- **Current Status:** No rate limiting middleware visible in Program.cs
- **Risk:** Brute-force attacks on login endpoint, API abuse
- **Mitigation:** ASP.NET Core 8 has built-in rate limiting. Implement:
  - Login endpoint: 10 requests per minute per IP
  - Account lockout: 5 failed attempts
- **Action:** Add to Phase 7 security hardening

### HTTPS Enforcement
- **Status:** `app.UseHttpsRedirection()` should be in ASP.NET Core pipeline
- **Verification:** Confirm Hostinger SSL certificate installed for static frontend

### File Upload Security
- **Current:** ImageSharp validation mitigates malicious uploads
- **Concern:** Ensure files stored on Azure Blob (separate domain) with correct Content-Disposition headers
- **Missing:** ClamAV integration (acceptable for MVP)

### Admin Authentication
- **Note:** Local admin login uses rotated/non-default credential (logged as blocker in STATE.md)
- **Risk:** Admin access may be locked out or inaccessible
- **Mitigation:** Reset admin user credentials before production. Document admin login process.

---

## 7. Test Coverage Concerns

### Frontend Test Coverage
- **Current:** Vitest configured in package.json
- **Coverage:** Cart logic has test coverage (added 2026-04-01)
- **Gap:** No tests for payment flow, checkout, custom design upload, product filtering
- **Recommendation:** Add integration tests for critical user journeys before launch

### Backend Test Coverage
- **Current:** xUnit test project created (Dressfield.Tests) with SQLite in-memory database
- **Coverage:** Initial test structure in place
- **Gap:** No comprehensive test coverage documented
- **Recommendation:** Add tests for:
  - Payment webhook handler (idempotency)
  - Order creation (price validation)
  - Custom design upload (image validation)
  - Cart sync (concurrent updates)

### CI Pipeline
- **Current:** Tests wired into CI (npm test, dotnet test before build)
- **Status:** Passing as of 2026-04-01
- **Note:** Tests are run but may not have high coverage percentage

---

## 8. Performance Concerns

### Static Export Build Time
- **Risk:** Large number of products (>1000) could increase build time significantly
- **Current MVP:** <50 products, build time negligible
- **Future Scaling:** If products exceed 500, may need to implement incremental builds or migrate to ISR

### Image Serving Performance
- **Risk:** Unoptimized images on product listing pages
- **Mitigation:** Ensure backend generates thumbnails on upload. Set max file size limits.

### Database Query Performance
- **Risk:** Lazy loading in EF Core could cause N+1 queries
- **Mitigation:** Use `.Include()` for related entities. Test queries with SQL profiler.

### Canvas Rendering Performance
- **Risk:** Large design images or many canvas objects slow down rendering
- **Mitigation:** Limit image resolution. Optimize fabric.js/Konva canvas library usage.

---

## 9. Geographic & Localization Concerns

### Georgian Font Loading
- **Current:** Noto_Sans_Georgian via Google Fonts (next/font/google)
- **Status:** Correctly configured in layout.tsx
- **Risk:** If Google Fonts unreachable, fallback font may not render Georgian text properly
- **Mitigation:** Consider self-hosting BPG fonts as fallback

### Georgian Text Truncation
- **Risk:** Georgian text wider/taller than Latin; UI elements may overflow
- **Mitigation:** Test all UI with Georgian text. Use generous max-widths. Set appropriate line-height.
- **Status:** Need to audit all components for Georgian text handling

### Currency Formatting
- **Risk:** Prices shown as "100" instead of "100.00 ₾" or "₾100.00"
- **Mitigation:** Use `Intl.NumberFormat('ka-GE', { style: 'currency', currency: 'GEL' })`
- **Status:** Verify all price displays use correct formatting

### Address Validation
- **Risk:** Georgian addresses don't have postal codes (except Tbilisi)
- **Mitigation:** Make postal code optional in address form
- **Status:** Verify checkout address form allows optional postal code

---

## 10. Outstanding TODOs & Known Blockers

### Admin Local Login Credentials
- **Status:** Non-default credentials in local DB (documented blocker)
- **Action:** Reset admin credentials before production. Document login process.

### Environment-Specific Configuration
- **Gap:** No appsettings.Production.json or appsettings.Staging.json documented
- **Risk:** Production secrets may leak or staging may use wrong configuration
- **Action:** Create separate config files for each environment before deployment

### BOG iPay Integration Testing
- **Gap:** No documented test cases for payment webhook or redirect flow
- **Action:** Add integration tests for payment flow using demo credentials

### Azure Blob Storage Configuration
- **Current:** ConnectionString empty in appsettings.json
- **Risk:** Image uploads will fail in production
- **Action:** Configure Azure Storage connection before launch

---

## 11. Deployment Readiness Checklist

### Before Production Cutover
- [ ] Empty secrets filled in appsettings.Production.json (Jwt.Secret, Azure Storage, BOG iPay production credentials, SMTP)
- [ ] Admin credentials reset and documented
- [ ] CORS origins updated for production domain
- [ ] SSL certificate installed on Hostinger
- [ ] Backup strategy documented for Hostinger MySQL
- [ ] Rate limiting implemented on auth endpoints
- [ ] Payment webhook idempotency verified
- [ ] Test coverage audit completed
- [ ] Staging environment tested end-to-end
- [ ] Georgian text rendering audited across all pages
- [ ] Performance profiling completed
- [ ] Security checklist completed (OWASP top 10)

### Post-Launch Monitoring
- [ ] API error logs monitored in Azure App Service
- [ ] Database connection pool health monitored
- [ ] Payment webhook success rate monitored
- [ ] Hostinger storage usage monitored
- [ ] Slow query logs audited weekly

---

## 12. Risk Assessment Summary

| Risk | Severity | Phase | Mitigation Status |
|------|----------|-------|------------------|
| Static export rebuild requirement | Medium | Deployment | Acceptable for MVP; document workflow |
| Empty production secrets | Critical | 1 (Configuration) | Must fill before launch |
| Webhook idempotency | Critical | 5 (Payments) | Documented; code review needed |
| CORS misconfiguration | High | 1 (Foundation) | Environment-specific config needed |
| Admin credential reset | High | 7 (Launch) | Blocker; must reset before go-live |
| Canvas memory overflow | Medium | 3 (Custom Design) | Upload size limit needed |
| Georgian text truncation | High | UI (All phases) | Audit needed |
| Database connection limits | Medium | 1 (Infrastructure) | EF Core pooling configured |
| Payment webhook race condition | High | 5 (Payments) | Frontend polling needed; verify code |
| Test coverage gaps | Medium | 7 (Launch) | Vitest + xUnit in place; expand coverage |

---

## 13. Future Technical Debt

### Recommended for Post-MVP Versions
1. **Incremental Static Regeneration (ISR):** Migrate to Vercel if product catalog grows >500 items
2. **Background Jobs:** Implement Hangfire for email queues, stale order cleanup, image processing
3. **Caching Strategy:** Add Redis for session/cart caching if traffic exceeds 100 concurrent users
4. **API Rate Limiting:** Implement comprehensive rate limiting across all endpoints
5. **Comprehensive Test Coverage:** Target 80%+ coverage for critical paths
6. **Performance Monitoring:** Add APM (Application Insights integration) for real-time performance tracking
7. **Admin Panel Improvements:** Add analytics dashboard, inventory management, bulk operations
8. **Image CDN:** Implement Azure CDN for faster image delivery if Hostinger bandwidth limited
9. **Abandoned Cart Emails:** Implement background job for abandoned cart email reminders (Phase v2)
10. **Multi-language Support:** Prepare architecture for future Russian/Armenian translations if market demands

---

## Document Metadata

- **Created:** 2026-04-01
- **Phase:** 7 (Security, Polish & Launch)
- **Status:** MVP soft-launch ready
- **Next Review:** After production cutover or end of Phase 7

