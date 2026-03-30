# Stack Research: Dressfield Embroidery E-Commerce

**Researched:** 2026-03-27
**Domain:** Embroidery e-commerce, Georgian market

## Runtime & Framework Versions

| Technology | Version | Confidence | Notes |
|-----------|---------|------------|-------|
| .NET | 8.0 LTS | High | Long-term support until Nov 2026 |
| ASP.NET Core | 8.0 | High | Matches .NET version |
| Next.js | 15.x | High | Latest stable with App Router |
| Node.js | 20 LTS | High | Required for Next.js build tooling |
| TypeScript | 5.7.x | High | Latest stable |
| MySQL | 8.0 | High | Matches Hostinger default |
| EF Core | 8.0 | High | Matches .NET version |

## Backend NuGet Packages

### Core Framework
| Package | Purpose | Confidence |
|---------|---------|------------|
| `Pomelo.EntityFrameworkCore.MySql` | MySQL provider for EF Core (better than Oracle's official provider) | High |
| `Microsoft.AspNetCore.Identity.EntityFrameworkCore` | User management, password hashing, role-based auth | High |
| `Microsoft.AspNetCore.Authentication.JwtBearer` | JWT token validation middleware | High |
| `System.IdentityModel.Tokens.Jwt` | JWT token generation | High |

### Business Logic
| Package | Purpose | Confidence |
|---------|---------|------------|
| `Helix.BankOfGeorgia.IpayClient` 1.7.0 | BOG iPay integration with automatic token management | High |
| `FluentValidation.AspNetCore` | Request DTO validation with clear rules | High |
| `Mapster` | Object mapping (lighter than AutoMapper, actively maintained) | High |

### Infrastructure
| Package | Purpose | Confidence |
|---------|---------|------------|
| `Azure.Storage.Blobs` | Image upload to Azure Blob Storage | High |
| `SixLabors.ImageSharp` | Server-side image processing (resize, optimize, validate) | High |
| `MailKit` + `MimeKit` | SMTP email sending (more reliable than System.Net.Mail) | High |
| `Serilog.AspNetCore` | Structured logging | High |
| `Serilog.Sinks.Console` | Console log output for development | High |
| `Serilog.Sinks.File` | File log output for production | High |

### Development
| Package | Purpose | Confidence |
|---------|---------|------------|
| `Swashbuckle.AspNetCore` | Swagger/OpenAPI documentation | High |
| `Microsoft.EntityFrameworkCore.Design` | EF Core migrations CLI | High |

## Frontend npm Packages

### Core
| Package | Purpose | Confidence |
|---------|---------|------------|
| `next` 15.x | React framework with static export | High |
| `react` + `react-dom` 19.x | UI library | High |
| `typescript` 5.7.x | Type safety | High |

### Styling & UI
| Package | Purpose | Confidence |
|---------|---------|------------|
| `tailwindcss` 4.x | Utility-first CSS | High |
| `@radix-ui/*` | Accessible UI primitives (via shadcn/ui) | High |
| `class-variance-authority` | Component variant management (shadcn dependency) | High |
| `clsx` + `tailwind-merge` | Conditional class names | High |
| `lucide-react` | Icon library (tree-shakeable, consistent) | High |
| `sonner` | Toast notifications (lightweight, accessible) | Medium |

### State & Data
| Package | Purpose | Confidence |
|---------|---------|------------|
| `@tanstack/react-query` 5.x | Server state management (products, orders, auth) | High |
| `zustand` 5.x | Client state (cart, UI state) — minimal API, no boilerplate | High |
| `axios` | HTTP client with interceptors for JWT refresh | High |

### Forms & Validation
| Package | Purpose | Confidence |
|---------|---------|------------|
| `react-hook-form` | Performant form handling | High |
| `zod` | Schema validation (shared with TypeScript types) | High |
| `@hookform/resolvers` | Connects zod schemas to react-hook-form | High |

### Custom Design Features
| Package | Purpose | Confidence |
|---------|---------|------------|
| `react-dropzone` | Drag-and-drop file upload UI | High |
| `konva` + `react-konva` | Canvas-based design editor and product mockup preview | High |

**Why Konva over Fabric.js:**
- Konva has first-class React bindings (`react-konva`)
- Declarative API matches React mental model
- Smaller bundle size
- Better TypeScript support
- Fabric.js is more powerful but imperative and harder to integrate with React

### SEO & Analytics
| Package | Purpose | Confidence |
|---------|---------|------------|
| `next-sitemap` | XML sitemap + robots.txt generation at build time | High |
| `schema-dts` | TypeScript types for JSON-LD structured data | Medium |

### Utilities
| Package | Purpose | Confidence |
|---------|---------|------------|
| `date-fns` | Date formatting (tree-shakeable, no Moment.js) | High |
| `sharp` | Build-time image optimization (used by next-sitemap, optional for manual optimization) | Medium |

## What NOT to Use

| Library | Why Not |
|---------|---------|
| **Redux / Redux Toolkit** | Overkill for this project. TanStack Query handles server state, Zustand handles client state. Redux adds boilerplate without benefit. |
| **Material UI / Chakra UI** | Heavy bundle size, opinionated design that's hard to customize. Tailwind + shadcn/ui is lighter and more flexible. |
| **NextAuth.js** | Requires server-side sessions — incompatible with static export. Using ASP.NET Identity + JWT instead. |
| **AutoMapper (.NET)** | Reflection-heavy, recently archived. Mapster is faster and actively maintained. |
| **MediatR** | CQRS pattern is over-engineering for a small e-commerce app. Direct service calls are simpler and sufficient. |
| **Fabric.js** | Imperative API doesn't fit React well. Konva + react-konva provides declarative React bindings. |
| **Framer Motion** | Large bundle size for animations. CSS transitions + Tailwind animations sufficient for e-commerce. |
| **Moment.js** | Deprecated, huge bundle. Use date-fns instead. |
| **jQuery** | No need in a React application. |

## Development Tools

| Tool | Purpose |
|------|---------|
| `turbopack` | Next.js dev server bundler (built-in, faster than webpack) |
| `eslint` 9.x + `@eslint/js` | Linting with flat config |
| `prettier` + `prettier-plugin-tailwindcss` | Code formatting with Tailwind class sorting |
| `husky` + `lint-staged` | Pre-commit hooks for linting/formatting |
| `dotnet watch` | Hot reload for ASP.NET Core during development |

## Key Configuration

### next.config.js (static export)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true }, // Required for static export
  trailingSlash: true,           // Better for static hosting
}
module.exports = nextConfig
```

### Environment Variables
```
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://api.dressfield.ge
NEXT_PUBLIC_META_PIXEL_ID=your-pixel-id

# Backend (appsettings.json / Azure Configuration)
ConnectionStrings__DefaultConnection=Server=...;Database=dressfield;...
Jwt__Secret=...
Jwt__Issuer=https://api.dressfield.ge
BankOfGeorgia__ClientId=...
BankOfGeorgia__SecretKey=...
BankOfGeorgia__BaseUrl=https://ipay.ge/opay/api/v1
AzureBlobStorage__ConnectionString=...
AzureBlobStorage__ContainerName=images
Smtp__Host=smtp.hostinger.com
Smtp__Port=465
```

---
*Research completed: 2026-03-27*
