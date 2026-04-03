# Dressfield Project Structure

## Directory Layout

### Root

```
Dressfield/
├── .claude/                        # Claude Code harness
│   ├── launch.json                 # Server configurations
│   ├── settings.json               # Tool settings
│   └── worktrees/                  # Git worktrees for parallel work
│
├── .planning/                      # GSD workflow artifacts
│   ├── PROJECT.md                  # Project charter
│   ├── REQUIREMENTS.md             # User stories + acceptance criteria
│   ├── ROADMAP.md                  # Phase breakdown (7 phases)
│   ├── STATE.md                    # Current milestone + phase status
│   ├── config.json                 # GSD config
│   ├── codebase/                   # Codebase documentation
│   │   ├── STACK.md               # Technology stack summary
│   │   ├── ARCHITECTURE.md        # This file (design patterns, data flow)
│   │   └── STRUCTURE.md           # Directory structure (this file)
│   ├── phases/                     # Phase plans & execution logs
│   └── research/                   # Research artifacts
│
├── Dressfield.web/                # Next.js frontend
├── Dressfield.backend/            # ASP.NET Core API
├── Dressfield.docs/               # Architecture docs & references
├── Dressfield.BussinesStrategy/   # Business documentation
│
└── README.md                       # Project overview
```

---

## Frontend: Dressfield.web

Complete Next.js 15 project with static export.

### Root Configuration Files

```
Dressfield.web/
├── package.json                    # Dependencies, scripts
├── package-lock.json               # Locked versions
├── tsconfig.json                   # TypeScript configuration
├── next.config.ts                  # Next.js static export settings
├── postcss.config.mjs              # Tailwind CSS pipeline
├── tailwind.config.ts              # Tailwind customization
├── vitest.config.ts                # Unit test runner config
├── eslint.config.mjs               # Code quality rules
├── components.json                 # shadcn/ui component registry
├── next-sitemap.config.js          # XML sitemap generation
│
├── .next/                          # Build output (gitignored)
├── out/                            # Static export (gitignored)
└── node_modules/                   # Dependencies (gitignored)
```

### Source Code: `src/`

#### App Directory: `src/app/` (Next.js Routes)

Files in `app/` are converted to routes. Layout files wrap child routes.

```
src/app/
│
├── layout.tsx                      # Root layout (shared by all pages)
│   • Wraps with Providers, Header, Footer, PageTransition
│   • Sets HTML lang="ka" (Georgian)
│   • Configures metadata (OpenGraph, Twitter Card)
│
├── page.tsx                        # Home page / Hero + featured products
├── error.tsx                       # Error boundary for runtime errors
├── not-found.tsx                   # 404 page
├── globals.css                     # Tailwind directives + global styles
│
├── products/
│   ├── layout.tsx                  # Layout for product pages
│   └── [slug]/
│       └── page.tsx                # Product detail: variants, images, add-to-cart
│
├── custom-order/
│   ├── layout.tsx
│   └── page.tsx                    # Design builder page
│                                   # • Upload design image
│                                   # • Configure placement/size/color
│                                   • Submit custom order form
│
├── cart/
│   ├── layout.tsx
│   └── page.tsx                    # Cart overview
│                                   # • Show items from Zustand store
│                                   # • Adjust quantities
│                                   # • Proceed to checkout
│
├── checkout/
│   ├── layout.tsx
│   └── page.tsx                    # Shipping & payment page
│                                   # • Address form
│                                   # • Create order + redirect to BOG
│
├── order-confirmation/
│   ├── layout.tsx
│   └── page.tsx                    # Success page after payment
│
├── order-failed/
│   ├── layout.tsx
│   └── page.tsx                    # Failure page if payment rejected
│
├── orders/
│   ├── layout.tsx
│   ├── page.tsx                    # Order history list
│   └── detail/
│       └── [id]/
│           └── page.tsx            # Order detail + items
│
├── auth/
│   ├── layout.tsx
│   ├── login/
│   │   └── page.tsx                # Login form + auth flow
│   ├── register/
│   │   └── page.tsx                # Registration form
│   ├── forgot-password/
│   │   └── page.tsx                # Email password reset link
│   └── reset-password/
│       └── page.tsx                # Confirm new password
│
└── admin/
    ├── layout.tsx                  # Admin sidebar layout
    ├── page.tsx                    # Dashboard index
    ├── products/
    │   ├── page.tsx                # List products (manage)
    │   ├── new/
    │   │   └── page.tsx            # Create product form
    │   └── edit/
    │       └── [id]/
    │           └── page.tsx        # Edit product form
    ├── orders/
    │   ├── page.tsx                # List orders
    │   └── detail/
    │       └── [id]/
    │           └── page.tsx        # Order detail + status update
    ├── custom-orders/
    │   ├── page.tsx                # List custom orders
    │   └── detail/
    │       └── [id]/
    │           └── page.tsx        # Detail + approve/reject
    └── [catchall]/page.tsx         # 404 for invalid admin routes
```

