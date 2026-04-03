# Dressfield Architecture

## Overview

Dressfield is a full-stack e-commerce platform for Georgian embroidery products. The architecture separates concerns across frontend (statically exported Next.js), backend (ASP.NET Core 8 layered API), and database (MySQL 8). The system supports two primary workflows: browsing pre-made products with shopping cart checkout, and custom embroidery order creation with live design preview.

---

## Frontend Architecture

**Framework**: Next.js 15 (Static Export)
- Output mode: `export` (pre-rendered static HTML/JS, no SSR/ISR)
- Deployment: Hostinger static files
- Assets: Unoptimized images (no next/image), custom fonts (Inter + Noto Sans Georgian)

### Component Hierarchy

```
RootLayout (layout.tsx)
├── MetaPixel (Analytics)
├── Header
│   ├── Logo
│   ├── NavLinks (desktop navigation)
│   └── MobileMenu
├── PageTransition (framer-motion wrapper)
├── Main Content (page routes)
└── Footer
```

### Route Structure

```
src/app/
├── page.tsx                          # Hero + featured products
├── products/
│   └── [slug]/page.tsx              # Product detail + variants
├── custom-order/                    # Design builder + submission
├── cart/                            # Cart display & management
├── checkout/                        # Address & payment initiation
├── order-confirmation/              # Success page
├── order-failed/                    # Payment failure page
├── orders/
│   └── detail/[id]/page.tsx        # Order tracking
├── auth/
│   ├── login/
│   ├── register/
│   ├── forgot-password/
│   └── reset-password/
└── admin/                           # Admin-only routes
    ├── products/
    │   ├── new/
    │   └── edit/[id]/
    ├── custom-orders/
    │   └── detail/[id]/
    └── orders/
        └── detail/[id]/
```

### Component Organization

```
src/components/
├── layout/
│   ├── header.tsx                   # Top navigation bar
│   ├── footer.tsx                   # Site footer
│   ├── nav-links.tsx                # Navigation menu items
│   └── mobile-menu.tsx              # Responsive hamburger menu
├── ui/                              # Reusable primitives
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── hero-gallery-client.tsx      # Featured products slider
│   ├── page-transition.tsx          # Page fade animation
│   └── [10+ more shadcn/ui components]
├── catalog/                         # Product browsing
│   ├── product-grid.tsx
│   ├── product-card.tsx
│   ├── product-detail.tsx
│   └── filters/
├── custom-order/                    # Design builder
│   ├── design-canvas.tsx            # Fabric.js canvas
│   ├── design-toolbar.tsx           # Tool palette
│   ├── background-remover.tsx       # Remove.bg integration
│   ├── design-uploader.tsx
│   └── order-summary.tsx
├── auth/                            # Authentication UI
│   ├── login-form.tsx
│   ├── register-form.tsx
│   ├── password-reset-form.tsx
│   └── protected-route-wrapper.tsx
├── admin/                           # Admin dashboard
│   ├── admin-sidebar.tsx
│   ├── product-editor.tsx
│   ├── products-manager.tsx
│   ├── orders-manager.tsx
│   ├── order-detail.tsx
│   ├── custom-orders-manager.tsx
│   └── custom-order-detail.tsx
└── analytics/
    └── meta-pixel.tsx               # Facebook Pixel events
```

### State Management

**Zustand** (`src/stores/cart-store.ts`):
- Single source of truth for cart state
- Persisted to localStorage via `persist` middleware
- Items: `{ productId, variantId?, name, variantLabel?, price, quantity, imageUrl? }`
- Auto-syncs to server when user is authenticated (500ms debounce)
- Suppresses sync during auth flow to prevent race conditions

**TanStack Query** (via `useQuery`/`useMutation`):
- Data fetching with automatic caching
- Used for products, orders, custom orders, and admin dashboard data
- Cache invalidation on mutations (create, update, delete)

**React Context** (Authentication):
- Access token stored in memory (via `setAccessToken()`)
- Refresh token stored in httpOnly cookie (server-set)

### Data Flow: Shopping Cart Checkout

