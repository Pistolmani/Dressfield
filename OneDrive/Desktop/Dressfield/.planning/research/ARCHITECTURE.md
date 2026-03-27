# Architecture Research: Embroidery E-Commerce

**Researched:** 2026-03-27
**Domain:** E-commerce with custom design orders

## 1. Component Boundaries

```
┌─────────────────────────────────────────────────┐
│                  FRONTEND (Hostinger)            │
│  Next.js Static Export                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Shop     │ │ Custom   │ │ Admin            │ │
│  │ Pages    │ │ Design   │ │ Dashboard        │ │
│  │ (SSG)    │ │ Flow     │ │ (Client-side)    │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────────────┘ │
│       │             │            │               │
│  ┌────┴─────────────┴────────────┴─────────────┐ │
│  │ Shared: Auth Context, Cart Store, API Client│ │
│  └─────────────────────┬───────────────────────┘ │
└────────────────────────┼─────────────────────────┘
                         │ HTTPS API Calls
┌────────────────────────┼─────────────────────────┐
│                  BACKEND (Azure)                 │
│  ASP.NET Core Web API                            │
│  ┌─────────────────────┴───────────────────────┐ │
│  │ API Layer: Controllers, Middleware, Filters │ │
│  └─────────────────────┬───────────────────────┘ │
│  ┌─────────────────────┴───────────────────────┐ │
│  │ Application: Services, Validators           │ │
│  └─────────────────────┬───────────────────────┘ │
│  ┌─────────────────────┴───────────────────────┐ │
│  │ Infrastructure: EF Core, iPay, Blob, SMTP   │ │
│  └─────────┬──────────┬──────────┬─────────────┘ │
└────────────┼──────────┼──────────┼───────────────┘
             │          │          │
     ┌───────┴───┐ ┌────┴────┐ ┌──┴──────────┐
     │ MySQL     │ │ Azure   │ │ BOG iPay    │
     │ Hostinger │ │ Blob    │ │ Gateway     │
     └───────────┘ └─────────┘ └─────────────┘
```

## 2. Data Flow

### Browse → Purchase Flow

```
1. BROWSE
   Browser loads static HTML from Hostinger
   → Client JS calls GET /api/products (with filters/pagination)
   → API queries MySQL, returns product DTOs
   → Frontend renders product grid

2. VIEW PRODUCT
   Browser navigates to /products/[slug] (static HTML, pre-rendered)
   → Client JS hydrates with fresh data if needed
   → Analytics: ViewContent event fires

3. ADD TO CART
   User clicks "Add to Cart"
   → Zustand store updates (localStorage for guests)
   → If authenticated: POST /api/cart to sync with server
   → Analytics: AddToCart event fires

4. CHECKOUT
   User navigates to /checkout
   → Frontend collects shipping address
   → POST /api/orders creates order (status: PendingPayment)
   → Analytics: InitiateCheckout event fires

5. PAYMENT
   POST /api/payments/create with orderId
   → Backend calls iPay API to create payment
   → Returns redirect URL
   → Frontend redirects to BOG payment form

6. PAYMENT COMPLETE
   User completes payment on BOG site
   → BOG redirects to /payment/success or /payment/failure
   → BOG sends webhook POST to /api/payments/callback (async, may arrive before redirect)
   → Backend verifies, updates order + payment status
   → Analytics: Purchase event fires on success page

7. ORDER TRACKING
   User views /orders/[id]
   → GET /api/orders/{id} returns order detail with payment status
```

### Custom Design Flow

```
1. SELECT PRODUCT
   User navigates to custom order page
   → Selects base product for embroidery

2. UPLOAD DESIGN
   User drops/selects image file
   → Client-side validation (type, size, dimensions)
   → Image loaded into Konva canvas editor

3. EDIT DESIGN
   User crops, rotates, resizes on canvas
   → All processing is client-side (no server round-trips)
   → Editor constraints: min/max dimensions, aspect ratio

4. CHOOSE OPTIONS
   User selects size, placement, material, thread colors
   → Each option has a price add-on
   → Total price updates in real-time: base + sum(add-ons)

5. PREVIEW MOCKUP
   Konva renders design overlaid on product image
   → Design positioned based on placement selection
   → User sees realistic preview before ordering

6. SUBMIT ORDER
   POST /api/custom-designs with:
   → Uploaded design image (multipart form data → Azure Blob)
   → Selected options and calculated price
   → Status: Pending (awaiting admin review)

7. ADMIN REVIEW
   Admin views custom design submissions
   → Sees uploaded design + options + price
   → Approves → customer can proceed to payment
   → Rejects → customer notified with reason
   → Requests changes → customer can edit and resubmit
```

