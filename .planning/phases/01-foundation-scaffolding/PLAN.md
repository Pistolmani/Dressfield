---
phase: 1
slug: foundation-scaffolding
status: planned
plans: 5
created: 2026-03-27
---

# Phase 1 — Foundation & Scaffolding

> Working project skeleton with authentication, layout shell, and deployment pipeline.

**Requirements:** AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, UX-01, UX-02, UX-03, UX-04, ADMIN-03
**UI-SPEC:** 01-UI-SPEC.md (approved 2026-03-27)
**Note:** AUTH-05 (guest checkout) — Phase 1 establishes guest browsing without auth. The full guest checkout flow is deferred to Phase 4.

---

## Plan 1: Next.js Frontend Setup

**Goal:** Initialize Next.js project with TypeScript, Tailwind CSS 4, shadcn/ui, and static export configuration.
**Requirements covered:** (foundation for UX-01..04)

### Steps

1. **Initialize Next.js project**
   ```bash
   cd Dressfield.web
   npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias
   ```

2. **Configure static export** in `next.config.ts`:
   ```typescript
   const nextConfig: NextConfig = {
     output: 'export',
     images: { unoptimized: true },
     trailingSlash: true,
   }
   ```

3. **Install fonts** — Configure `next/font/google` for Inter and Noto Sans Georgian:
   ```typescript
   // src/app/layout.tsx
   import { Inter, Noto_Sans_Georgian } from 'next/font/google'

   const inter = Inter({
     subsets: ['latin'],
     weight: ['400', '500', '600', '700', '800'],
     variable: '--font-inter',
   })

   const notoGeorgian = Noto_Sans_Georgian({
     subsets: ['georgian'],
     weight: ['400', '700'],
     variable: '--font-georgian',
   })
   ```

4. **Initialize shadcn/ui:**
   ```bash
   npx shadcn@latest init
   ```
   Configure with:
   - Style: New York
   - Base color: Neutral
   - CSS variables: Yes
   - Tailwind CSS 4: Yes

5. **Configure design tokens** — Map UI-SPEC colors, spacing, and typography into Tailwind/CSS variables:
   ```css
   /* src/app/globals.css */
   :root {
     --background: #FAFAFA;
     --surface: #FFFFFF;
     --foreground: #0A0A0A;
     --muted: #6B7280;
     --border: #E5E7EB;
     --accent: #7C3AED;
     --accent-hover: #6D28D9;
     --accent-light: #EDE9FE;
     --accent-foreground: #FFFFFF;
     --destructive: #EF4444;
     --destructive-light: #FEF2F2;
     --success: #10B981;
     --success-light: #ECFDF5;
     --warning: #F59E0B;
     --header-bg: #0A0A0A;
     --header-text: #FFFFFF;
     --footer-bg: #111827;
     --footer-text: #D1D5DB;
   }
   ```

6. **Install shadcn components** needed for Phase 1:
   ```bash
   npx shadcn@latest add button input label card sheet dropdown-menu avatar badge separator skeleton
   ```

7. **Install dependencies:**
   ```bash
   npm install axios @tanstack/react-query zustand lucide-react sonner
   npm install react-hook-form zod @hookform/resolvers
   ```

8. **Create project structure:**
   ```
   src/
   ├── app/
   │   ├── layout.tsx          # Root layout with fonts, providers
   │   ├── page.tsx            # Home page (placeholder)
   │   ├── auth/
   │   │   ├── login/page.tsx
   │   │   ├── register/page.tsx
   │   │   ├── forgot-password/page.tsx
   │   │   └── reset-password/page.tsx
   │   └── admin/
   │       └── layout.tsx      # Admin guard layout
   ├── components/
   │   ├── ui/                 # shadcn components (auto-generated)
   │   ├── layout/
   │   │   ├── header.tsx
   │   │   ├── footer.tsx
   │   │   ├── mobile-menu.tsx
   │   │   └── nav-links.tsx
   │   └── auth/
   │       ├── login-form.tsx
   │       └── register-form.tsx
   ├── lib/
   │   ├── api.ts              # Axios instance with interceptors
   │   ├── auth.tsx            # Auth context + useAuth hook
   │   ├── providers.tsx       # QueryClient + Auth + Toaster providers
   │   └── utils.ts            # cn() helper (shadcn)
   ├── hooks/
   │   └── use-auth.ts
   ├── stores/
   │   └── cart-store.ts       # Zustand cart (stub for Phase 4)
   └── types/
       └── auth.ts             # User, LoginRequest, RegisterRequest types
   ```