```
ProductCard.addToCart()
  → useCartStore.addItem()
    → localStorage update
    → syncServerCart() trigger (500ms debounce)
      → POST /api/cart/sync
        → CartService.SyncAsync()
          → Cart entity in DB updated

User navigates to /checkout
  → CheckoutPage
    → Creates order: POST /api/orders/create
      → OrderService.CreateAsync()
        → Order + OrderItems entities created
        → Payment redirects to Bank of Georgia
          → paymentRedirectUrl returned
          → User redirected via window.location
    → BOG callback: GET /order-confirmation?orderId=X&status=paid
      → Payment webhook updates Order.Status = "Paid"
      → OrderService.LogStatusChange()
      → Email notification sent
```

### Data Flow: Custom Order Submission

```
CustomOrderPage
  → DesignCanvas (Fabric.js)
    ├── Upload design image
    │   → POST /api/uploads (remove background)
    │   ├── File security scan (ClamAV)
    │   ├── Background removal (@imgly/background-removal)
    │   └── Image uploaded to Azure Blob Storage
    │       → presigned URL returned
    └── Configure: placement, size, thread color, position

  → Submit order: POST /api/custom-orders/create
    → CustomOrderService.CreateAsync()
      ├── CustomOrder entity (status = "Pending")
      ├── CustomOrderDesign entities (1+ designs)
      └── Email sent to admin + customer

  → Admin receives notification
    → /admin/custom-orders
    → Approve/reject in detail view
    → OrderService updates status + notes
    → Email updates sent to customer
```

### Data Flow: Authentication

```
LoginForm submits
  → POST /api/auth/login
    → AuthService.LoginAsync()
      ├── User lookup & password hash verify
      ├── AccessToken (JWT, 15min)
      ├── RefreshToken (httpOnly cookie, 7 days)
      └── Stored in DB + returned

  → setAccessToken(jwt)
  → CartStore auto-syncs (if cart exists)
  → Redirect to /products or /orders

Token expires
  → API call gets 401
  → Axios interceptor: POST /api/auth/refresh
    → authService.RefreshAsync()
      ├── Lookup refresh token in httpOnly cookie
      ├── Validate + issue new AccessToken
      └── Token returned in response
  → Retry original request with new token

Logout / Token revoked
  → POST /api/auth/logout
  → setAccessToken(null)
  → Clear cart if guest
  → Redirect to login
```

### Key Libraries

| Library | Purpose |
|---------|---------|
| `next@16.2.1` | Static site generation + routing |
| `react@19.2.4` | Component framework |
| `@tanstack/react-query@5.95.2` | Server state & caching |
| `zustand@5.0.12` | Cart store (client-side) |
| `axios@1.13.6` | HTTP client with interceptors |
| `react-hook-form@7.72.0` | Form state management |
| `zod@4.3.6` | TypeScript schema validation |
| `fabric@5.5.2` | Canvas drawing (design builder) |
| `@imgly/background-removal@1.7.0` | Remove background from images |
| `framer-motion@12.38.0` | Animations & transitions |
| `tailwindcss@4` | Utility CSS styling |
| `shadcn/ui` | Pre-built component library |
| `sonner@2.0.7` | Toast notifications |

---

## Backend Architecture

**Framework**: ASP.NET Core 8
- REST API with JWT authentication
- Dependency injection via built-in container
- Serilog logging to console + rolling file
- Rate limiting per endpoint
- Exception handling middleware

### Layered Architecture

```
┌─ API Layer ─────────────────────────────────────────┐
│ Controllers, Middleware, Security Headers           │
│ • AuthController, ProductsController, etc.          │
│ • GlobalExceptionHandler, ForwardedHeaders           │
│ • CORS, Rate Limiting, JWT validation               │
└────────────────────────────────────────────────────┘
                         ↓
┌─ Application Layer ──────────────────────────────────┐
│ Services, DTOs, Validators, Business Logic          │
│ • AuthService, ProductService, OrderService         │
│ • DTOs: RegisterRequest, OrderDetailDto, etc.       │
│ • FluentValidation rules per DTO                    │
└────────────────────────────────────────────────────┘
                         ↓
┌─ Core Layer ────────────────────────────────────────┐
│ Entities, Enums, Business Logic Interfaces          │
│ • Product, Order, CustomOrder entities              │
│ • OrderStatus, CustomOrderStatus enums              │
│ • IOrderService, IAuthService interfaces            │
└────────────────────────────────────────────────────┘
                         ↓
┌─ Infrastructure Layer ──────────────────────────────┐
│ Database, External Services, Implementations        │
│ • DressfieldDbContext (EF Core + MySQL)            │
│ • AzureBlobStorageService, BogIPayService          │
│ • EmailOutboxWorker, FileSecurityScanner           │
│ • Migrations, Seeding                              │
└────────────────────────────────────────────────────┘
```