## 3. Static Export Implications

### What Works
- SSG pages (products, categories, homepage) — full HTML at build time
- Client-side routing — React Router handles navigation after initial load
- API calls to ASP.NET backend — standard fetch/axios
- Zustand state — purely client-side, works anywhere
- Meta tags and JSON-LD — generated at build time per page

### What Doesn't Work (and Workarounds)

| Feature | Not Available | Workaround |
|---------|--------------|------------|
| SSR | No server rendering | SSG at build time provides same SEO benefit |
| ISR | No incremental regeneration | Manual rebuild + redeploy on content changes |
| API Routes | No `/api/*` in Next.js | All API calls go directly to ASP.NET backend |
| `next/image` | No server-side optimization | Use `<img>` with pre-optimized images from Blob Storage |
| Middleware | No server-side middleware | Auth checks are client-side (redirect in useAuth hook) |
| Server Components | No RSC | All components are client components |
| Cookies | No server-side cookie handling | JWT in memory + refresh token in httpOnly cookie set by API |

### Auth Without Middleware

```typescript
// lib/auth.tsx — Client-side auth guard
function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to refresh token on mount
    refreshToken().then(setUser).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  return { user, loading, isAdmin: user?.role === 'Admin' };
}

// Admin pages check auth client-side
function AdminLayout({ children }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <Spinner />;
  if (!isAdmin) redirect('/auth/login');
  return <>{children}</>;
}
```

### Stale Data Strategy

Since static export means pages are pre-rendered at build time:

1. **Product pages**: Pre-rendered with latest data at build time. For <50 products, rebuilds take <30 seconds.
2. **Dynamic data** (cart, orders, auth): Always fetched from API — never stale.
3. **Rebuild trigger**: Admin adds/edits product → trigger rebuild (manual or via CI webhook).
4. **Hybrid approach**: Static HTML for SEO + client-side data fetching for real-time accuracy. Product detail page loads static HTML (SEO), then hydrates with fresh API data.

## 4. Custom Design Flow Architecture

### Client-Side Processing

```
User selects file
  → react-dropzone validates type/size
  → FileReader loads image as data URL
  → Konva.Image creates canvas element
  → User manipulates on canvas (crop/rotate/resize)
  → On submit: canvas.toDataURL() exports edited image
  → Upload to API as base64 or multipart form data
```

### Image Size Limits
- Max upload: 10MB (validated client-side and server-side)
- Max dimensions: 4000x4000px (prevent browser memory issues)
- Accepted formats: JPG, PNG
- Server-side processing: ImageSharp resizes to max 2000x2000, converts to optimized JPG

### Canvas Preview Architecture
```
Konva Stage
├── Layer: Product Image (background)
│   └── Image: Selected product photo
├── Layer: Design Overlay
│   └── Image: Customer's uploaded design
│   └── Transformer: Handles resize/rotate handles
├── Layer: Placement Guide
│   └── Rect: Shows valid placement area (dashed border)
```

## 5. Payment Flow Architecture

### Key Design Decisions

1. **Never store card data** — iPay handles all card processing. Backend never sees card numbers.
2. **Idempotent webhook handler** — Use `IPayPaymentId` as idempotency key. Check if payment already processed before updating.
3. **Race condition handling** — Webhook may arrive before redirect. Frontend polls payment status if webhook hasn't arrived yet.
4. **Transaction boundary** — Order status + Payment status updated in a single database transaction.

### Webhook Endpoint Design