#### Components: `src/components/` (Reusable React Components)

```
src/components/
│
├── layout/                         # Page structure components
│   ├── header.tsx                  # Navigation bar with logo, menu
│   ├── footer.tsx                  # Footer with links, copyright
│   ├── nav-links.tsx               # Desktop nav menu items
│   └── mobile-menu.tsx             # Hamburger menu (mobile)
│
├── ui/                             # shadcn/ui + custom primitives
│   ├── avatar.tsx                  # User profile picture
│   ├── badge.tsx                   # Status / tag display
│   ├── button.tsx                  # Reusable button component
│   ├── card.tsx                    # Card container
│   ├── input.tsx                   # Text input field
│   ├── label.tsx                   # Form label
│   ├── separator.tsx               # Visual divider
│   ├── dropdown-menu.tsx           # Dropdown selector
│   ├── sheet.tsx                   # Sidebar / drawer
│   ├── skeleton.tsx                # Loading placeholder
│   ├── page-transition.tsx         # Framer Motion page fade
│   ├── page-transition.tsx         # Fade in/out animation wrapper
│   ├── hero-gallery-client.tsx     # Featured products slider
│   ├── interactive-hero-gallery.tsx # Enhanced carousel
│   ├── order-status-badge.tsx      # Status color coding
│   ├── logo.tsx                    # Dressfield logo
│   ├── confetti.tsx                # Success celebration animation
│   └── cursor-trail.tsx            # (Removed per stabilization)
│
├── catalog/                        # Product browsing & listing
│   ├── product-grid.tsx            # Grid layout of product cards
│   ├── product-card.tsx            # Single product card (image, price, name)
│   ├── product-detail.tsx          # Full detail page (description, variants)
│   ├── variant-selector.tsx        # Dropdown for size/color variants
│   └── filters/
│       ├── price-filter.tsx        # Price range slider
│       └── category-filter.tsx     # Category/tag selector
│
├── custom-order/                   # Design builder for custom orders
│   ├── design-canvas.tsx           # Fabric.js canvas + drawing tools
│   │                                # • Upload/drag design image
│   │                                # • Adjust size, rotation, opacity
│   │                                # • Preview on product mockup
│   ├── design-toolbar.tsx          # Tool palette
│   │                                # • Select, zoom, delete, undo/redo
│   │                                # • Layer management
│   ├── background-remover.tsx      # @imgly/background-removal integration
│   │                                # • Upload image
│   │                                # • Remove background
│   │                                # • Preview result
│   ├── design-uploader.tsx         # Drag-drop file input
│   │                                # • Accept PNG, JPG, SVG
│   │                                # • Validate file size
│   ├── order-form.tsx              # Order submission form
│   │                                # • Contact info
│   │                                • Thread color selector
│   │                                • Placement options
│   │                                • Price calculation
│   └── order-summary.tsx           # Review + confirm order
│
├── auth/                           # Authentication forms & flows
│   ├── login-form.tsx              # Email + password form
│   │                                # • Submit to /api/auth/login
│   │                                # • Save JWT + reload cart
│   ├── register-form.tsx           # Email, password, name form
│   │                                # • Submit to /api/auth/register
│   │                                # • Auto-login on success
│   ├── password-reset-form.tsx     # Request + confirm password reset
│   ├── protected-route-wrapper.tsx # Check auth, redirect to login if needed
│   └── auth-provider.tsx           # (Wrapped in Providers)
│
├── admin/                          # Admin dashboard components
│   ├── admin-sidebar.tsx           # Nav menu for admin routes
│   ├── product-editor.tsx          # Form: create/edit products
│   │                                # • Name, description, price
│   │                                # • Image uploader (multiple)
│   │                                # • Variant grid (size, color, price delta)
│   ├── products-manager.tsx        # Table: list + filter products
│   │                                # • Search, pagination
│   │                                # • Bulk actions (delete, toggle active)
│   ├── orders-manager.tsx          # Table: list orders
│   │                                # • Filter by status
│   │                                # • Click to detail
│   ├── order-detail.tsx            # Full order view + status update
│   │                                # • Shipping info + items
│   │                                # • Admin notes textarea
│   │                                • Status dropdown + save
│   ├── custom-orders-manager.tsx   # Table: list custom orders
│   │                                # • Filter by status (0-6)
│   │                                # • Show customer contact
│   └── custom-order-detail.tsx     # View + approve/reject custom order
│                                    # • Show all design images
│                                    • Admin notes + status update
│
└── analytics/
    └── meta-pixel.tsx              # Facebook Pixel event tracker
                                    # • Track pageviews, purchases, etc.
```