### Controller Endpoints

```
API/Controllers/

AuthController
  POST /api/auth/register           # Create customer account
  POST /api/auth/login              # Generate JWT + refresh token
  POST /api/auth/logout             # Revoke tokens
  POST /api/auth/refresh            # Rotate JWT

ProductsController
  GET /api/products                 # List all products
  GET /api/products/{id}            # Product detail + variants
  POST /api/products                # [Admin] Create product
  PUT /api/products/{id}            # [Admin] Update product
  DELETE /api/products/{id}         # [Admin] Delete product

CartController
  POST /api/cart/sync               # Sync local cart to server

OrdersController
  POST /api/orders/create           # Create order from cart
  GET /api/orders                   # List user's orders
  GET /api/orders/{id}              # Order detail + items
  PUT /api/orders/{id}/status       # [Admin] Update order status
  POST /api/orders/{id}/status-log  # [Admin] Log status change

CustomOrdersController
  POST /api/custom-orders           # Create custom order
  GET /api/custom-orders            # List user's custom orders
  GET /api/custom-orders/{id}       # Detail
  PUT /api/custom-orders/{id}       # [Admin] Update status

PaymentsController
  POST /api/payments/initiate       # Get BOG redirect URL
  GET /api/payments/callback        # BOG webhook (payment status)

UploadsController
  POST /api/uploads                 # Upload & scan file
  DELETE /api/uploads/{fileId}      # Remove upload

AdminDashboardController
  GET /api/admin/dashboard          # Stats: orders, revenue, etc.
```

### Service Layer

**AuthService**
- Register, Login, Logout, RefreshToken
- JWT generation (15min expiry, 256-bit secret)
- Password hashing via Identity
- Refresh token storage in DB (7-day TTL, revocation tracking)

**ProductService**
- Fetch products by slug, list all, search
- Create/update/delete products
- Manage variants and images
- Filter by featured/active status

**OrderService**
- Create order from cart items
- Calculate subtotal, shipping cost, total
- Manage order status transitions (Pending → AwaitingPayment → Paid → Processing → Shipped → Delivered)
- Log status changes with timestamps + admin notes
- Email notifications on state changes

**CartService**
- Sync local browser cart to server Cart entity
- Merge guest cart on login
- Calculate totals

**CustomOrderService**
- Create custom orders with designs
- Manage status (Pending → Review → Approved → Production → Complete)
- Store design metadata (placement, size, position, thread color)
- Reject orders with admin notes

**BogIPayService** (Payment Gateway)
- Generate payment redirect URL
- Validate webhook callbacks
- Order reconciliation on payment status

**StorageService** (Abstract)
- Implementations: AzureBlobStorageService (production), LocalStorageService (dev)
- Upload design images, scan for malware
- Return presigned URLs for access

**FileSecurityScanner** (Abstract)
- Implementations: ClamAvFileSecurityScanner (production), NoOpFileSecurityScanner (dev)
- Scan uploaded files for viruses

**EmailService**
- Queue emails to PendingEmail table
- Retry logic with exponential backoff
- SMTP delivery (production) or console output (dev)

### Database Schema (Key Entities)

**ApplicationUser** (ASP.NET Identity)
- Id, Email, PasswordHash, FirstName, LastName, EmailConfirmed

**Product**
- Id, Name, Slug (unique), Description, ShortDescription, BasePrice, Sku, IsActive, IsFeatured
- Relationships: ProductImages (1:many), ProductVariants (1:many)

