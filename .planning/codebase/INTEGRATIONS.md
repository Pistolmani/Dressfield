# Dressfield External Integrations

## Overview
Dressfield integrates with several external services for payments, analytics, cloud storage, and email. This document details each integration, configuration, and implementation.

---

## Payment Processing

### Bank of Georgia (BOG) iPay

**Purpose:** Accept online payments from customers via redirect-based flow

**Integration Type:** OAuth2 + REST API

**Endpoints:**
- OAuth2 Token URL: `https://oauth2.bog.ge/auth/realms/BOG/protocol/openid-connect/token`
- Orders API: `https://api.bog.ge/payments/v1/ecommerce/orders`

**Flow:**
1. Customer initiates checkout → Backend creates order via BOG API
2. BOG returns redirect URL → Frontend redirects customer to BOG payment page
3. Customer completes payment on BOG
4. BOG webhooks backend with payment status → Callback endpoint processes
5. Customer redirected back to frontend confirmation/failure page

**Implementation:**
- Service: `BogIPayService` in `Dressfield.Infrastructure/Services/`
- Interface: `IPaymentService` (injectable, supports mocking)
- HttpClient: Auto-registered in Program.cs when ClientId is configured

**Configuration (appsettings.json):**
```json
{
  "BogIPay": {
    "ClientId": "",              // OAuth2 client ID (required for production)
    "ClientSecret": "",          // OAuth2 client secret (Azure env var)
    "ApiBaseUrl": "https://api.dressfield.ge",   // Webhook receiver URL
    "FrontendBaseUrl": "https://dressfield.ge",  // Redirect target
    "TokenUrl": "https://oauth2.bog.ge/auth/realms/BOG/protocol/openid-connect/token",
    "OrdersUrl": "https://api.bog.ge/payments/v1/ecommerce/orders"
  }
}
```

**Environment Variables (Azure App Service):**
- `BogIPay__ClientId` — OAuth2 client ID
- `BogIPay__ClientSecret` — OAuth2 client secret

**Development:**
- If `BogIPay:ClientId` is empty, `MockPaymentService` is used (always succeeds)
- No real BOG API calls in development

**Webhook Callback:**
- Endpoint: `POST /api/payments/callback?key={orderKey}`
- Receives signed JSON payload from BOG
- Signature verification required for security
- Must return 200 OK (BOG retries on timeout)
- Updates order status in database

**Key Classes:**
- `PaymentSessionResult` — OAuth token + redirect URL
- `PaymentVerificationResult` — Payment status verification
- `BogIPayService` — Full payment lifecycle management

**Error Handling:**
- Failed OAuth token fetch → returns error result
- Invalid signature → webhook rejected
- Network errors → logged, retry mechanism in place
- Webhook timeout → BOG retries (eventually succeeds)

**Compliance:**
- PCI DSS Level 1 (no card details stored locally)
- Redirect-based flow (no sensitive data in transit through frontend)
- Signed webhooks prevent tampering

**Status:** Production-ready, configured for live Georgian payment processing

---

## Analytics

### Meta Pixel (Facebook Pixel)

**Purpose:** Track user events (views, purchases) for ad targeting and ROI measurement

**Integration Type:** JavaScript library (client-side)

**Pixel ID:**
- Configured via: `process.env.NEXT_PUBLIC_META_PIXEL_ID`
- Must be set at build time (publicly visible)

**Tracked Events:**
1. **PageView** — Every page load
2. **ViewContent** — Product viewed
   - Params: `contentId`, `contentName`, `value` (price)
3. **AddToCart** — Product added to cart
   - Params: `contentId`, `contentName`, `value`, `quantity`
4. **InitiateCheckout** — Checkout started
   - Params: `contentIds[]`, `value` (total), `itemCount`
5. **Purchase** — Order confirmed
   - Params: `orderId`, `value` (amount)

**Implementation:**
- Library: `src/lib/analytics.ts`
- Client-side only: `typeof window === "undefined"` check
- Uses `window.fbq()` function (injected by Meta Pixel script tag)
- Currency: Hard-coded to "GEL" (Georgian Lari)

**Configuration:**
```html
<!-- Injected in HTML head (build-time or via script tag) -->
<script async src="https://connect.facebook.net/en_US/fbevents.js"></script>
<script>
  fbq('init', '{PIXEL_ID}');
</script>
```