#### Libraries: `src/lib/` (Utilities, Hooks, API Clients)

```
src/lib/
│
├── api.ts                          # Axios instance + interceptors
│                                    # • Base URL from NEXT_PUBLIC_API_URL
│                                    # • JWT bearer token in headers
│                                    # • 401 handler: refresh token logic
│
├── auth.tsx                        # Authentication utilities
│                                    # • useAuth() hook
│                                    # • setAccessToken() / getAccessToken()
│                                    # • Login/logout/register mutations
│
├── catalog.ts                      # Product API calls
│                                    # • getProducts() - list
│                                    • getProductBySlug(slug) - detail
│                                    • searchProducts(query)
│
├── custom-orders.ts                # Custom order API calls
│                                    # • createCustomOrder(payload)
│                                    • getCustomOrders() - user's orders
│                                    • getCustomOrder(id) - detail
│
├── orders.ts                       # Order API calls
│                                    # • createOrder(items, shipping)
│                                    • getOrders() - list
│                                    • getOrder(id) - detail
│
├── cart-api.ts                     # Cart synchronization
│                                    # • syncServerCart(items)
│                                    • getServerCart()
│
├── cart-merge.ts                   # Guest → auth cart merge
│                                    # • mergeGuestCart(serverCart)
│                                    # • Used on login to combine carts
│
├── upload.ts                       # File upload API
│                                    # • uploadDesignImage(file)
│                                    # • removeBackground(file)
│
├── admin-dashboard.ts              # Admin stats API
│                                    # • getDashboardStats()
│
├── analytics.ts                    # Meta Pixel tracking
│                                    # • trackPurchase(event)
│                                    • trackAddToCart(event)
│
├── utils.ts                        # General utilities
│                                    # • cn() - Tailwind class merger
│
└── __tests__/                      # Unit tests for lib functions
    └── [test files].test.ts
```

#### Stores: `src/stores/` (State Management - Zustand)

```
src/stores/
│
├── cart-store.ts                   # Cart state + persistence
│                                    # • useCartStore() hook
│                                    # • items: CartItem[]
│                                    # • addItem(item), removeItem(id)
│                                    # • totalPrice(), totalItems()
│                                    # • Persisted to localStorage
│                                    # • Auto-syncs to server (500ms debounce)
│
└── __tests__/
    └── cart-store.test.ts          # Unit tests for store
```

#### Types: `src/types/` (TypeScript Interfaces & Enums)