**ProductVariant**
- Id, ProductId, Name, Value, Sku, PriceAdjustment, StockQuantity, IsActive

**ProductImage**
- Id, ProductId, ImageUrl, AltText, SortOrder, IsPrimary

**Cart**
- Id, UserId (unique per user)
- Relationships: CartItems (1:many)

**CartItem**
- Id, CartId, ProductId, VariantId (nullable), Quantity
- Unique constraint: (CartId, ProductId, VariantId)

**Order**
- Id, UserId, Status (enum), Subtotal, ShippingCost, TotalAmount
- Shipping: ContactName, ContactPhone, ContactEmail, ShippingCity, ShippingAddressLine1/2, ShippingPostalCode
- Payment: BogOrderId, BogOrderKey
- Notes: CustomerNotes, AdminNotes
- Timestamps: CreatedAt, UpdatedAt

**OrderItem**
- Id, OrderId, ProductId, ProductName, ProductSlug, ProductImageUrl
- VariantName, UnitPrice, Quantity, LineTotal

**OrderStatusLog**
- Id, OrderId, OldStatus, NewStatus, ChangedAt, Notes

**CustomOrder**
- Id, UserId, BaseProductId, Status (enum: 0-6)
- Contact: ContactName, ContactPhone, ContactEmail
- TotalPrice, CustomerNotes, AdminNotes
- Timestamps: CreatedAt, UpdatedAt

**CustomOrderDesign**
- Id, CustomOrderId, DesignImageUrl, Placement, Size, ThreadColor
- Position: Width, Height, PositionX, PositionY
- SortOrder (1+ designs per order)

**RefreshToken**
- Id, UserId, Token (unique), IssuedAt, ExpiresAt, IsRevoked

**PendingEmail**
- Id, ToEmail, Subject, Body, Status (Pending/Sent/Failed), NextRetryAt, LastError, Attempts

### Middleware Pipeline