```csharp
[HttpPost("callback")]
[AllowAnonymous] // iPay calls this, not authenticated users
public async Task<IActionResult> Callback([FromForm] IPayCallbackDto dto)
{
    // 1. Find payment by iPay payment ID
    var payment = await _db.Payments.FirstOrDefaultAsync(p => p.IPayPaymentId == dto.PaymentId);
    if (payment == null) return Ok(); // Unknown payment, acknowledge anyway

    // 2. Check idempotency — already processed?
    if (payment.Status == MapStatus(dto.Status)) return Ok(); // Already processed

    // 3. Update in transaction
    using var transaction = await _db.Database.BeginTransactionAsync();
    payment.Status = MapStatus(dto.Status);
    payment.PaymentHash = dto.PaymentHash;
    payment.CardType = dto.CardType;

    var order = await _db.Orders.FindAsync(payment.OrderId);
    order.Status = dto.Status == "success" ? OrderStatus.Processing : OrderStatus.Cancelled;

    await _db.SaveChangesAsync();
    await transaction.CommitAsync();

    // 4. Send confirmation email (async, don't block webhook response)
    if (dto.Status == "success")
        _ = _emailService.SendOrderConfirmationAsync(order.Id);

    return Ok(); // Must return 200 or iPay retries
}
```

## 6. Build Order (Dependencies)

```
Phase 1: Foundation
├── ASP.NET Core project + EF Core + MySQL schema
├── Next.js project + Tailwind + shadcn/ui
├── Authentication (Identity + JWT)
└── Layout shell + deployment

Phase 2: Product Catalog (depends on Phase 1)
├── Database: Categories, Products, ProductImages, ProductVariants
├── API: CRUD endpoints
├── Admin: Product management pages
├── Public: Listing + detail pages (SSG)
└── SEO: Structured data, sitemap

Phase 3: Custom Design (depends on Phase 2)
├── Database: CustomDesigns, CustomDesignOptions
├── Frontend: Upload + editor + mockup (Konva)
├── API: Custom design submission + admin review
└── Pricing engine

Phase 4: Cart & Checkout (depends on Phase 2, 3)
├── Frontend: Cart store (Zustand), cart UI
├── API: Cart sync, order creation
└── Checkout flow

Phase 5: Payments (depends on Phase 4)
├── iPay integration (NuGet client)
├── Webhook endpoint
├── Order status management
└── Email notifications

Phase 6-7: Analytics, Security, Launch
├── Meta Pixel events
├── Security hardening
└── Production deployment
```

## 7. API Design Patterns

### RESTful Conventions
- `GET /api/products` — list with pagination (`?page=1&pageSize=20`)
- `GET /api/products/{slug}` — single resource by slug (SEO-friendly)
- `POST /api/admin/products` — create (admin prefix for admin-only endpoints)
- `PUT /api/admin/products/{id}` — update
- `DELETE /api/admin/products/{id}` — delete

### Pagination Headers
```
X-Total-Count: 47
X-Page: 1
X-Page-Size: 20
X-Total-Pages: 3
```

### Error Handling
```json
// 400 Bad Request
{ "error": "Validation failed", "details": [{ "field": "price", "message": "Price must be positive" }], "success": false }

// 401 Unauthorized
{ "error": "Authentication required", "success": false }

// 404 Not Found
{ "error": "Product not found", "success": false }

// 500 Internal Server Error (production)
{ "error": "An unexpected error occurred", "success": false }
// (stack trace logged via Serilog, never exposed to client)
```

## 8. Image Pipeline

```
Upload Flow:
  Admin/Customer uploads image
    → Client: validate type (JPG/PNG), size (<10MB)
    → Server: validate again (never trust client)
    → ImageSharp: resize to max 2000x2000, optimize quality (80%)
    → Generate thumbnail (400x400)
    → Upload both to Azure Blob Storage
    → Store URLs in database (ProductImages or CustomDesigns table)

Serving Flow:
  Frontend <img> tag → Azure Blob Storage URL
    → CDN caching (Azure CDN or Blob Storage built-in caching headers)
    → Cache-Control: public, max-age=31536000 (1 year, URL changes on new upload)

Static Export Consideration:
  No next/image → use standard <img> tags
  → Pre-optimize images at upload time (not at serve time)
  → Use width/height attributes to prevent layout shift
  → Use loading="lazy" for below-fold images
  → Use srcset for responsive images if needed
```

---
*Research completed: 2026-03-27*