```
src/types/
│
├── catalog.ts                      # Product DTOs
│                                    # • ProductSummaryDto, ProductDetailDto
│                                    # • ProductVariantDto, ProductImageDto
│                                    # • ProductPayload (for creation)
│
├── order.ts                        # Order DTOs & enums
│                                    # • OrderStatus enum
│                                    # • OrderDetailDto, OrderItemDto
│                                    # • OrderStatusLabels, OrderStatusColors
│
├── custom-order.ts                 # Custom order DTOs
│                                    # • CustomOrderStatus enum
│                                    # • CustomOrderDetailDto
│                                    • CustomOrderDesignDto
│
├── auth.ts                         # Authentication types
│                                    # • AuthTokens interface
│                                    • UserInfo interface
│
├── cart.ts                         # Cart types
│                                    # • CartItem interface
│
├── admin-dashboard.ts              # Admin dashboard types
│                                    # • DashboardStatsDto
│
└── global.d.ts                     # Global type declarations
                                    # • Window type extensions
```

#### Tests: `src/test/`

```
src/test/
├── setup.ts                        # Vitest configuration
└── [feature].test.tsx              # Component/hook tests
```

### Public Assets: `public/`

```
public/
├── fonts/                          # Font files (referenced in globals.css)
├── cursor/                         # Custom cursor images
├── templates/                      # Design templates for custom orders
├── favicon.ico                     # Browser tab icon
└── [image files]                   # Hero images, backgrounds
```

### Build & Output

```
.next/                              # Next.js dev build cache (gitignored)
out/                                # Static export output (gitignored)
                                    # • Contains: index.html, *.js, *.css
                                    • Uploaded to Hostinger as-is
```

---

## Backend: Dressfield.backend

ASP.NET Core 8 project with layered architecture (4 projects).

### Project Structure

```
Dressfield.backend/
│
├── .sln                            # Visual Studio solution file
│
├── src/
│   ├── Dressfield.API/             # API Layer - Controllers, Middleware
│   ├── Dressfield.Application/     # Application Layer - Services, DTOs
│   ├── Dressfield.Core/            # Domain Layer - Entities, Interfaces
│   └── Dressfield.Infrastructure/  # Infrastructure Layer - Data, Services
│
└── [build outputs]                 # bin/, obj/ (gitignored)
```

### API Layer: `Dressfield.API/`

Entry point, HTTP handling, middleware, controllers.

```
Dressfield.API/
│
├── Program.cs                      # Startup configuration
│                                    # • Service registration
│                                    # • Middleware pipeline
│                                    • Database migrations + seeding
│
├── appsettings.json                # Default configuration
├── appsettings.Development.json    # Dev overrides
├── appsettings.Development.example.json # Template for local dev
│
├── Properties/
│   └── launchSettings.json         # IIS/Kestrel profiles
│
├── Controllers/                    # HTTP endpoints grouped by feature
│   ├── AuthController.cs           # POST /api/auth/register, /login, /refresh
│   ├── ProductsController.cs       # GET /api/products/{id}, POST, PUT, DELETE
│   ├── OrdersController.cs         # POST /api/orders/create, GET list/detail
│   ├── CustomOrdersController.cs   # POST create, GET list/detail, PUT status
│   ├── CartController.cs           # POST /api/cart/sync
│   ├── PaymentsController.cs       # GET /api/payments/callback (webhook)
│   ├── UploadsController.cs        # POST /api/uploads (file upload + scan)
│   └── AdminDashboardController.cs # GET /api/admin/dashboard
│
├── Middleware/
│   └── GlobalExceptionHandler.cs   # Catches all unhandled exceptions
│                                    # • Returns standardized error responses
│
├── Extensions/
│   └── [configuration helpers]
│
├── Startup/
│   └── AdminSeeder.cs              # Initial admin user creation
│
├── wwwroot/                        # Static files served by API
│   └── [public files]
│
└── logs/
    └── dressfield-YYYY-MM-DD.log   # Rotating daily logs
```

### Application Layer: `Dressfield.Application/`