9. **Set up API client** — Axios instance with JWT interceptor:
   - Base URL from `NEXT_PUBLIC_API_URL` env var
   - Request interceptor: attach access token from memory
   - Response interceptor: on 401, attempt silent refresh via `/api/auth/refresh` (httpOnly cookie), retry original request
   - On refresh failure: clear auth state, redirect to login

10. **Create `.env.local`:**
    ```
    NEXT_PUBLIC_API_URL=http://localhost:5000
    ```

### Verification
- [ ] `npm run build` succeeds with `output: 'export'`
- [ ] `out/` directory contains static HTML files
- [ ] Georgian text renders with Noto Sans Georgian font
- [ ] shadcn Button component renders with violet accent (#7C3AED)
- [ ] Design tokens match UI-SPEC color values

---

## Plan 2: ASP.NET Core Backend Setup

**Goal:** Create ASP.NET Core solution with clean architecture, EF Core + MySQL, and initial database schema.
**Requirements covered:** (foundation for AUTH-01..05, ADMIN-03)

### Steps

1. **Create solution structure:**
   ```bash
   cd Dressfield.backend
   dotnet new sln -n Dressfield
   dotnet new webapi -n Dressfield.API -o src/Dressfield.API
   dotnet new classlib -n Dressfield.Core -o src/Dressfield.Core
   dotnet new classlib -n Dressfield.Application -o src/Dressfield.Application
   dotnet new classlib -n Dressfield.Infrastructure -o src/Dressfield.Infrastructure
   dotnet sln add src/Dressfield.API src/Dressfield.Core src/Dressfield.Application src/Dressfield.Infrastructure
   ```

2. **Add project references:**
   ```
   API → Application, Infrastructure
   Application → Core
   Infrastructure → Core, Application
   ```

3. **Install NuGet packages:**
   ```bash
   # API project
   dotnet add src/Dressfield.API package Microsoft.AspNetCore.Authentication.JwtBearer
   dotnet add src/Dressfield.API package Swashbuckle.AspNetCore
   dotnet add src/Dressfield.API package Serilog.AspNetCore
   dotnet add src/Dressfield.API package Serilog.Sinks.Console
   dotnet add src/Dressfield.API package Serilog.Sinks.File

   # Infrastructure project
   dotnet add src/Dressfield.Infrastructure package Pomelo.EntityFrameworkCore.MySql
   dotnet add src/Dressfield.Infrastructure package Microsoft.AspNetCore.Identity.EntityFrameworkCore
   dotnet add src/Dressfield.Infrastructure package Microsoft.EntityFrameworkCore.Design
   dotnet add src/Dressfield.Infrastructure package MailKit
   dotnet add src/Dressfield.Infrastructure package MimeKit

   # Application project
   dotnet add src/Dressfield.Application package FluentValidation
   dotnet add src/Dressfield.Application package FluentValidation.DependencyInjectionExtensions
   dotnet add src/Dressfield.Application package Mapster
   dotnet add src/Dressfield.Application package System.IdentityModel.Tokens.Jwt
   ```

4. **Create Core entities:**
   ```
   src/Dressfield.Core/
   ├── Entities/
   │   └── ApplicationUser.cs     # Extends IdentityUser with FirstName, LastName, Phone
   ├── Enums/
   │   └── UserRole.cs            # Admin, Customer
   └── Interfaces/
       ├── IAuthService.cs
       └── IEmailService.cs
   ```

5. **Create Infrastructure — DbContext:**
   ```csharp
   public class DressfieldDbContext : IdentityDbContext<ApplicationUser>
   {
       // Uses Pomelo MySQL provider
       // UTF8MB4 charset for Georgian text support
   }
   ```

6. **Configure connection string** in `appsettings.Development.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Database=dressfield_dev;User=root;Password=...;CharSet=utf8mb4"
     },
     "Jwt": {
       "Secret": "dev-secret-key-min-32-chars-long-here",
       "Issuer": "http://localhost:5000",
       "Audience": "http://localhost:3000",
       "AccessTokenExpirationMinutes": 15,
       "RefreshTokenExpirationDays": 7
     }
   }
   ```

7. **Configure Program.cs:**
   - CORS: allow `http://localhost:3000` (dev) with credentials
   - JWT Bearer authentication
   - ASP.NET Identity with EF Core
   - Serilog logging
   - Swagger for development
   - Global exception handler middleware
   - Health check endpoint: `app.MapGet("/api/health", () => Results.Ok(new { status = "healthy" }));`

8. **Create email service stub** — `DevEmailService` in Infrastructure that logs emails to console instead of sending. Implements `IEmailService`. Registered in DI for Development environment. Production uses real MailKit implementation (configured in Phase 5).

9. **Create initial migration:**
   ```bash
   dotnet ef migrations add InitialCreate -p src/Dressfield.Infrastructure -s src/Dressfield.API
   ```

9. **Seed admin user** — Create a data seeder that runs on startup (dev only):
   - Admin account: admin@dressfield.ge / (strong password from config)
   - Create "Admin" and "Customer" roles

### Verification
- [ ] `dotnet build` succeeds for entire solution
- [ ] `dotnet run` starts API on localhost:5000
- [ ] Swagger UI accessible at `/swagger`
- [ ] Database migration creates AspNetUsers, AspNetRoles tables with UTF8MB4
- [ ] Health check endpoint responds at `/api/health`

---

## Plan 3: Authentication

**Goal:** Complete auth flow — register, login, logout, password reset, JWT token management.
**Requirements covered:** AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, ADMIN-03

### Backend Steps

1. **Auth DTOs** (Application layer):
   ```csharp
   RegisterRequest { FirstName, LastName, Email, Password, ConfirmPassword, Phone? }
   LoginRequest { Email, Password }
   AuthResponse { AccessToken, User { Id, Email, FirstName, LastName, Role } }
   ForgotPasswordRequest { Email }
   ResetPasswordRequest { Email, Token, NewPassword }
   ```

2. **AuthService** (Application layer):
   - `RegisterAsync(RegisterRequest)` — Create user via Identity, assign "Customer" role, return tokens
   - `LoginAsync(LoginRequest)` — Validate credentials, generate JWT access token + refresh token
   - `RefreshTokenAsync(refreshToken)` — Validate refresh token (from httpOnly cookie), issue new access token
   - `LogoutAsync(userId)` — Revoke refresh token in database
   - `ForgotPasswordAsync(email)` — Generate reset token via Identity, send email with reset link
   - `ResetPasswordAsync(request)` — Validate token, update password via Identity

3. **JWT token generation:**
   - Access token: 15 min expiry, contains userId, email, role claims
   - Refresh token: 7 day expiry, stored in database (RefreshTokens table), sent as httpOnly secure cookie
   - Token stored in memory only (never localStorage) per PITFALLS P5.1

4. **Auth controller** (`/api/auth`):
   ```
   POST /api/auth/register     → 201 + AuthResponse + Set-Cookie (refresh)
   POST /api/auth/login        → 200 + AuthResponse + Set-Cookie (refresh)
   POST /api/auth/refresh      → 200 + AuthResponse + Set-Cookie (new refresh)
   POST /api/auth/logout       → 200 + Clear-Cookie
   POST /api/auth/forgot-password → 200 (always, don't reveal if email exists)
   POST /api/auth/reset-password  → 200
   GET  /api/auth/me           → 200 + User (validate current token)
   ```

5. **Validation** — FluentValidation rules:
   - Email: valid format, unique (register)
   - Password: min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit
   - FirstName/LastName: required, 2-50 chars
   - Phone: optional, Georgian format (+995 5XX XXX XXX)

6. **RefreshToken entity + migration:**
   ```csharp
   public class RefreshToken
   {
       public int Id { get; set; }
       public string Token { get; set; }      // hashed
       public string UserId { get; set; }
       public DateTime ExpiresAt { get; set; }
       public DateTime CreatedAt { get; set; }
       public bool IsRevoked { get; set; }
   }
   ```

### Frontend Steps

7. **Auth context** (`src/lib/auth.tsx`):
   - `AuthProvider` wraps app, initializes auth on mount via `/api/auth/refresh`
   - Stores access token in React ref (memory only)
   - Provides: `user`, `loading`, `login()`, `register()`, `logout()`, `isAdmin`
   - On mount: attempt silent refresh → if succeeds, user is authenticated; if fails, user is guest
   - Loading spinner shown until auth state resolves (prevents flash per PITFALLS P2.3)

8. **Login page** (`src/app/auth/login/page.tsx`):
   - Card layout per UI-SPEC: max-w-md, centered, mt-16
   - DressField logo at top
   - Email + Password inputs with Georgian labels
   - "შესვლა" primary button (violet)
   - "პაროლის აღდგენა" link below
   - "რეგისტრაცია" link at bottom
   - react-hook-form + zod validation
   - Error state: "ელ-ფოსტა ან პაროლი არასწორია"

9. **Register page** (`src/app/auth/register/page.tsx`):
   - Same card layout
   - Fields: FirstName + LastName (side by side on desktop), Email, Phone (optional), Password, ConfirmPassword
   - "რეგისტრაცია" primary button
   - "შესვლა" link at bottom
   - Client-side validation matching backend rules

10. **Forgot password page** (`src/app/auth/forgot-password/page.tsx`):
    - Same card layout as login
    - Email input with Georgian label
    - "პაროლის აღდგენა" primary button
    - Success state: "ბმული გამოგზავნილია" (link has been sent)
    - Link back to login page

11. **Reset password page** (`src/app/auth/reset-password/page.tsx`):
    - Reads token from URL query params
    - New Password + Confirm Password fields
    - "პაროლის შეცვლა" primary button
    - Success state: redirects to login with success toast

12. **Admin guard** (`src/app/admin/layout.tsx`):
    - Uses `useAuth()` hook
    - Shows `<Skeleton />` while loading
    - Redirects to `/auth/login` if not admin
    - Renders children if admin

### Verification
- [ ] User can register with valid Georgian name, email, and password
- [ ] User can log in and receives access token (visible in auth context, not in localStorage)
- [ ] Refreshing page maintains session (silent token refresh via httpOnly cookie)
- [ ] User can log out (cookie cleared, auth state reset)
- [ ] Invalid credentials show Georgian error message
- [ ] Admin-only route redirects unauthenticated users to login
- [ ] Swagger shows all auth endpoints with request/response schemas

---

## Plan 4: Layout Shell

**Goal:** Responsive header, footer, mobile menu, and page container matching UI-SPEC.
**Requirements covered:** UX-01, UX-02, UX-03, UX-04

### Steps

1. **Header component** (`src/components/layout/header.tsx`):
   - Full-width black bar (#0A0A0A), sticky top
   - Height: 64px desktop, 56px mobile
   - Content: max-w-7xl mx-auto, flex between
   - Left: DressField logo (text or SVG)
   - Center (desktop): Nav links — მთავარი, პროდუქცია, კატეგორიები, შეკვეთა
   - Right: Cart icon with badge count (ShoppingCart from Lucide), user avatar/login button
   - Mobile: Logo left, cart icon + hamburger right
   - Nav links use Inter font, 15px/500

2. **Mobile menu** (`src/components/layout/mobile-menu.tsx`):
   - Uses shadcn Sheet component (slide from right)
   - 80% viewport width
   - Close button at top
   - Full nav links in Georgian
   - Separator line
   - Auth links: შესვლა / რეგისტრაცია (or user info if logged in)
   - Social icons at bottom: Instagram, Facebook

3. **Footer component** (`src/components/layout/footer.tsx`):
   - Full-width dark gray (#111827), 48px vertical padding
   - 3-column grid (desktop): Brand | Navigation | Contact
   - Brand column: DressField logo + tagline in Georgian
   - Nav column: მთავარი, პროდუქცია, კატეგორიები, შეკვეთა
   - Contact column: phone, email, city
   - Social icons row: Instagram, Facebook, WhatsApp
   - Separator + copyright: "© 2026 DressField. ყველა უფლება დაცულია."
   - Mobile: stacked single column
   - Text color: #D1D5DB

4. **Page container** — Applied via root layout:
   - `max-w-7xl mx-auto`
   - Padding: `px-4 sm:px-6 lg:px-8`
   - Main content has `min-h-screen` with flex layout to push footer down

5. **Root layout** (`src/app/layout.tsx`):
   - Apply Inter + Noto Sans Georgian font variables to `<html>`
   - Wrap in `<AuthProvider>` and `<QueryClientProvider>` and `<Toaster>`
   - Structure: `<Header />` → `<main>{children}</main>` → `<Footer />`
   - Set `<html lang="ka">` for Georgian

6. **Home page placeholder** (`src/app/page.tsx`):
   - Simple hero with DressField branding
   - Georgian welcome text to verify font rendering
   - Primary CTA button to verify accent color

7. **Georgian text truncation testing** — Test all header nav links, footer text, mobile menu items, and auth form labels with Georgian strings at all breakpoints (375px, 768px, 1440px). Apply `truncate` or `overflow-hidden` where needed. Verify `line-height: 1.6` is applied to Georgian body text. (P7.2 mitigation)

### Verification
- [ ] Header is sticky, black background, correct height on mobile/desktop
- [ ] Nav links display in Georgian with correct font
- [ ] Mobile hamburger menu opens Sheet from right at 80% width
- [ ] Footer renders 3-column grid on desktop, single column on mobile
- [ ] Georgian text (ქართული) renders in Noto Sans Georgian font
- [ ] Page container is max 1280px and centered
- [ ] Cart icon shows in header (placeholder count)
- [ ] Layout passes responsive check at 375px, 768px, 1440px widths
- [ ] Unauthenticated user can access home page and layout renders without redirect
- [ ] Georgian text has no overflow/truncation issues at all breakpoints

---

## Plan 5: Deployment Pipeline

**Goal:** Both frontend and backend deployable with environment-specific configs.
**Requirements covered:** (infrastructure for all phases)

### Steps

1. **Frontend build configuration:**
   - `.env.production`: `NEXT_PUBLIC_API_URL=https://api.dressfield.ge`
   - Build: `npm run build` → generates `out/` directory
   - Add `.gitignore` entries: `node_modules/`, `out/`, `.next/`, `.env.local`

2. **Backend configuration:**
   - `appsettings.Production.json` (template only, secrets via Azure Configuration):
     ```json
     {
       "Jwt": {
         "Issuer": "https://api.dressfield.ge",
         "Audience": "https://dressfield.ge"
       }
     }
     ```
   - CORS production origin: `https://dressfield.ge`
   - Add `.gitignore` entries: `bin/`, `obj/`, `appsettings.*.json` (except template)

3. **Azure App Service setup documentation:**
   - Create doc in `Dressfield.docs/DEPLOYMENT.md`
   - Azure App Service (Basic B1 tier for Always On)
   - Configuration settings: ConnectionStrings, Jwt, CORS origins
   - Deployment via GitHub Actions or Azure DevOps (future)
   - Health check endpoint: `/api/health`

4. **Hostinger static deployment documentation:**
   - FTP upload of `out/` contents to public_html
   - `.htaccess` configuration for SPA routing (trailingSlash handles most cases)
   - SSL certificate verification
   - Document rebuild workflow: code change → `npm run build` → FTP upload

5. **GitHub Actions workflow** (`.github/workflows/build.yml`):
   - Trigger: push to main
   - Frontend job: install → build → upload artifact
   - Backend job: restore → build → test → publish → upload artifact
   - No auto-deploy for now (manual deploy in Phase 1)

6. **Environment variables documentation:**
   - Create `Dressfield.docs/ENV-VARS.md` listing all required env vars for frontend + backend
   - Mark which are secrets vs public
   - Include dev defaults

### Verification
- [ ] `npm run build` succeeds and produces `out/` directory with static files
- [ ] `dotnet publish -c Release` produces deployable backend
- [ ] GitHub Actions workflow runs on push (build only, no deploy)
- [ ] DEPLOYMENT.md documents both frontend and backend deployment steps
- [ ] No secrets committed to git (check .gitignore)

---

## Execution Order

Plans can be partially parallelized:

```
Wave 1 (parallel):
  Plan 1: Next.js Frontend Setup
  Plan 2: ASP.NET Core Backend Setup

Wave 2 (after Wave 1):
  Plan 3: Authentication (needs both frontend + backend)
  Plan 4: Layout Shell (needs frontend setup)

Wave 3 (after Wave 2):
  Plan 5: Deployment Pipeline (needs all code in place)
```

---

## Success Criteria (Phase 1)

1. ✅ User can register, log in, and see their session persist across refresh
2. ✅ Guest user can browse without authentication
3. ✅ Responsive layout renders correctly on mobile and desktop with Georgian text
4. ✅ Admin-only routes are protected (redirect to login for non-admin users)
5. ✅ Both frontend and backend build successfully (deployment docs ready)
