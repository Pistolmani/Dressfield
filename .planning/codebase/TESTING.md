# Dressfield Testing Strategy & Approach

This document outlines the testing frameworks, test structure, current coverage, and recommendations for expanding test coverage across Dressfield's frontend and backend.

## Table of Contents

1. [Overview](#overview)
2. [Frontend Testing](#frontend-testing)
3. [Backend Testing](#backend-testing)
4. [Test Organization](#test-organization)
5. [Running Tests](#running-tests)
6. [Current Coverage](#current-coverage)
7. [Expanding Test Coverage](#expanding-test-coverage)
8. [CI/CD Integration](#cicd-integration)

---

## Overview

Dressfield uses a **dual testing approach** aligned with each stack:

| Layer | Framework | Language | Status |
|-------|-----------|----------|--------|
| **Frontend** | Vitest + Testing Library | TypeScript/React | Minimal (cart utilities only) |
| **Backend** | xUnit + FluentAssertions + Moq | C# | Minimal (validators & cart service) |
| **Integration** | In-memory SQLite | C# | Used for service tests |
| **End-to-End** | Manual QA | — | Pre-launch verification |

**Philosophy:** Test the most critical paths first (auth, cart, payments). Expand coverage progressively as features stabilize.

---

## Frontend Testing

### Framework Setup

**Test Runner:** Vitest
- **Config:** `vitest.config.ts`
- **Environment:** jsdom (simulates browser DOM)
- **Globals:** Enabled (describe, it, expect without imports)

**Testing Library:** @testing-library/react
- Focuses on user interactions, not implementation details
- Queries that match how users see the UI

**Setup File:** `src/test/setup.ts`
```typescript
import "@testing-library/jest-dom/vitest";
```

### Example: Frontend Test (cart-store.test.ts)

```typescript
import { beforeEach, describe, expect, it } from "vitest";
import { useCartStore } from "@/stores/cart-store";

describe("cart-store", () => {
  beforeEach(() => {
    localStorage.clear();
    useCartStore.getState().setItems([]);
  });

  it("adds and aggregates duplicate items", () => {
    const store = useCartStore.getState();

    store.addItem({
      productId: 1,
      name: "Tee",
      price: 20,
      quantity: 1,
    });
    store.addItem({
      productId: 1,
      name: "Tee",
      price: 20,
      quantity: 2,
    });

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(3);
  });

  it("removes item by product+variant key", () => {
    useCartStore.getState().setItems([
      { productId: 1, variantId: 1, name: "Tee", price: 20, quantity: 1 },
      { productId: 1, variantId: 2, name: "Tee", price: 22, quantity: 1 },
    ]);

    useCartStore.getState().removeItem(1, 1);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].variantId).toBe(2);
  });

  it("updates quantity", () => {
    useCartStore.getState().setItems([
      { productId: 5, name: "Hoodie", price: 80, quantity: 1 },
    ]);

    useCartStore.getState().updateQuantity(5, undefined, 4);
    expect(useCartStore.getState().items[0].quantity).toBe(4);
  });

  it("clears cart", () => {
    useCartStore.getState().setItems([
      { productId: 1, name: "Tee", price: 20, quantity: 1 },
    ]);
    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("computes totals", () => {
    useCartStore.getState().setItems([
      { productId: 1, name: "Tee", price: 20, quantity: 2 },
      { productId: 2, name: "Hoodie", price: 80, quantity: 1 },
    ]);

    const store = useCartStore.getState();
    expect(store.totalItems()).toBe(3);
    expect(store.totalPrice()).toBe(120);
  });
});
```

### Frontend Test Patterns

#### 1. Unit Tests (Store/Hook Tests)

Test Zustand stores and custom hooks in isolation:

```typescript
describe("useCartStore", () => {
  it("persists state to localStorage", () => {
    const store = useCartStore.getState();
    store.addItem({ productId: 1, name: "Product", price: 50, quantity: 1 });

    // Create new store instance (simulates page reload)
    const newStore = useCartStore.getState();
    expect(newStore.items).toHaveLength(1);
  });
});
```

#### 2. Component Tests (With TanStack Query Mocking)

```typescript
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProductsManager } from "@/components/admin/products-manager";

vi.mock("@/lib/catalog", () => ({
  getAdminProducts: vi.fn(() => Promise.resolve([
    { id: 1, name: "Product 1", price: 50 }
  ])),
  deleteProduct: vi.fn(() => Promise.resolve()),
}));

describe("ProductsManager", () => {
  it("displays products", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ProductsManager />
      </QueryClientProvider>
    );

    await screen.findByText("Product 1");
    expect(screen.getByText("Product 1")).toBeInTheDocument();
  });
});
```

#### 3. API Utility Tests

```typescript
import { describe, it, expect, vi } from "vitest";
import { formatPrice } from "@/lib/catalog";

describe("formatPrice", () => {
  it("formats price to locale string", () => {
    expect(formatPrice(5000)).toBe("₾50.00");
    expect(formatPrice(0)).toBe("₾0.00");
    expect(formatPrice(123456)).toBe("₾1,234.56");
  });
});
```

### Frontend Test File Locations

```
Dressfield.web/src/
├── stores/
│   └── __tests__/
│       └── cart-store.test.ts          # Zustand store tests
├── components/
│   ├── __tests__/
│   │   ├── products-manager.test.tsx   # Component tests
│   │   └── login-form.test.tsx
│   └── ...
└── lib/
    ├── __tests__/
    │   ├── cart-merge.test.ts          # Utility function tests
    │   ├── format-price.test.ts
    │   └── api.test.ts                 # API client tests
    └── ...
```

### Running Frontend Tests

```bash
cd Dressfield.web

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test cart-store.test.ts

# Run with coverage (add to package.json if needed)
npm test -- --coverage
```

---

## Backend Testing

### Framework Setup

**Test Framework:** xUnit
- Built-in with .NET, provides `[Fact]` and `[Theory]` attributes
- Lightweight and performant

**Assertions:** FluentAssertions
- Readable assertion syntax
- Better error messages for debugging

**Mocking:** Moq
- Mock dependencies and interfaces
- Verify method calls

**Database Testing:** In-Memory SQLite
- Real EF Core behavior without spinning up MySQL
- Transactions & constraints work as expected

### Example: Backend Test (CartServiceTests.cs)

```csharp
using Dressfield.Application.DTOs;
using Dressfield.Core.Entities;
using Dressfield.Infrastructure.Data;
using Dressfield.Infrastructure.Services;
using FluentAssertions;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace Dressfield.Tests.Services;

public class CartServiceTests
{
    [Fact]
    public async Task GetCartAsync_ShouldEnrichItems_AndFilterUnavailableProducts()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using var db = CreateContext(connection);
        await db.Database.EnsureCreatedAsync();

        var user = new ApplicationUser
        {
            Id = "user-1",
            Email = "user@example.com",
            UserName = "user@example.com",
            FirstName = "Nika",
            LastName = "Beridze",
        };
        db.Users.Add(user);

        var activeProduct = new Product
        {
            Name = "Active Tee",
            Slug = "active-tee",
            Description = "desc",
            BasePrice = 50,
            IsActive = true,
            Images =
            [
                new ProductImage { ImageUrl = "https://cdn/tee.png", SortOrder = 0, IsPrimary = true }
            ],
            Variants =
            [
                new ProductVariant { Name = "Size", Value = "L", PriceAdjustment = 10, IsActive = true, StockQuantity = 5 }
            ],
        };

        var inactiveProduct = new Product
        {
            Name = "Inactive",
            Slug = "inactive",
            Description = "desc",
            BasePrice = 20,
            IsActive = false,
        };

        db.Products.AddRange(activeProduct, inactiveProduct);
        await db.SaveChangesAsync();

        var activeVariantId = activeProduct.Variants.Single().Id;

        db.Carts.Add(new Cart
        {
            UserId = user.Id,
            Items =
            [
                new CartItem { ProductId = activeProduct.Id, VariantId = 0, Quantity = 2 },
                new CartItem { ProductId = activeProduct.Id, VariantId = activeVariantId, Quantity = 1 },
                new CartItem { ProductId = inactiveProduct.Id, VariantId = 0, Quantity = 1 },
            ],
        });
        await db.SaveChangesAsync();

        var service = new CartService(db);
        var result = await service.GetCartAsync(user.Id);

        result.Items.Should().HaveCount(2);
        result.Items.Should().Contain(x => x.ProductId == activeProduct.Id && x.VariantId == null && x.Price == 50m);
        result.Items.Should().Contain(x => x.ProductId == activeProduct.Id && x.VariantId == activeVariantId && x.Price == 60m);
    }

    [Fact]
    public async Task SyncCartAsync_ShouldValidateProducts()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using var db = CreateContext(connection);
        await db.Database.EnsureCreatedAsync();

        // Arrange: Create products and cart items
        var product1 = new Product
        {
            Name = "Product 1",
            Slug = "product-1",
            Description = "desc",
            BasePrice = 100,
            IsActive = true,
        };
        db.Products.Add(product1);
        await db.SaveChangesAsync();

        var userId = "user-1";
        var service = new CartService(db);

        // Act: Sync cart with valid items
        var syncRequest = new SyncCartRequest
        {
            Items =
            [
                new CartItemDto { ProductId = product1.Id, VariantId = null, Quantity = 1 }
            ]
        };
        var result = await service.SyncCartAsync(userId, syncRequest);

        // Assert: Cart should be synced
        result.Items.Should().HaveCount(1);
        result.Items[0].ProductId.Should().Be(product1.Id);
    }

    private static DressfileDbContext CreateContext(SqliteConnection connection)
    {
        var options = new DbContextOptionsBuilder<DressfileDbContext>()
            .UseSqlite(connection)
            .Options;

        return new DressfileDbContext(options);
    }
}
```

### Backend Test Patterns

#### 1. Validator Tests

```csharp
using Dressfield.Application.DTOs;
using Dressfield.Application.Validators;
using FluentAssertions;

namespace Dressfield.Tests.Validators;

public class RegisterRequestValidatorTests
{
    private readonly RegisterRequestValidator _validator = new();

    [Fact]
    public void Validate_ShouldPass_ForValidRequest()
    {
        var request = new RegisterRequest(
            "Nika",
            "Beridze",
            "nika@example.com",
            "StrongPass1!",
            "StrongPass1!",
            "+995 599 123 456");

        var result = _validator.Validate(request);

        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Validate_ShouldFail_WhenRequiredFieldsMissing()
    {
        var request = new RegisterRequest("", "", "", "", "", null);

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors
            .Select(e => e.PropertyName)
            .Should()
            .Contain(["FirstName", "LastName", "Email", "Password"]);
    }

    [Fact]
    public void Validate_ShouldFail_WhenPasswordIsWeak()
    {
        var request = new RegisterRequest(
            "Nika",
            "Beridze",
            "nika@example.com",
            "password",  // Too weak
            "password",
            null);

        var result = _validator.Validate(request);

        result.IsValid.Should().BeFalse();
        result.Errors
            .Where(e => e.PropertyName == "Password")
            .Should()
            .NotBeEmpty();
    }

    [Theory]
    [InlineData("test@", false)]         // Invalid format
    [InlineData("test@example.com", true)]  // Valid
    public void Validate_Email_Theory(string email, bool expectedValid)
    {
        var request = new RegisterRequest("Name", "Last", email, "Pass1!", "Pass1!", null);
        var result = _validator.Validate(request);

        result.IsValid.Should().Be(expectedValid);
    }
}
```

#### 2. Service Tests with Mocking

```csharp
using Moq;
using Dressfield.Application.Interfaces;
using Dressfield.Infrastructure.Services;
using FluentAssertions;

namespace Dressfield.Tests.Services;

public class OrderServiceTests
{
    [Fact]
    public async Task CreateOrderAsync_ShouldCallPaymentService()
    {
        // Arrange
        var mockPaymentService = new Mock<IPaymentService>();
        var mockEmailService = new Mock<IEmailService>();
        var mockOrderRepository = new Mock<IOrderRepository>();

        var orderService = new OrderService(
            mockPaymentService.Object,
            mockEmailService.Object,
            mockOrderRepository.Object);

        var createRequest = new CreateOrderRequest(
            UserId: "user-1",
            Items: [/* items */],
            ShippingAddress: "Address");

        mockPaymentService
            .Setup(p => p.ProcessPaymentAsync(It.IsAny<PaymentRequest>()))
            .ReturnsAsync(new PaymentResponse { Success = true, TransactionId = "tx-123" });

        // Act
        var result = await orderService.CreateOrderAsync(createRequest);

        // Assert
        result.Should().NotBeNull();
        result.PaymentStatus.Should().Be("Success");
        mockPaymentService.Verify(
            p => p.ProcessPaymentAsync(It.IsAny<PaymentRequest>()),
            Times.Once);
        mockEmailService.Verify(
            e => e.SendOrderConfirmationAsync(It.IsAny<string>(), It.IsAny<Order>()),
            Times.Once);
    }
}
```

#### 3. In-Memory Database Tests

```csharp
[Fact]
public async Task GetAvailableProducts_ShouldFilterByStock()
{
    // Setup in-memory SQLite
    await using var connection = new SqliteConnection("DataSource=:memory:");
    await connection.OpenAsync();
    await using var db = CreateContext(connection);
    await db.Database.EnsureCreatedAsync();

    // Seed test data
    var product = new Product
    {
        Name = "Limited Edition",
        Slug = "limited-edition",
        Description = "desc",
        BasePrice = 100,
        IsActive = true,
        Variants =
        [
            new ProductVariant
            {
                Name = "Size",
                Value = "XL",
                PriceAdjustment = 0,
                IsActive = true,
                StockQuantity = 0  // Out of stock
            }
        ]
    };
    db.Products.Add(product);
    await db.SaveChangesAsync();

    var productService = new ProductService(db);

    // Act
    var available = await productService.GetAvailableProductsAsync();

    // Assert
    available.Should().NotContain(p => p.Id == product.Id);
}
```

### Backend Test File Locations

```
Dressfield.backend/tests/Dressfield.Tests/
├── Services/
│   ├── CartServiceTests.cs
│   ├── AuthServiceTests.cs
│   └── OrderServiceTests.cs
├── Validators/
│   ├── RegisterRequestValidatorTests.cs
│   ├── CreateOrderRequestValidatorTests.cs
│   └── ProductRequestValidatorTests.cs
└── Shared/
    └── TestDatabaseFixture.cs         # Reusable DB setup
```

### Running Backend Tests

```bash
cd Dressfield.backend

# Run all tests
dotnet test

# Run specific test class
dotnet test --filter "FullyQualifiedName~CartServiceTests"

# Run with verbose output
dotnet test -v diag

# Run with coverage (requires coverlet)
dotnet test /p:CollectCoverage=true /p:CoverageFormat=opencover
```

---

## Test Organization

### Directory Structure

**Frontend:**
```
src/
├── components/
│   ├── admin/
│   │   ├── products-manager.tsx
│   │   └── __tests__/
│   │       └── products-manager.test.tsx    # Colocated with component
│   └── ...
├── stores/
│   ├── cart-store.ts
│   └── __tests__/
│       └── cart-store.test.ts                # Colocated with store
└── lib/
    ├── cart-merge.ts
    └── __tests__/
        └── cart-merge.test.ts                # Colocated with utility
```

**Backend:**
```
tests/Dressfield.Tests/
├── Services/
│   ├── CartServiceTests.cs
│   ├── AuthServiceTests.cs
│   └── OrderServiceTests.cs
├── Validators/
│   ├── RegisterRequestValidatorTests.cs
│   └── CreateOrderRequestValidatorTests.cs
└── Shared/
    └── TestDatabaseFixture.cs
```

### Naming Conventions

- **Test classes:** `[ComponentName]Tests.cs` or `[FunctionName].test.ts`
- **Test methods:** `[MethodUnderTest]_Should[ExpectedBehavior]_[Condition]`

Examples:
```csharp
// Backend
public class CartServiceTests
{
    public async Task GetCartAsync_ShouldEnrichItems_AndFilterUnavailableProducts()
    public async Task SyncCartAsync_ShouldValidateProducts()
}
```

```typescript
// Frontend
describe("cart-store", () => {
  it("adds and aggregates duplicate items", () => {
  it("removes item by product+variant key", () => {
  it("clears cart", () => {
});
```

---

## Running Tests

### Frontend

```bash
cd Dressfield.web

# Run all tests once
npm test

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Run specific test file
npm test src/stores/__tests__/cart-store.test.ts

# Run tests matching pattern
npm test -- --grep "cart"
```

**Vitest Configuration** (`vitest.config.ts`):
```typescript
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
  },
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### Backend

```bash
cd Dressfield.backend

# Run all tests
dotnet test

# Run with verbose output
dotnet test -v diag

# Run specific test class
dotnet test --filter "ClassName=Dressfield.Tests.Services.CartServiceTests"

# Run and display test count
dotnet test --logger "console;verbosity=detailed"
```

---

## Current Coverage

### Frontend

**Tested:**
- ✓ Cart store (Zustand) — `src/stores/__tests__/cart-store.test.ts`
  - Add/remove items
  - Aggregate duplicates
  - Update quantities
  - Compute totals
  - Clear cart

**Not Tested:**
- Components (ProductsManager, LoginForm, etc.)
- API utilities (formatPrice, getAdminProducts, etc.)
- Custom hooks (useAuth, useCart, etc.)
- Integration with TanStack Query

**Coverage:** ~5% of frontend code

### Backend

**Tested:**
- ✓ Validators (FluentValidation)
  - `RegisterRequestValidator` — email, password, required fields
  - `CreateOrderValidator` — order items, shipping address
  - `CreateCustomOrderValidator` — design upload, size/color selection
  - `ProductRequestValidator` — product creation/update

- ✓ Services
  - `CartService` — enrichment, filtering, syncing
  - Selected business logic paths

**Not Tested:**
- Controllers (AuthController, CartController, etc.)
- Payment integration
- Email service
- Upload handling
- Order processing workflows
- Authentication flows

**Coverage:** ~8% of backend code

---

## Expanding Test Coverage

### Priority Order (MVP → Launch)

#### Phase 1: Critical Path Tests (Auth & Cart)

**Frontend:**
1. `LoginForm` component — successful login, validation errors, error handling
2. `CartDrawer` component — add/remove items, quantity updates
3. `useAuth` hook — token management, refresh flow
4. API utilities — `getAdminProducts`, `formatPrice`, `deleteProduct`

**Backend:**
1. `AuthService` — registration, login, token refresh, logout
2. `AuthController` — endpoint behavior, error responses
3. `CartService` integration — full sync flow
4. Payment webhook validation

#### Phase 2: Order Management

**Frontend:**
1. `CheckoutForm` component — form submission, payment redirect
2. `OrderSummary` component — cart to order conversion
3. Order status polling

**Backend:**
1. `OrderService` — creation, status tracking
2. `PaymentService` — BOG iPay integration
3. Order detail lookups

#### Phase 3: Admin Features

**Frontend:**
1. `ProductsManager` component — list, search, create, edit, delete
2. `OrdersManager` component — display, filtering
3. `CustomOrderDetail` component — status tracking, design preview

**Backend:**
1. `AdminDashboardService` — KPI calculations
2. Product management endpoints
3. Custom order processing

### Adding Tests

#### Frontend Example (New Component Test)

```typescript
// components/cart/__tests__/cart-drawer.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartDrawer } from "@/components/cart/cart-drawer";

vi.mock("@/stores/cart-store", () => ({
  useCartStore: vi.fn(() => ({
    items: [
      { productId: 1, name: "Tee", price: 50, quantity: 1 }
    ],
    removeItem: vi.fn(),
    updateQuantity: vi.fn(),
    totalPrice: () => 50,
  })),
}));

describe("CartDrawer", () => {
  it("displays items in cart", () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <CartDrawer open={true} />
      </QueryClientProvider>
    );

    expect(screen.getByText("Tee")).toBeInTheDocument();
    expect(screen.getByText("₾50.00")).toBeInTheDocument();
  });

  it("removes item when delete clicked", async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <CartDrawer open={true} />
      </QueryClientProvider>
    );

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    await user.click(deleteButton);

    expect(removeItemMock).toHaveBeenCalled();
  });
});
```

#### Backend Example (New Service Test)

```csharp
// tests/Dressfield.Tests/Services/AuthServiceTests.cs
using Dressfield.Application.DTOs;
using Dressfield.Application.Interfaces;
using Dressfield.Core.Entities;
using Dressfield.Infrastructure.Services;
using FluentAssertions;
using Moq;

namespace Dressfield.Tests.Services;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _mockUserRepository;
    private readonly Mock<ITokenService> _mockTokenService;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        _mockUserRepository = new Mock<IUserRepository>();
        _mockTokenService = new Mock<ITokenService>();
        _authService = new AuthService(_mockUserRepository.Object, _mockTokenService.Object);
    }

    [Fact]
    public async Task RegisterAsync_ShouldCreateNewUser()
    {
        // Arrange
        var request = new RegisterRequest(
            "John",
            "Doe",
            "john@example.com",
            "StrongPass1!",
            "StrongPass1!",
            "+1234567890");

        _mockUserRepository
            .Setup(x => x.GetByEmailAsync("john@example.com"))
            .ReturnsAsync((ApplicationUser)null);

        _mockTokenService
            .Setup(x => x.GenerateTokenAsync(It.IsAny<ApplicationUser>()))
            .ReturnsAsync("access-token");

        // Act
        var result = await _authService.RegisterAsync(request);

        // Assert
        result.AccessToken.Should().Be("access-token");
        result.User.Email.Should().Be("john@example.com");
        _mockUserRepository.Verify(x => x.CreateAsync(It.IsAny<ApplicationUser>()), Times.Once);
    }

    [Fact]
    public async Task LoginAsync_ShouldReturnTokenForValidCredentials()
    {
        // Arrange
        var user = new ApplicationUser
        {
            Id = "user-1",
            Email = "john@example.com",
            FirstName = "John",
            LastName = "Doe"
        };

        var request = new LoginRequest("john@example.com", "StrongPass1!");

        _mockUserRepository
            .Setup(x => x.GetByEmailAsync("john@example.com"))
            .ReturnsAsync(user);

        _mockTokenService
            .Setup(x => x.GenerateTokenAsync(user))
            .ReturnsAsync("access-token");

        // Act
        var result = await _authService.LoginAsync(request);

        // Assert
        result.AccessToken.Should().Be("access-token");
        result.User.Id.Should().Be("user-1");
    }
}
```

---

## CI/CD Integration

### GitHub Actions Workflow

Test execution is integrated into the CI/CD pipeline via `.github/workflows/`:

```yaml
# .github/workflows/test.yml
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      # Frontend tests
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 20

      - name: Install frontend dependencies
        run: cd Dressfield.web && npm ci

      - name: Run frontend tests
        run: cd Dressfield.web && npm test

      # Backend tests
      - name: Setup .NET
        uses: actions/setup-dotnet@v3
        with:
          dotnet-version: 9.0

      - name: Restore backend dependencies
        run: cd Dressfield.backend && dotnet restore

      - name: Run backend tests
        run: cd Dressfield.backend && dotnet test
```

**Current Pipeline Status:**
- Frontend: Vitest runs on every push/PR
- Backend: dotnet test runs on every push/PR
- Coverage reports: Not currently collected (can add with Codecov)

### Pre-Commit Hooks (Optional)

To run tests before committing, add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
set -e

echo "Running frontend tests..."
cd Dressfield.web && npm test

echo "Running backend tests..."
cd Dressfield.backend && dotnet test

echo "All tests passed!"
```

---

## Best Practices

### Do

- ✓ Test behavior, not implementation details
- ✓ Use descriptive test names that explain expected behavior
- ✓ Keep tests focused (one assertion per test when possible)
- ✓ Use fixtures/factories for common test setup
- ✓ Mock external dependencies (APIs, databases, services)
- ✓ Test error cases as well as happy paths
- ✓ Keep tests fast and isolated (no inter-test dependencies)
- ✓ Use in-memory databases for integration tests

### Don't

- ✗ Test internal implementation details
- ✗ Create brittle tests that break on refactoring
- ✗ Mix multiple concerns in a single test
- ✗ Sleep or use arbitrary delays in tests
- ✗ Test framework behavior (e.g., React's useState)
- ✗ Skip error scenarios
- ✗ Create test data that's hard to understand
- ✗ Make API calls to real external services

---

## Recommended Reading

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles)
- [FluentAssertions Documentation](https://fluentassertions.com/)
- [xUnit Documentation](https://xunit.net/)
- [Testing Pyramid](https://martinfowler.com/bliki/TestPyramid.html)

---

## Summary

| Aspect | Frontend | Backend |
|--------|----------|---------|
| **Framework** | Vitest + Testing Library | xUnit + FluentAssertions |
| **Current Status** | ~5% coverage (stores only) | ~8% coverage (validators + some services) |
| **Priority** | Auth, Cart, Checkout | Auth, Cart, Payments |
| **Setup** | `npm test` | `dotnet test` |
| **Location** | `__tests__/` collocated | `tests/Dressfield.Tests/` |
| **Example** | cart-store.test.ts | CartServiceTests.cs |

**Next Steps:** Expand coverage for critical auth and cart flows, then add admin features. Aim for 60%+ coverage before launch.

---

**Last Updated:** 2026-04-01