Business logic, service interfaces, DTOs, validators.

```
Dressfield.Application/
│
├── Interfaces/                     # Service contracts
│   ├── IAuthService.cs
│   ├── IProductService.cs
│   ├── IOrderService.cs
│   ├── ICustomOrderService.cs
│   ├── ICartService.cs
│   ├── IEmailService.cs
│   ├── IStorageService.cs
│   ├── IPaymentService.cs
│   ├── IFileSecurityScanner.cs
│   └── IAdminDashboardService.cs
│
├── DTOs/                           # Data Transfer Objects
│   ├── AuthDtos.cs                 # RegisterRequest, LoginRequest, LoginResponse
│   ├── CatalogDtos.cs              # ProductSummaryDto, ProductDetailDto
│   ├── OrderDtos.cs                # CreateOrderRequest, OrderDetailDto
│   ├── CustomOrderDtos.cs          # CreateCustomOrderRequest
│   ├── CartDtos.cs                 # CartSyncRequest
│   └── AdminDashboardDtos.cs       # DashboardStatsDto
│
└── Validators/                     # FluentValidation rules
    └── [DTO validators]
        • RegisterRequestValidator.cs
        • CreateOrderRequestValidator.cs
        • etc.
```

### Core Layer: `Dressfield.Core/`

Domain entities, enums, and business logic interfaces.

```
Dressfield.Core/
│
├── Entities/                       # Database entities (EF Core models)
│   ├── ApplicationUser.cs          # ASP.NET Identity user
│   ├── Product.cs                  # Catalog product
│   ├── ProductImage.cs             # Product photo
│   ├── ProductVariant.cs           # Size/color option
│   ├── Order.cs                    # Customer order
│   ├── OrderItem.cs                # Line item in order
│   ├── OrderStatusLog.cs           # Audit trail
│   ├── CustomOrder.cs              # Custom embroidery order
│   ├── CustomOrderDesign.cs        # Design specification
│   ├── Cart.cs                     # User shopping cart
│   ├── CartItem.cs                 # Item in cart
│   ├── RefreshToken.cs             # JWT refresh token
│   └── PendingEmail.cs             # Outbox email queue
│
├── Enums/                          # Status codes, constants
│   ├── OrderStatus.cs              # Pending, AwaitingPayment, Paid, etc.
│   ├── CustomOrderStatus.cs        # 0=Pending, 1=Review, 2=Approved, etc.
│   └── UserRole.cs                 # Admin, Customer
│
└── Interfaces/
    └── [Business logic contracts]
        • Shared interfaces used by Application layer
```

### Infrastructure Layer: `Dressfield.Infrastructure/`

Database, external services, implementations.

```
Dressfield.Infrastructure/
│
├── Data/
│   ├── DressfieldDbContext.cs      # EF Core DbContext
│                                    # • DbSet for each entity
│                                    # • Fluent Model Builder configuration
│                                    # • Constraints, indexes, relationships
│   └── Migrations/
│       ├── [migration files]
│       │   • [timestamp]_InitialCreate.cs
│       │   • [timestamp]_AddCart.cs
│       │   • [timestamp]_AddOrderStatusLog.cs
│       │   • etc.
│       └── DressfieldDbContextModelSnapshot.cs
│
├── Services/                       # Concrete service implementations
│   ├── AuthService.cs              # Register, Login, RefreshToken
│                                    # • Password hashing
│                                    • JWT generation
│
│   ├── ProductService.cs           # Product queries + management
│                                    # • GetProducts(), GetBySlug()
│                                    • Create, Update, Delete
│
│   ├── OrderService.cs             # Order creation + status management
│                                    # • CreateAsync() - validates cart items
│                                    # • UpdateStatusAsync() - with audit log
│                                    • Email notifications
│
│   ├── CustomOrderService.cs       # Custom order workflows
│                                    # • CreateAsync() - validate designs
│                                    • ApproveAsync(), RejectAsync()
│
│   ├── CartService.cs              # Cart synchronization
│                                    # • SyncAsync() - merge guest + auth
│
│   ├── BogIPayService.cs           # Payment gateway integration
│                                    # • InitiatePayment() - get redirect URL
│                                    • ProcessCallback() - webhook handler
│
│   ├── AzureBlobStorageService.cs  # Cloud storage
│                                    # • UploadAsync(file) - return URL
│                                    • DeleteAsync(fileId)
│
│   ├── LocalStorageService.cs      # Fallback file storage (dev only)
│                                    # • Write to wwwroot/
│
│   ├── ClamAvFileSecurityScanner.cs # Malware scanning
│                                    # • ScanAsync(file)
│                                    • Remote ClamAV socket
│
│   ├── NoOpFileSecurityScanner.cs  # Stub scanner (dev only)
│
│   ├── SmtpEmailService.cs         # Email delivery
│                                    # • SendAsync(to, subject, body)
│
│   ├── DevEmailService.cs          # Console email (dev only)
│                                    # • Logs to console instead of SMTP
│
│   ├── EmailOutboxWorker.cs        # Background worker
│                                    # • Polls PendingEmail table
│                                    # • Retries failed emails
│
│   └── AdminDashboardService.cs    # Dashboard stats
│                                    # • TotalOrders, Revenue, Pending, etc.
│
└── [build outputs]
    ├── bin/
    └── obj/
```