```
Order of execution:
1. ForwardedHeaders               # Resolve real client IP from reverse proxy
2. ExceptionHandler              # Catch unhandled exceptions
3. Swagger/SwaggerUI             # API docs (dev only)
4. HttpsRedirection              # HTTPS enforcement (prod only)
5. Security Headers              # X-Frame-Options, X-Content-Type-Options, etc.
6. CORS                          # Cross-origin request filtering
7. RateLimiter                   # Per-endpoint rate limiting
8. StaticFiles                   # wwwroot/
9. Authentication                # JWT token validation
10. Authorization                # Role-based access control
11. MapControllers               # Route resolution
12. HealthChecks                 # /api/health endpoint
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **JWT + Refresh Token** | Stateless authentication, no server session store. HttpOnly cookies prevent XSS token theft. |
| **Static Export** | Hostinger shared hosting doesn't support Node.js. Pre-render all pages at build time. |
| **Layered Architecture** | Separation of concerns: API layer handles HTTP, Application layer handles orchestration, Core defines contracts, Infrastructure implements detail. |
| **Cart Sync (500ms debounce)** | Avoid rate limiting + server load on every keystroke. Batch updates. |
| **Webhook-based Payments** | Bank of Georgia redirects outside our control; webhook callback updates order status asynchronously. |
| **Design Upload to Azure Blob** | CDN delivery, presigned URLs for secure temporary access. |
| **File Security Scanning** | ClamAV integration for malware detection. Production safety. |
| **Order Status Log** | Immutable audit trail. Admin notes on each transition. |
| **Email Outbox Pattern** | Queue emails in DB, retry worker polls PendingEmail table. Prevents lost emails on crash. |
| **Admin Seed on Startup** | Initialize roles + first admin account on first run. Environment variables override defaults. |

### Constraints & Limitations

- **No ISR/SSR**: Static export means product catalog is baked at build time. New products require rebuild + redeploy.
- **20 MB upload limit**: Configured in Kestrel. Covers design images but not large video files.
- **MySQL 8.0.36**: Specific version pinned for Hostinger compatibility.
- **Single Admin Role**: All admins see all data. No role-based dashboard filtering yet.
- **No inventory tracking**: Stock quantities exist but not decremented on order. Manual process.
- **Synchronous file scanning**: Upload blocks until ClamAV scan completes. Slow uploads on slow ClamAV.

---

## Authentication & Authorization Flow

### JWT Token Structure

```
{
  "nameid": "<userId>",
  "email": "<user@email.com>",
  "role": "Admin" | "Customer",
  "exp": <15 minutes from now>,
  "iss": "dressfield-api",
  "aud": "dressfield-client"
}
```

### Protected Routes

| Route | Role Required |
|-------|---------------|
| `/cart`, `/checkout`, `/orders`, `/order-confirmation` | None (works guest + authenticated) |
| `/admin/*` | Admin |
| `/auth/login`, `/auth/register` | Guest only (redirect to `/products` if authenticated) |
| API: `PUT /api/orders/{id}/status` | Admin |
| API: `POST /api/products` | Admin |

### Guest Cart Merge on Login

1. Guest browses products, adds to local cart (Zustand store)
2. Guest logs in
3. Frontend: `setCartSyncSuppressed(true)` to prevent duplicate syncs
4. CartService.SyncAsync() merges guest cart into user's server cart
5. Frontend: Reload cart from server
6. `setCartSyncSuppressed(false)` to resume syncing

---

## Data Consistency & Reliability

### Cart-to-Order Flow

1. **Atomic Order Creation**: All OrderItems inserted in same transaction
2. **Stock Check**: Not implemented (future: decrement ProductVariant.StockQuantity)
3. **Price Locking**: Unit prices copied from Product at order time (not reference)
4. **Idempotent Cart Sync**: Sending cart twice with same state is safe

### Payment Workflow

1. **Pending Order Created**: Status = "Pending", awaiting BOG redirect
2. **User Redirected to BOG**: Payment initiated
3. **BOG Callback**: POST to `/api/payments/callback`
4. **Order Status Updated**: Status = "Paid" (or failed)
5. **Email Sent**: Async via PendingEmail worker

### Custom Order Approval

1. **Customer Submits**: Status = "Pending" (0)
2. **Admin Reviews**: Transitions to "Review" (1)
3. **Admin Approves**: "Approved" (2) → Email sent
4. **Production**: "In Production" (3)
5. **Complete**: Status 4, or Rejected (5), or Cancelled (6)

---

## Error Handling

### Global Exception Handler Middleware

Catches all unhandled exceptions and returns standardized ProblemDetails:

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "ContactName": ["Required field"]
  }
}
```

### FluentValidation

Every DTO validated before reaching service layer:
- RegisterRequest: email format, password strength, etc.
- CreateOrderRequest: shipping address, contact info
- Custom validators: unique email, order item quantities > 0

### Logging

Serilog configured to:
- Console output (all levels)
- Rolling daily file logs to `logs/dressfield-YYYY-MM-DD.log`
- Structured logging: warnings for missing config, errors for auth failures

---

## Deployment & Environment Configuration

### Environment-Specific Settings

**Development** (`appsettings.Development.json`):
- LocalStorageService (filesystem uploads)
- NoOpFileSecurityScanner (no malware scanning)
- MockPaymentService (fake payments)
- Admin password: "Admin123!@#" (fallback)

**Production** (Azure App Service environment variables):
- AzureStorage:ConnectionString → AzureBlobStorageService
- Security:ClamAv:Enabled=true, Host=<clamav-service>
- BogIPay:ClientId, ClientSecret → Real payment processing
- Jwt:Secret (256-bit minimum)
- Admin:Email, Admin:Password

### Deployment Targets

**Frontend**: Hostinger static files
- Build: `next build --webpack` → `out/` directory
- Serve: Static HTTP server
- Sitemap: Auto-generated via `next-sitemap`

**Backend**: Azure App Service
- Runtime: .NET 8
- Database: Hostinger MySQL (connection string in appsettings)
- Migrations: Auto-run on startup
- TLS: Terminated at Azure edge, enforced in middleware

### Health Check

```
GET /api/health
→ Checks database connectivity
→ Returns: {"status":"Healthy","checks":[{"name":"database","status":"Healthy"}]}
```
