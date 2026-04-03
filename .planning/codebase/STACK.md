# Dressfield Technology Stack

## Overview
Dressfield uses a modern, decoupled architecture with a Next.js static frontend, ASP.NET Core backend API, and MySQL database. The stack prioritizes type safety, performance, and static export constraints.

---

## Frontend Stack

### Core Framework
- **Next.js** 16.2.1 — React-based framework configured for static export (no SSR/ISR)
  - Static site generation at build time
  - Deployed as static HTML/CSS/JS to Hostinger shared hosting
  - Trailing slashes enabled, unoptimized images (per constraint)

- **React** 19.2.4 — UI library
- **React DOM** 19.2.4 — DOM rendering

### Language & Typing
- **TypeScript** 5.x — Strict type checking enabled
  - Path alias: `@/*` → `./src/*`
  - Target: ES2017
  - JSX: react-jsx

### Styling & UI Components

#### CSS Framework
- **Tailwind CSS** 4.x — Utility-first CSS via PostCSS
  - `@tailwindcss/postcss` 4.x integration
  - Tailwind merge for conditional class composition

#### Component Libraries
- **shadcn/ui** 4.1.1 — Headless React components built on Radix UI
- **@base-ui/react** 1.3.0 — Low-level UI primitives

#### Icons & Animation
- **Lucide React** 1.7.0 — Icon library
- **Framer Motion** 12.38.0 — Animation and motion primitives
- **Sonner** 2.0.7 — Toast notifications
- **tw-animate-css** 1.4.0 — Tailwind animation utilities

### Form Management & Validation
- **React Hook Form** 7.72.0 — Performant form state management
- **Zod** 4.3.6 — TypeScript-first schema validation
- **@hookform/resolvers** 5.2.2 — Integration layer for Zod + React Hook Form

### State Management
- **TanStack React Query** (aka React Query) 5.95.2 — Server state management
  - Automatic caching, background refetching, synchronization
  - Used for API data (products, orders, custom orders)

- **Zustand** 5.0.12 — Client state management
  - Lightweight store for UI state (cart, auth tokens, UI toggles)
  - Located in `src/stores/`

### API Client
- **Axios** 1.13.6 — HTTP client
  - Interceptors for JWT authentication
  - Automatic token refresh on 401 responses
  - Credentials enabled for cookie-based refresh tokens
  - Base URL: `process.env.NEXT_PUBLIC_API_URL` (defaults to `http://localhost:5000`)

### Image & File Processing
- **@imgly/background-removal** 1.7.0 — AI-powered background removal for design uploads
- **Fabric.js** 5.5.2 — Canvas library for design mockup preview
- **react-dropzone** 15.0.0 — File drop zone component for design uploads

### Testing
- **Vitest** 3.2.4 — Unit testing framework (Vite-native)
- **@testing-library/react** 16.3.0 — React component testing utilities
- **@testing-library/jest-dom** 6.9.1 — Jest DOM matchers
- **jsdom** 27.0.1 — Browser environment simulation for Node.js tests

### Development Tools
- **ESLint** 9.x — JavaScript linting
  - `eslint-config-next` — Next.js recommended rules

- **rimraf** 6.1.3 — Cross-platform file deletion
- **cross-env** 10.1.0 — Cross-platform environment variables

### Build & Deployment
- **next-sitemap** 4.2.3 — Automatic sitemap generation for static export
- **serve** (via npx) — Local static server for testing exports

### Dependencies Summary
- Production: 15 core packages
- Dev: 13 dev tools and testing utilities
- Total: 28 primary dependencies (minimal footprint for shared hosting)

---

## Backend Stack

### Runtime & Framework
- **ASP.NET Core** 9.0 (.NET 9) — Modern web API framework
  - Web API using Controllers
  - Structured logging and health checks

### Language & Architecture
- **C#** 12+ — LINQ, nullable reference types, implicit usings
- **Layered Architecture:**
  - API (Controllers, middleware)
  - Application (Services, DTOs, validation)
  - Core (Domain entities, interfaces)
  - Infrastructure (Data access, external services)

### Object-Relational Mapping
- **Entity Framework Core** 9.x — ORM for database operations
  - `Microsoft.EntityFrameworkCore.Design` 9.x — CLI tooling for migrations
  - Design-time utilities for `dotnet ef` commands

### Database Drivers
- **Pomelo.EntityFrameworkCore.MySql** 9.x — MySQL 8.0 support for EF Core
  - Configured for MySQL 8.0.36
  - Version negotiation at runtime

### Authentication & Identity
- **Microsoft.AspNetCore.Identity** — User/role management
  - Integrated with EF Core (`AddEntityFrameworkStores<DressfieldDbContext>`)
  - Password hashing, email confirmation, refresh tokens

- **JWT (JSON Web Tokens)** — Stateless API authentication
  - `System.IdentityModel.Tokens.Jwt` 8.17.0 — Token creation/validation
  - `Microsoft.AspNetCore.Authentication.JwtBearer` 9.x — Bearer token middleware
  - Asymmetric signing via `SymmetricSecurityKey`
  - Claims-based authorization

### Validation
- **FluentValidation** 11.3.1 — Fluent API for validation rules
  - `FluentValidation.AspNetCore` 11.3.1 — Auto-validation middleware
  - `FluentValidation.DependencyInjectionExtensions` 12.1.1 — Service registration