### Configuration Files

**Program.cs** - Main entry point (~400 lines)

Key sections:
- Logging: Serilog to console + daily rolling file
- Database: MySQL 8 with EF Core
- Identity: AspNetCore Identity + custom ApplicationUser
- JWT: Token validation, expiration, signing key
- CORS: Origins from config
- Rate Limiting: Per-endpoint limits (auth, orders, upload)
- Service Registration: Dependency injection container setup
- Middleware Pipeline: Order of execution
- Database Seeding: Roles + initial admin user

**appsettings.json** - Default configuration

```json
{
  "Jwt": {
    "Secret": "[overridden by environment variable]",
    "Issuer": "dressfield-api",
    "Audience": "dressfield-client"
  },
  "Cors": {
    "Origins": ["http://localhost:3000"]
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "[MySQL connection string]"
  }
}
```

**appsettings.Development.json** - Local overrides

```json
{
  "Admin": {
    "Email": "admin@dressfield.ge",
    "Password": "Admin123!@#"
  },
  "AzureStorage": {
    "ConnectionString": "" // Use LocalStorageService
  },
  "Security": {
    "ClamAv": {
      "Enabled": false // Use NoOpFileSecurityScanner
    }
  },
  "BogIPay": {
    "ClientId": "" // Use MockPaymentService
  }
}
```

---

## File Naming Conventions

### Frontend

| Type | Pattern | Example |
|------|---------|---------|
| **Pages** (app routes) | `page.tsx` | `src/app/products/[slug]/page.tsx` |
| **Layouts** | `layout.tsx` | `src/app/layout.tsx`, `src/app/auth/layout.tsx` |
| **Components** | `kebab-case.tsx` | `product-card.tsx`, `order-status-badge.tsx` |
| **Hooks** | `useKebabCase.ts` | `useAuth.ts`, `useCart.ts` |
| **Types** | `kebab-case.ts` | `catalog.ts`, `custom-order.ts` |
| **Styles** | `globals.css` | Single stylesheet for Tailwind + global CSS |
| **Tests** | `[name].test.tsx` | `cart-store.test.ts` |

### Backend

| Type | Pattern | Example |
|------|---------|---------|
| **Controllers** | `[Domain]Controller.cs` | `ProductsController.cs`, `AuthController.cs` |
| **Services** | `[Domain]Service.cs` | `OrderService.cs`, `BogIPayService.cs` |
| **DTOs** | `[Domain]Dtos.cs` | `AuthDtos.cs`, `OrderDtos.cs` |
| **Entities** | `[Name].cs` | `Product.cs`, `OrderStatusLog.cs` |
| **Interfaces** | `I[Name].cs` | `IOrderService.cs`, `IEmailService.cs` |
| **Validators** | `[Name]Validator.cs` | `RegisterRequestValidator.cs` |
| **Migrations** | `[timestamp]_[Description].cs` | `20240331000000_InitialCreate.cs` |