**Exported Functions:**
```typescript
trackPageView()              // On route change
trackViewContent(args)       // On product detail page
trackAddToCart(args)         // When adding to cart
trackInitiateCheckout(args)  // On checkout page
trackPurchase(args)          // On order confirmation
```

**Usage Example:**
```typescript
import { trackViewContent, trackAddToCart } from "@/lib/analytics";

trackViewContent({
  contentId: product.id,
  contentName: product.name,
  value: product.price,
});
```

**Privacy & Compliance:**
- No PII collected (only product IDs, amounts, order IDs)
- Respects browser privacy settings (no cookies if blocked)
- Optional: Can be disabled in NEXT_PUBLIC_META_PIXEL_ID is not set

**Debugging:**
- Use Meta Pixel Helper Chrome extension to verify events
- Check browser console for fbq errors if disabled

**Status:** Integrated, ready for production analytics

---

## Cloud Storage

### Azure Blob Storage

**Purpose:** Store user-uploaded design images for custom orders

**Integration Type:** Azure SDK (REST + managed authentication)

**Service:** `IStorageService` interface (injectable)
- Production: `AzureBlobStorageService` (uses Azure.Storage.Blobs)
- Development: `LocalStorageService` (filesystem for testing)

**Configuration (appsettings.json):**
```json
{
  "AzureStorage": {
    "ConnectionString": "",      // Azure Storage account connection string
    "ContainerName": "designs",  // Blob container name
    "PublicBaseUrl": ""          // CDN/public URL for images
  }
}
```

**Environment Variables (Azure App Service):**
- `AzureStorage__ConnectionString` — Full connection string (required in production)

**Development Behavior:**
- If `AzureStorage:ConnectionString` is empty → `LocalStorageService` used
- Files stored in local filesystem (e.g., `./uploads/`)
- Warning logged to Serilog

**Upload Flow:**
1. Frontend uploads image via `/api/custom-orders/upload` (20 MB max)
2. Backend receives file stream, optional malware scan
3. Saved to Azure Blob or local filesystem
4. Returns public URL for preview mockup
5. URL stored in order record for retrieval

**Blob Container:**
- Name: `designs`
- Access: Private (SAS tokens or Azure identity for URLs)
- Retention: Long-term storage (no TTL)

**Blob Naming:**
- Pattern: `{OrderId}/{Timestamp}_{FileName}`
- Avoids collisions, enables per-order retrieval

**Security:**
- Private container (no anonymous access)
- SAS token URLs for time-limited public access
- HTTPS only (Azure enforces)
- No publicly accessible storage account keys in code

**SDK Version:**
- `Azure.Storage.Blobs` 12.27.0 — Latest stable

**Error Handling:**
- Network errors logged, not thrown (graceful degradation)
- Fallback to local storage if Azure unavailable in dev

**Status:** Integrated, production-ready for Azure cloud

---

## Email (SMTP)

**Purpose:** Send order confirmations, password resets, notifications

**Integration Type:** SMTP via MailKit

**Service:** `IEmailService` interface (injectable)
- Production: `SmtpEmailService` (via MailKit)
- Development: `DevEmailService` (logs to console, no sending)

**Configuration (appsettings.json):**
```json
{
  "Smtp": {
    "Host": "",                    // SMTP server hostname
    "Port": 465,                   // SMTP port (465 for SSL)
    "Username": "",                // SMTP username
    "Password": "",                // SMTP password
    "FromEmail": "noreply@dressfield.ge",  // Sender email
    "FromName": "DressField",      // Sender display name
    "UseSsl": true                 // Use TLS/SSL
  }
}
```

**Environment Variables (Azure App Service):**
- `Smtp__Host` — SMTP server (e.g., smtp.gmail.com)
- `Smtp__Username` — SMTP user
- `Smtp__Password` — SMTP password

**Email Types:**
1. Order Confirmation — Sent after successful payment
2. Password Reset Link — Token-based password recovery
3. Custom Order Status Updates — Design review, completion notifications
4. Admin Alerts (optional) — New orders, payment failures

**Library:**
- `MailKit` 4.15.1 — Modern, async-capable SMTP client
- Supports TLS, authentication, attachments

**Development:**
- `DevEmailService` logs email to console (no actual sending)
- Allows testing without SMTP setup

