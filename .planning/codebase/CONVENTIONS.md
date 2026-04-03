# Dressfield Coding Conventions & Standards

This document outlines the coding patterns, naming conventions, style guidelines, and best practices across the Dressfield codebase (frontend and backend).

## Table of Contents

1. [TypeScript/React Frontend Conventions](#typescriptreact-frontend-conventions)
2. [C# Backend Conventions](#c-backend-conventions)
3. [Git Commit Conventions](#git-commit-conventions)
4. [File & Directory Naming](#file--directory-naming)
5. [Code Style & Formatting](#code-style--formatting)
6. [Documentation Standards](#documentation-standards)

---

## TypeScript/React Frontend Conventions

### Project Structure

```
Dressfield.web/
├── src/
│   ├── app/              # Next.js 16 app router pages (server/client components)
│   ├── components/       # Reusable React components (organized by feature)
│   ├── config/           # Configuration constants and settings
│   ├── lib/              # Utilities, API clients, helpers
│   ├── stores/           # Zustand state management stores
│   ├── types/            # TypeScript interfaces and types
│   └── test/             # Test setup and utilities
├── public/               # Static assets
├── vitest.config.ts      # Vitest configuration
└── tsconfig.json         # TypeScript configuration
```

### Component Naming

- **File naming:** Use **kebab-case** with `.tsx` extension
  ```
  ✓ components/admin/products-manager.tsx
  ✓ components/cart/cart-drawer.tsx
  ✗ components/admin/ProductsManager.tsx  // Use kebab-case
  ✗ components/CartDrawer.tsx             // Wrong convention
  ```

- **Component export:** Match file name, use **PascalCase** for the component function
  ```typescript
  // products-manager.tsx
  export function ProductsManager() {
    // ...
  }
  ```

- **Feature-based folders:** Group components by feature/domain
  ```
  components/
  ├── admin/           # Admin-specific components
  ├── auth/            # Authentication components
  ├── cart/            # Cart-related components
  ├── custom-order/    # Custom order flow
  └── ui/              # shadcn/ui components
  ```

### Hook and Store Naming

- **Custom hooks:** Prefix with `use`, follow **camelCase**
  ```typescript
  // Correct: hooks/useAuth.ts
  export function useAuth() {
    // ...
  }

  // Correct: components/products-manager.tsx
  function useDebouncedValue<T>(value: T, delay = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    // ...
  }
  ```

- **Zustand stores:** Prefix with `use`, store in `stores/` directory
  ```typescript
  // stores/cart-store.ts
  export const useCartStore = create<CartState>()(
    persist((set, get) => ({
      items: [],
      addItem: (item) => set((state) => ({ ... })),
    }), { name: "cart" })
  );
  ```

### Variable & Function Naming

- **Variables:** **camelCase**
  ```typescript
  const accessToken = getAccessToken();
  const debouncedSearch = useDebouncedValue(search);
  let syncTimer: ReturnType<typeof setTimeout> | null = null;
  ```

- **Constants:** **UPPER_SNAKE_CASE** for true constants (rarely used in this codebase)
  ```typescript
  const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const MAX_UPLOAD_SIZE = 20_000_000; // 20 MB
  ```

- **Functions:** **camelCase**
  ```typescript
  function itemKey(productId: number, variantId?: number) {
    return `${productId}-${variantId ?? 0}`;
  }

  export function setAccessToken(token: string | null) {
    accessToken = token;
  }
  ```

- **Event handlers:** Prefix with `on`, use **camelCase**
  ```typescript
  onChange={(event) => setSearch(event.target.value)}
  onSuccess={() => { /* ... */ }}
  onError={() => toast.error("Error message")}
  ```

### TypeScript Best Practices

- **Explicit types:** Always define types for complex objects
  ```typescript
  // ✓ Explicit interface
  export interface CartItem {
    productId: number;
    variantId?: number;
    name: string;
    price: number;
    quantity: number;
  }

  // ✓ Type annotation
  const items: CartItem[] = [];

  // ✗ Implicit `any`
  const items = [];
  ```

- **Union types:** Use for variants
  ```typescript
  type QueryState = "idle" | "loading" | "success" | "error";
  ```

- **Strict null checking:** Always enabled (`strict: true` in tsconfig.json)
  ```typescript
  // ✓ Optional chaining and nullish coalescing
  const token = refreshToken?.accessToken ?? null;

  // ✓ Type guards
  if (error.response?.status === 401) {
    // ...
  }
  ```

### React Patterns

- **Client vs Server Components:** Use `"use client"` only when needed
  ```typescript
  // server-side by default (Next.js 16)
  export function SomeComponent() { /* ... */ }

  // client-side when using hooks, state, or client APIs
  "use client";
  export function InteractiveComponent() {
    const [state, setState] = useState();
    // ...
  }
  ```

- **Component composition:** Break large components into smaller ones
  ```typescript
  // Good: Separated concerns
  export function ProductsManager() {
    const [search, setSearch] = useState("");
    return (
      <div>
        <SearchBar value={search} onChange={setSearch} />
        <ProductTable search={search} />
      </div>
    );
  }
  ```

- **Props destructuring:** Use destructuring in function parameters
  ```typescript
  interface ProductCardProps {
    productId: number;
    name: string;
    price: number;
  }

  export function ProductCard({ productId, name, price }: ProductCardProps) {
    // ...
  }
  ```

### API & Data Fetching

- **API client:** Centralized Axios instance in `lib/api.ts`
  ```typescript
  import axios from "axios";

  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });

  // Use interceptors for auth, error handling, etc.
  api.interceptors.request.use((config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });
  ```

- **TanStack Query:** Use for server state
  ```typescript
  const productsQuery = useQuery({
    queryKey: ["admin-products", debouncedSearch],
    queryFn: () => getAdminProducts({ search: debouncedSearch || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Message");
    },
    onError: () => toast.error("Error"),
  });
  ```

- **API utility functions:** Export typed functions from `lib/` modules
  ```typescript
  // lib/catalog.ts
  export async function getAdminProducts(
    params?: { search?: string }
  ): Promise<ProductResponse[]> {
    const { data } = await api.get("/api/products/admin", { params });
    return data;
  }

  export async function deleteProduct(id: number): Promise<void> {
    await api.delete(`/api/products/${id}`);
  }
  ```

### Styling Conventions

- **Tailwind CSS:** Utility-first approach
  ```typescript
  // ✓ Use Tailwind utilities
  <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
    <h1 className="font-ui text-5xl font-semibold tracking-[0.04em]">Title</h1>
  </div>

  // ✗ Avoid inline styles
  <div style={{ maxWidth: "80rem", margin: "0 auto" }}>
  ```

- **Component imports:** Use shadcn/ui components
  ```typescript
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Pencil, Plus, Trash2 } from "lucide-react";

  <Button className="bg-accent text-white hover:bg-accent-hover">
    <Plus className="h-4 w-4" />
    Action
  </Button>
  ```

- **CSS classes:** Use `clsx` or `className` prop for conditional styles
  ```typescript
  import clsx from "clsx";

  <div className={clsx("p-4", isActive && "bg-blue-500")}>
    Content
  </div>
  ```

### Comment Style

- **JSDoc for exported functions:**
  ```typescript
  /**
   * Syncs cart with server and returns updated cart state
   * @param userId - User ID to sync for
   * @returns Updated cart with server data
   */
  export async function syncServerCart(userId: string): Promise<CartResponse> {
    // ...
  }
  ```

- **Inline comments for complex logic:**
  ```typescript
  // Never retry the refresh endpoint itself — that would cause an infinite loop
  const isRefreshRequest = originalRequest?.url?.includes("/api/auth/refresh");

  if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest) {
    // Attempt token refresh...
  }
  ```

- **TODO comments with context:**
  ```typescript
  // TODO: Implement pagination for large product lists (Phase 4)
  // TODO: Add product image caching strategy
  ```

---

## C# Backend Conventions

### Project Structure

```
Dressfield.backend/
├── src/
│   ├── Dressfield.API/          # API layer (Controllers, Middleware, Extensions)
│   ├── Dressfield.Application/  # Application layer (Services, DTOs, Validators)
│   ├── Dressfield.Core/         # Domain layer (Entities, Interfaces)
│   └── Dressfield.Infrastructure/ # Infrastructure (DB Context, Implementations)
└── tests/
    └── Dressfield.Tests/        # Unit & integration tests (xUnit, FluentAssertions)
```

### Class & Namespace Naming

- **Namespaces:** PascalCase, organized by layer
  ```csharp
  namespace Dressfield.API.Controllers;           // API layer
  namespace Dressfield.Application.DTOs;          // DTO definitions
  namespace Dressfield.Application.Interfaces;    // Service interfaces
  namespace Dressfield.Application.Validators;    // FluentValidation validators
  namespace Dressfield.Core.Entities;             // Domain entities
  namespace Dressfield.Infrastructure.Data;       // Database context
  namespace Dressfield.Infrastructure.Services;   // Service implementations
  namespace Dressfield.Tests.Services;            // Tests
  ```

- **Class naming:** **PascalCase**, descriptive names
  ```csharp
  public class AuthController : ControllerBase { }
  public class CartService : ICartService { }
  public class AuthResponse { }
  public record UserDto(string Id, string Email, string FirstName, string LastName);
  public class RegisterRequestValidator : AbstractValidator<RegisterRequest> { }
  ```

### Method & Property Naming

- **Public methods:** **PascalCase**
  ```csharp
  public async Task<IActionResult> Register([FromBody] RegisterRequest request)
  public async Task<CartResponse> GetCartAsync(string userId)
  public void SetRefreshTokenCookie(string token)
  ```

- **Properties:** **PascalCase** (follow C# conventions)
  ```csharp
  public string Email { get; set; }
  public int Id { get; init; }
  public ICollection<CartItem> Items { get; set; }
  ```

- **Private fields:** **_camelCase**
  ```csharp
  private readonly IAuthService _authService;
  private readonly IConfiguration _config;
  private readonly DressfileDbContext _db;
  ```

- **Local variables:** **camelCase**
  ```csharp
  var refreshToken = Request.Cookies["refreshToken"];
  var response = await _authService.LoginAsync(request);
  var user = await _userManager.FindByEmailAsync(email);
  ```

### DTOs (Data Transfer Objects)

- **Use C# records for immutability:**
  ```csharp
  // Application/DTOs/AuthDtos.cs
  namespace Dressfield.Application.DTOs;

  public record RegisterRequest(
      string FirstName,
      string LastName,
      string Email,
      string Password,
      string ConfirmPassword,
      string? Phone);

  public record LoginRequest(string Email, string Password);

  public record AuthResponse(string AccessToken, UserDto User)
  {
      public string? RefreshToken { get; init; }
  }

  public record UserDto(string Id, string Email, string FirstName, string LastName, string Role);
  ```

- **Request/Response suffixes:**
  ```csharp
  public record CreateOrderRequest(/* ... */);
  public record CreateOrderResponse(int OrderId, string Status);
  public record UpdateProductRequest(/* ... */);
  ```

- **Location:** Always in `Dressfield.Application/DTOs/` directory

### Controllers

- **Location:** `Dressfield.API/Controllers/`
- **Base attributes:** Use `[ApiController]` and `[Route("api/[controller]")]`
  ```csharp
  [ApiController]
  [Route("api/[controller]")]
  public class CartController : ControllerBase
  {
      private readonly ICartService _cartService;

      public CartController(ICartService cartService)
      {
          _cartService = cartService;
      }

      [HttpPost("sync")]
      [EnableRateLimiting("orders")]
      public async Task<IActionResult> SyncCart([FromBody] SyncCartRequest request)
      {
          var result = await _cartService.SyncCartAsync(request);
          return Ok(result);
      }
  }
  ```

- **HTTP method attributes:** Be explicit
  ```csharp
  [HttpGet]
  [HttpPost]
  [HttpPut("{id}")]
  [HttpDelete("{id}")]
  ```

- **Authorization decorators:**
  ```csharp
  [Authorize]                    // Requires auth
  [AllowAnonymous]               // Skips auth
  [Authorize(Roles = "Admin")]   // Role-based
  ```

- **Rate limiting:**
  ```csharp
  [EnableRateLimiting("auth")]    // 10 requests/min
  [EnableRateLimiting("orders")]  // 20 requests/min
  [EnableRateLimiting("uploads")] // 12 requests/min
  ```

### Services & Interfaces

- **Interface location:** `Dressfield.Application/Interfaces/`
- **Implementation location:** `Dressfield.Infrastructure/Services/`
- **Naming convention:** Prefix implementations with service name
  ```csharp
  // Interfaces
  public interface IAuthService
  {
      Task<AuthResponse> RegisterAsync(RegisterRequest request);
      Task<AuthResponse> LoginAsync(LoginRequest request);
      Task LogoutAsync(string userId);
  }

  // Implementation
  public class AuthService : IAuthService
  {
      private readonly IUserRepository _userRepository;
      private readonly ITokenService _tokenService;

      public AuthService(IUserRepository userRepository, ITokenService tokenService)
      {
          _userRepository = userRepository;
          _tokenService = tokenService;
      }

      public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
      {
          // Implementation
      }
  }
  ```

### FluentValidation

- **Location:** `Dressfield.Application/Validators/`
- **Naming:** Suffix with `Validator`
  ```csharp
  public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
  {
      public RegisterRequestValidator()
      {
          RuleFor(x => x.FirstName)
              .NotEmpty().WithMessage("First name is required")
              .MaximumLength(100);

          RuleFor(x => x.Email)
              .NotEmpty().WithMessage("Email is required")
              .EmailAddress().WithMessage("Email must be valid");

          RuleFor(x => x.Password)
              .NotEmpty()
              .MinimumLength(8)
              .Matches(@"[A-Z]").WithMessage("Must contain uppercase")
              .Matches(@"[0-9]").WithMessage("Must contain digit");

          RuleFor(x => x.ConfirmPassword)
              .Equal(x => x.Password).WithMessage("Passwords must match");
      }
  }
  ```

### Entity Modeling

- **Location:** `Dressfield.Core/Entities/`
- **Primary keys:** Always named `Id`
  ```csharp
  public class Product
  {
      public int Id { get; set; }
      public string Name { get; set; } = string.Empty;
      public string Slug { get; set; } = string.Empty;
      public string Description { get; set; } = string.Empty;
      public decimal BasePrice { get; set; }
      public bool IsActive { get; set; }
      public ICollection<ProductImage> Images { get; set; } = [];
      public ICollection<ProductVariant> Variants { get; set; } = [];
  }

  public class Cart
  {
      public int Id { get; set; }
      public string UserId { get; set; } = string.Empty;
      public ICollection<CartItem> Items { get; set; } = [];
  }
  ```

- **Navigation properties:** Use PascalCase, meaningful names
  ```csharp
  public int OrderId { get; set; }
  public Order Order { get; set; } = null!;

  public int ProductId { get; set; }
  public Product Product { get; set; } = null!;
  ```

### Code Style

- **Use C# conventions:**
  ```csharp
  // ✓ Use implicit typing when clear
  var user = await _userManager.FindByIdAsync(userId);

  // ✓ Use string interpolation
  var url = $"{baseUrl}/auth/reset-password?token={token}";

  // ✓ Null-coalescing operator
  var token = Request.Cookies["refreshToken"] ?? string.Empty;

  // ✓ Null-conditional operator
  var email = user?.Email ?? "unknown@example.com";

  // ✗ Avoid old string concatenation
  var url = baseUrl + "/auth/reset-password?token=" + token;
  ```

- **Async/await patterns:**
  ```csharp
  // ✓ Always use async/await
  public async Task<IActionResult> GetCart()
  {
      var cart = await _cartService.GetCartAsync(userId);
      return Ok(cart);
  }

  // ✓ Suffix async methods with "Async"
  public async Task<CartResponse> GetCartAsync(string userId)
  {
      return await _db.Carts
          .Where(c => c.UserId == userId)
          .FirstOrDefaultAsync();
  }
  ```

### Comments & Documentation

- **XML documentation for public APIs:**
  ```csharp
  /// <summary>
  /// Registers a new user account
  /// </summary>
  /// <param name="request">Registration details</param>
  /// <returns>Auth response with access token and user info</returns>
  /// <exception cref="InvalidOperationException">User already exists</exception>
  public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
  {
      // Implementation
  }
  ```

- **Inline comments for business logic:**
  ```csharp
  // Use the configured frontend URL — never trust the Origin/Host header
  var frontendBase = _config["App:FrontendBaseUrl"]
      ?? throw new InvalidOperationException("App:FrontendBaseUrl is not configured.");
  ```

---

## Git Commit Conventions

Use **Conventional Commits** format for consistency and automatic changelog generation.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

- `feat` — New feature
- `fix` — Bug fix
- `refactor` — Code refactoring (no behavior change)
- `test` — Test additions/changes
- `docs` — Documentation changes
- `chore` — Build, dependencies, etc.
- `perf` — Performance improvements
- `security` — Security fixes

### Scope (Optional)

Indicate the area affected:
- `ui` — Frontend/UI changes
- `api` — Backend API changes
- `db` — Database schema/migrations
- `auth` — Authentication feature
- `cart` — Cart functionality
- `orders` — Order management
- `payments` — Payment processing
- `uploads` — File upload handling

### Examples

```bash
# Feature with scope
git commit -m "feat(cart): add server-side cart sync and polling states"

# Bug fix
git commit -m "fix(ui): polish mobile nav and hero layout"

# Multiple related fixes
git commit -m "fix(07): stabilize custom order detail mapping and refresh state docs"

# Refactoring
git commit -m "refactor: extract API startup and remove dead custom-order flow"

# Tests
git commit -m "test(ci): add backend/frontend tests and run them in workflow"
```

### Best Practices

- **Atomic commits:** One logical change per commit
- **Descriptive subjects:** ~50 characters, start with lowercase
- **Use body for details:** Explain _why_, not just _what_
- **Reference issues:** Use `Fixes #123` or `Relates to #456` in footer

---

## File & Directory Naming

### Frontend (TypeScript/React)

| Type | Pattern | Example |
|------|---------|---------|
| Components | kebab-case.tsx | `products-manager.tsx` |
| Hooks | camelCase.ts | `useAuth.ts`, `useCart.ts` |
| Stores | camelCase-store.ts | `cart-store.ts` |
| Utilities | kebab-case.ts | `cart-merge.ts`, `format-price.ts` |
| Types | kebab-case.ts or Index.ts | `cart-types.ts`, `index.ts` |
| Tests | name.test.ts | `cart-store.test.ts` |
| Config | kebab-case.ts | `tailwind.config.ts` |

### Backend (C#)

| Type | Pattern | Example |
|------|---------|---------|
| Controllers | PascalCaseController.cs | `AuthController.cs` |
| Services | PascalService.cs | `CartService.cs` |
| Interfaces | IPascalService.cs | `ICartService.cs` |
| DTOs | PascalDtos.cs | `AuthDtos.cs` |
| Validators | PascalValidator.cs | `CreateOrderValidator.cs` |
| Entities | Pascal.cs | `Product.cs`, `Order.cs` |
| Tests | PascalTests.cs | `CartServiceTests.cs` |

### Directory Organization

**Frontend:**
```
src/
├── app/              # Page routes
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── admin/        # Admin-specific
│   ├── auth/         # Auth-related
│   ├── cart/         # Cart feature
│   └── custom-order/ # Custom order flow
├── lib/              # Utilities & API
├── stores/           # Zustand stores
├── types/            # TypeScript types
└── test/             # Test setup
```

**Backend:**
```
src/
├── Dressfield.API/
│   ├── Controllers/
│   ├── Middleware/
│   └── Extensions/
├── Dressfield.Application/
│   ├── DTOs/
│   ├── Interfaces/
│   └── Validators/
├── Dressfield.Core/
│   └── Entities/
└── Dressfield.Infrastructure/
    ├── Data/
    └── Services/
```

---

## Code Style & Formatting

### Indentation & Whitespace

- **Spaces:** 2 spaces (frontend), 4 spaces (backend)
- **Line length:** 100 characters (soft limit, break at 120 hard limit)
- **Trailing whitespace:** Remove

### Import/Using Organization

**Frontend (TypeScript):**
```typescript
// 1. React & Next.js imports
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// 2. Third-party library imports
import { useMutation, useQuery } from "@tanstack/react-query";
import clsx from "clsx";

// 3. Local imports (absolute paths)
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { api } from "@/lib/api";
```

**Backend (C#):**
```csharp
// 1. System namespaces
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

// 2. ASP.NET Core
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// 3. Third-party
using FluentValidation;

// 4. Application namespaces
using Dressfield.Application.DTOs;
using Dressfield.Core.Entities;
```

### Closing Braces

**Frontend:**
```typescript
// Use single line for short blocks
if (condition) return null;

// Use braces for complex logic
if (condition) {
  // Multiple statements
  setState(value);
  toast.success("Message");
}
```

**Backend:**
```csharp
// Always use braces in C#
if (condition)
{
    // Implementation
}

// Method declarations
public async Task<IActionResult> GetCart()
{
    return Ok(data);
}
```

---

## Documentation Standards

### README Files

- Located at project root and in major directories
- Include: Purpose, setup instructions, environment config, deployment notes
- Keep current with significant changes

### Code Comments

- Explain _why_, not _what_ (code shows the what)
- Use for non-obvious logic, business rules, and workarounds
- Avoid over-commenting self-documenting code

### Inline Documentation

- **Frontend:** JSDoc for exported functions/components
  ```typescript
  /**
   * Formats a price to locale string with currency
   * @param price - Price in cents
   * @returns Formatted string (e.g., "₾50.00")
   */
  export function formatPrice(price: number): string {
    // ...
  }
  ```

- **Backend:** XML documentation for public APIs
  ```csharp
  /// <summary>
  /// Retrieves user's cart with enriched product data
  /// </summary>
  /// <param name="userId">User ID</param>
  /// <returns>Cart with active products and variants only</returns>
  public async Task<CartResponse> GetCartAsync(string userId) { }
  ```

### Architecture Documentation

- Keep ADRs (Architecture Decision Records) in `.planning/` for major decisions
- Document integration points and external service contracts
- Maintain STACK.md and INTEGRATIONS.md for tech stack and external services

---

## Summary

| Aspect | Convention | Example |
|--------|-----------|---------|
| **Components (TS)** | kebab-case.tsx | `products-manager.tsx` |
| **Functions (TS)** | camelCase | `getAdminProducts()` |
| **Constants (TS)** | UPPER_SNAKE_CASE | `PIXEL_ID` |
| **Classes (C#)** | PascalCase | `AuthController` |
| **Properties (C#)** | PascalCase | `Email`, `IsActive` |
| **Private fields (C#)** | _camelCase | `_authService` |
| **Commits** | type(scope): subject | `feat(cart): add sync` |
| **Spacing** | 2 (TS), 4 (C#) | — |

For questions about specific patterns, refer to the actual implementation files in the codebase — they are the source of truth.

---

**Last Updated:** 2026-04-01