---

## Key Entry Points

### Frontend

| Purpose | File |
|---------|------|
| **Start dev server** | `npm run dev` → Next.js on port 3000 |
| **Build static export** | `npm run build` → outputs `out/` directory |
| **Global styles** | `src/app/globals.css` |
| **Root component** | `src/app/layout.tsx` |
| **API client config** | `src/lib/api.ts` |
| **Cart persistence** | `src/stores/cart-store.ts` |
| **Auth logic** | `src/lib/auth.tsx` |

### Backend

| Purpose | File |
|---------|------|
| **Application startup** | `Dressfield.API/Program.cs` |
| **Database context** | `Dressfield.Infrastructure/Data/DressfieldDbContext.cs` |
| **Service registration** | `Dressfield.API/Program.cs` (lines 147-154) |
| **API routes** | `Dressfield.API/Controllers/` (8 controllers) |
| **Error handling** | `Dressfield.API/Middleware/GlobalExceptionHandler.cs` |
| **JWT validation** | `Dressfield.API/Program.cs` (lines 71-101) |

---

## Shared Concepts

### Cart Synchronization

**Client-side** (`src/stores/cart-store.ts`):
- Local cart state in Zustand store
- Persisted to `localStorage` (key: `dressfield-cart`)
- Debounced sync to server (500ms) when user is authenticated

**Server-side** (`Dressfield.Infrastructure/Services/CartService.cs`):
- Cart entity per user (unique index on UserId)
- CartItems related to products and variants
- SyncAsync() method merges incoming items

**Flow on login**:
1. Guest adds items to local cart
2. User logs in
3. `setCartSyncSuppressed(true)` prevents duplicate syncs
4. CartService.SyncAsync() merges guest cart into user's server cart
5. Frontend reloads cart from server
6. `setCartSyncSuppressed(false)` resumes syncing

### Design Upload Flow

**Frontend** (`src/components/custom-order/background-remover.tsx`):
1. User drags/selects PNG, JPG, or SVG
2. File validated: size < 20MB, type allowed
3. POST to `/api/uploads` with FormData
4. @imgly/background-removal processes image
5. Upload to Azure Blob Storage
6. Returns presigned URL

**Backend** (`Dressfield.Infrastructure/Services/`):
1. UploadsController receives file
2. ClamAvFileSecurityScanner.ScanAsync() (or NoOp in dev)
3. StorageService.UploadAsync() (Azure or Local)
4. Returns temporary presigned URL
5. URL stored in CustomOrderDesign entity

### Order Lifecycle

**User creates order**:
1. POST `/api/orders/create` with items + shipping
2. OrderService.CreateAsync() calculates totals
3. Order created with Status = "Pending"
4. OrderItems created (product name/price locked)
5. Response includes `paymentRedirectUrl` or `null`

**Payment redirect** (if BOG enabled):
1. Frontend redirects to `paymentRedirectUrl`
2. User enters card details on Bank of Georgia site
3. BOG posts to `/api/payments/callback` webhook
4. PaymentsController.HandleCallback() updates Order.Status
5. OrderStatusLog entry created
6. Email notification sent via PendingEmail

**Order state transitions**:
- Pending (initial)
- AwaitingPayment (waiting for webhook)
- Paid (payment confirmed)
- Processing (admin confirms)
- Shipped (admin marks)
- Delivered (customer or admin confirms)
- Cancelled (admin or customer)
- Refunded (admin)

---

## Build & Deployment

### Frontend Build Process

```bash
npm install                    # Restore dependencies
npm run build                  # Next.js static export
# Generates: out/ directory with:
#   - out/index.html           # Home page
#   - out/products/[slug]/      # Product detail pages
#   - out/_next/                # JS/CSS bundles
#   - out/sitemap.xml          # XML sitemap (auto-generated)
#   - etc.

npm run serve:static           # Test locally: serve out/
```