### Logging
- **Serilog** 10.0.0 — Structured logging library
  - `Serilog.AspNetCore` 10.0.0 — ASP.NET Core integration
  - `Serilog.Sinks.Console` 6.1.1 — Console output
  - `Serilog.Sinks.File` 7.0.0 — Rolling daily log files to `logs/dressfield-.log`
  - Configuration-driven from `appsettings.json`

### Data Mapping
- **Mapster** 10.0.6 — Object-to-object mapping (DTOs ↔ Entities)
  - Performance-optimized alternative to AutoMapper

### API Documentation
- **Swashbuckle.AspNetCore** 10.1.7 — Swagger/OpenAPI generation
  - Automatic endpoint documentation
  - Available at `/swagger` in development

### Cloud Storage
- **Azure.Storage.Blobs** 12.27.0 — Azure Blob Storage client
  - Production: Stores design images in Blob Storage
  - Development: Falls back to `LocalStorageService`

### Email
- **MailKit** 4.15.1 — SMTP email library
  - Configuration-driven (host, port, credentials)
  - Supports TLS/SSL email protocols
  - Configured via `appsettings.json` settings

### Health Checks
- **Microsoft.Extensions.Diagnostics.HealthChecks** — ASP.NET Core built-in
  - `Microsoft.Extensions.Diagnostics.HealthChecks.EntityFrameworkCore` — Database connectivity checks
  - Endpoint: `/api/health` returns JSON status

### Rate Limiting
- **System.Threading.RateLimiting** — Built-in .NET rate limiting
  - Fixed window limiters for auth (10 req/min), orders (20 req/min), upload (12 req/min)
  - Per-IP IP-based enforcement

### Security
- **X-Content-Type-Options: nosniff** — MIME type sniffing prevention
- **X-Frame-Options: DENY** — Clickjacking protection
- **Referrer-Policy: strict-origin-when-cross-origin** — Referrer header control
- **Permissions-Policy** — Disable geolocation, camera, microphone

### Dependency Injection
- Built-in ASP.NET Core DI container
- Service lifetimes: Scoped (request-scoped), Singleton (application-scoped)

### Project Structure
```
Dressfield.backend/
├── Dressfield.API/          (API layer, controllers, middleware)
├── Dressfield.Application/  (Services, DTOs, validation)
├── Dressfield.Core/         (Entities, interfaces)
├── Dressfield.Infrastructure/ (EF Core, storage, email, payment)
└── Dressfield.Tests/        (Unit & integration tests)
```

---

## Database

### Database System
- **MySQL** 8.0.36
  - Hostinger shared hosting
  - Managed via Entity Framework Core

### ORM & Migrations
- **Entity Framework Core 9.x** — Migrations-based schema management
  - `dotnet ef migrations add` — Create migrations
  - `dotnet ef database update` — Apply migrations
  - Auto-seed on application startup (roles, admin user)

### Database Context
- `DressfieldDbContext` — Single DbContext for all entities
  - Users, Products, Orders, Custom Orders, Cart, Refresh Tokens
  - Configured in `Program.cs`

### Identity Schema
- ASP.NET Core Identity tables (AspNetUsers, AspNetRoles, AspNetUserRoles)
- Custom tables for Orders, Products, Designs

---

## Build & Deployment Tools

### Frontend Build
```bash
npm run build      # Next.js static export to ./out/
npm run postbuild  # Generate sitemap
npm run serve:static # Test static export locally
```

### Backend Build
- `dotnet build` — Compile ASP.NET Core 9 solution
- `dotnet publish` — Package for deployment

### Development
- Frontend: `npm run dev` — Next.js dev server on :3000
- Backend: `dotnet run` — Kestrel server on :5000

### Testing
- Frontend: `npm run test` / `npm run test:watch` — Vitest
- Backend: xUnit/NUnit tests in `Dressfield.Tests`

### Deployment Targets
- **Frontend:** Hostinger static hosting (static files from `out/` directory)
- **Backend:** Azure App Service (Linux container or Windows-compatible runtime)
- **Database:** Hostinger MySQL 8.0

---

## Version Summary

| Component | Version | Purpose |
|-----------|---------|---------|
| Node.js / npm | Latest | Frontend tooling |
| .NET SDK | 9.0 | Backend runtime & tooling |
| Next.js | 16.2.1 | Static site generation |
| React | 19.2.4 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling |
| TanStack Query | 5.95.2 | Server state |
| Zustand | 5.0.12 | Client state |
| ASP.NET Core | 9.0 | API framework |
| Entity Framework Core | 9.x | ORM |
| MySQL | 8.0.36 | Database |
| Serilog | 10.0.0 | Logging |
| FluentValidation | 11.3.1 | Input validation |

---

## Key Architectural Constraints

1. **Static Export Only** — No dynamic routes, SSR, ISR, middleware, or Next.js API routes
2. **JWT Authentication** — Stateless, token-based (no session cookies)
3. **Separate Frontend/Backend** — CORS-enabled, independent deployments
4. **Large File Uploads** — 20 MB body size limit for design images
5. **Rate Limiting** — Per-IP, tier-based (auth, orders, uploads)
6. **Conditional Storage** — Azure Blob in production, local filesystem in development
7. **Conditional Payments** — Bank of Georgia iPay in production, mock in development
8. **Conditional Scanning** — ClamAV malware scanning (disabled by default)