**Production:**
- Requires valid SMTP credentials (Gmail, SendGrid, company SMTP, etc.)
- TLS/SSL enforced for security

**Status:** Integrated, ready for production email service

---

## Database

### MySQL 8.0.36

**Purpose:** Persist all application data (users, orders, products, designs, tokens)

**Integration Type:** Entity Framework Core ORM

**Provider:** `Pomelo.EntityFrameworkCore.MySql` 9.x

**Configuration (appsettings.json):**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=host;Database=dressfield;User=user;Password=pass;"
  }
}
```

**Environment Variables (Azure App Service / Hostinger):**
- `ConnectionStrings__DefaultConnection` — Full connection string

**Migration Strategy:**
- Database-first via EF Core migrations
- Applied automatically on application startup
- `Program.cs` → `db.Database.MigrateAsync()`

**Seeding:**
- Admin roles created on startup if missing
- First admin account seeded with configurable password
- Refresh tokens revoked if admin password is reset

**Health Check:**
- Endpoint: `/api/health`
- Includes database connectivity check
- Returns 503 if database unavailable

**Connection Pool:**
- Managed by ADO.NET (PocoDataProvider)
- Connection reuse for performance
- Timeout: Configurable per connection string

**Entities:**
- `ApplicationUser` — User accounts with identity
- `Order` — Customer orders with payment status
- `CustomOrder` — Custom embroidery design orders
- `Product` — Pre-made embroidered products
- `RefreshToken` — JWT token storage for refresh

**Backup & Recovery:**
- Hostinger managed backups (customer responsibility)
- EF Core migrations enable schema version control

**Status:** Integrated, production-ready for Hostinger MySQL

---

## Security & Malware Scanning

### ClamAV (Optional)

**Purpose:** Scan user-uploaded design files for malware

**Integration Type:** Network socket (ClamAV daemon)

**Service:** `IFileSecurityScanner` interface (injectable)
- Production: `ClamAvFileSecurityScanner` (connects to ClamAV daemon)
- Development: `NoOpFileSecurityScanner` (no scanning, always passes)

**Configuration (appsettings.json):**
```json
{
  "Security": {
    "ClamAv": {
      "Enabled": false,            // Enable/disable scanning
      "Host": "clamav-server",     // ClamAV daemon hostname
      "Port": 3310,                // ClamAV daemon port
      "TimeoutSeconds": 15         // Scan timeout
    }
  }
}
```

**Environment Variables (Azure App Service):**
- `Security__ClamAv__Enabled` — true/false
- `Security__ClamAv__Host` — ClamAV daemon host
- `Security__ClamAv__Port` — ClamAV daemon port

**Scan Flow:**
1. User uploads design image → API receives file
2. If ClamAV enabled → Connect to daemon, scan file
3. If threat detected → Reject upload, log incident
4. If clean → Allow upload to Azure Blob

**Default Behavior:**
- ClamAV disabled by default (no scanning)
- Warning logged in production if disabled
- No impact on upload flow if not configured

**Production Recommendation:**
- Enable ClamAV on separate hardened server
- Use network timeout to prevent upload hangs
- Monitor quarantine logs for suspicious activity

**Status:** Integrated but optional, can be enabled for enhanced security

---

## Authentication & Authorization

### JWT (JSON Web Tokens)

**Purpose:** Stateless API authentication for frontend

**Implementation:**
- Issued by: `/api/auth/login` endpoint
- Verified by: `Microsoft.AspNetCore.Authentication.JwtBearer` middleware
- Stored by: Frontend in memory (no persistent storage)

**Configuration (appsettings.json):**
```json
{
  "Jwt": {
    "Secret": "",                              // Signing secret (min 32 chars)
    "Issuer": "https://api.dressfield.ge",    // Token issuer
    "Audience": "https://dressfield.ge",      // Expected audience
    "AccessTokenExpirationMinutes": 15,       // Short-lived access token
    "RefreshTokenExpirationDays": 7           // Long-lived refresh token
  }
}
```

**Environment Variables (Azure App Service):**
- `Jwt__Secret` — HMAC signing secret (NEVER expose)

**Token Types:**
1. **Access Token** — Short-lived (15 min default)
   - Claims: UserId, Email, Roles
   - Sent in `Authorization: Bearer <token>`

2. **Refresh Token** — Long-lived (7 days default)
   - Stored in HTTP-only cookie (secure transport)
   - Used to mint new access tokens
   - Can be revoked (stored in database)

**Flow:**
1. `/api/auth/login` → Returns access token + sets refresh cookie
2. Each API call → Frontend sends `Authorization: Bearer <token>`
3. On 401 → Frontend calls `/api/auth/refresh` → Returns new access token
4. `/api/auth/logout` → Revokes refresh token

**Frontend Integration:**
- Axios interceptor in `src/lib/api.ts`
- Auto-refreshes on 401 response
- Handles token state during redirect-based payment flow

**Security:**
- Signing key must be 32+ characters (enforced at startup)
- Access token cannot be refreshed (prevents infinite refresh)
- Refresh token revocation prevents session hijacking

**Development:**
- If `Jwt:Secret` is empty, defaults to dev key (never in production)
- `localhost:3000` allowed in dev CORS

**Status:** Core to API security, production-ready

---

## Webhooks & Callbacks

### Bank of Georgia Payment Callbacks

**Endpoint:** `POST /api/payments/callback?key={orderKey}`

**Purpose:** Receive asynchronous payment status updates from BOG

**Payload Structure:**
```json
{
  "order_id": "ORDER-12345",
  "status": "success|failed|pending",
  "signature": "hmac-sha256-signature"
}
```

**Security:**
- HMAC-SHA256 signature verification (prevents tampering)
- Signature calculated from payload + client secret
- Invalid signatures rejected, incident logged

**Processing:**
1. Verify signature authenticity
2. Lookup order by `orderKey`
3. Update order status in database
4. Send confirmation email if successful
5. Return 200 OK (required by BOG)

**Error Handling:**
- If database error → Log, return 500 (BOG retries)
- If signature invalid → Return 400, log security incident
- If order not found → Return 404, log orphaned callback

**Retry Logic:**
- BOG retries on non-2xx response
- Eventual consistency (callback may arrive after customer returns)
- Idempotent (safe to process duplicate callbacks)

**Status:** Implemented, tested with BOG sandbox

---

## Summary Table

| Service | Type | Status | Config Location | Notes |
|---------|------|--------|-----------------|-------|
| Bank of Georgia iPay | Payment | Production | appsettings.json + Azure env vars | OAuth2 + REST API, redirect flow |
| Meta Pixel | Analytics | Integrated | NEXT_PUBLIC_META_PIXEL_ID env var | Client-side tracking |
| Azure Blob Storage | Storage | Production | appsettings.json + Azure env vars | Optional, fallback to local |
| MySQL 8.0 | Database | Production | ConnectionStrings env var | Hostinger or Azure managed |
| MailKit SMTP | Email | Production | appsettings.json + Azure env vars | Optional, DevEmailService in dev |
| ClamAV | Malware Scan | Optional | appsettings.json | Disabled by default |
| JWT | Authentication | Core | appsettings.json + Jwt__Secret env var | Stateless token-based auth |

---

## Environment Configuration Checklist

**For Production Deployment:**

Frontend Environment Variables:
- [ ] `NEXT_PUBLIC_API_URL` — Backend API URL
- [ ] `NEXT_PUBLIC_META_PIXEL_ID` — Meta Pixel ID

Backend Environment Variables (Azure App Service):
- [ ] `Jwt__Secret` — 32+ char HMAC key
- [ ] `BogIPay__ClientId` — BOG OAuth2 ID
- [ ] `BogIPay__ClientSecret` — BOG OAuth2 secret
- [ ] `AzureStorage__ConnectionString` — Azure Blob connection
- [ ] `ConnectionStrings__DefaultConnection` — MySQL connection string
- [ ] `Smtp__Host`, `Smtp__Username`, `Smtp__Password` — Email SMTP config
- [ ] `Admin__Email`, `Admin__Password` — Initial admin account
- [ ] `Security__ClamAv__Enabled` — true if malware scanning desired
- [ ] `Security__ClamAv__Host`, `Security__ClamAv__Port` — ClamAV daemon config

**Validation:**
- Run health check: `GET /api/health` → 200 OK
- Test login flow with admin account
- Test order creation with BOG test mode
- Verify file uploads reach Azure Blob
- Check email sending (test order confirmation)