Upload `out/` contents to Hostinger static files.

### Backend Build & Deploy

```bash
dotnet build                   # Compile all projects
dotnet publish -c Release      # Prepare for deployment
# Publishes to: bin/Release/net8.0/publish/

# Deploy to Azure App Service via git push
# or: az webapp deployment source config-zip
```

### Database Migrations

```csharp
// In Program.cs:
await db.Database.MigrateAsync();  // Runs pending migrations on startup

// Create new migration:
// dotnet ef migrations add [MigrationName] -p Dressfield.Infrastructure
```

---

## Dependency Graph

```
API Layer
  ↓ uses
Application Layer (Services, DTOs)
  ↓ uses
Core Layer (Entities, Enums, Interfaces)
  ↓ uses
Infrastructure Layer (EF Core, External Services)
  ↓ uses
Database (MySQL)
```

Each layer depends only on layers below. No upward dependencies.

---

## Notable Design Patterns

### Dependency Injection

ASP.NET Core built-in container (no external DI framework needed):

```csharp
// In Program.cs:
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IStorageService, AzureBlobStorageService>();

// In controller:
public class OrdersController(IOrderService orders) {}
```

### Repository Pattern

Not explicitly implemented. EF Core DbContext serves as repository:

```csharp
// In OrderService:
var order = await _db.Orders.FindAsync(id);
```

### Specification Pattern

Not used. Simple LINQ queries in services.

### Factory Pattern

Storage and Scanner services use factories in Program.cs:

```csharp
// Choose based on config:
if (azureConnectionString == null)
    builder.Services.AddScoped<IStorageService, LocalStorageService>();
else
    builder.Services.AddScoped<IStorageService, AzureBlobStorageService>();
```

### Builder Pattern

Used in Tailwind CSS and configuration builders.

---

## Testing

### Frontend Tests

Unit tests with Vitest + React Testing Library:

```bash
npm test                       # Run all tests
npm run test:watch            # Watch mode
```

Test files: `src/**/__tests__/*.test.tsx`

### Backend Tests

No tests implemented yet. Future: xUnit or NUnit.

---

## Documentation

| Document | Purpose |
|----------|---------|
| `.planning/PROJECT.md` | Project charter & vision |
| `.planning/REQUIREMENTS.md` | User stories + acceptance criteria |
| `.planning/ROADMAP.md` | 7-phase implementation plan |
| `.planning/STATE.md` | Current phase & blockers |
| `.planning/codebase/STACK.md` | Technology stack summary |
| `.planning/codebase/ARCHITECTURE.md` | Design patterns & data flow |
| `.planning/codebase/STRUCTURE.md` | Directory structure (this file) |
| `Dressfield.docs/` | API docs, database schema diagrams |
| `Dressfield.BussinesStrategy/` | Marketing, pricing, business model |

---

## Environment Variables

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SITE_URL=https://dressfield.ge
```

### Backend (appsettings.json + Azure App Service settings)

```
Jwt__Secret=[256-bit hex string]
Jwt__Issuer=dressfield-api
Jwt__Audience=dressfield-client
Cors__Origins__0=https://dressfield.ge
Cors__Origins__1=https://www.dressfield.ge
ConnectionStrings__DefaultConnection=Server=...;Database=dressfield;Uid=...;Pwd=...
AzureStorage__ConnectionString=DefaultEndpointsProtocol=https;...
Security__ClamAv__Enabled=true
Security__ClamAv__Host=clamav-service:3310
BogIPay__ClientId=...
BogIPay__ClientSecret=...
Admin__Email=admin@dressfield.ge
Admin__Password=[strong password]
Admin__ResetExistingPassword=false
```

---

## Git Workflow

- **Main branch**: Production-ready code
- **Feature branches**: Created per phase/task
- **Worktrees**: `.claude/worktrees/[branch-name]/` for parallel work
- **Commits**: Atomic, descriptive messages ("fix:", "feat:", "docs:")
- **PRs**: Reviewed before merge to main
