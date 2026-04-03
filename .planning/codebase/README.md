# Dressfield Codebase Documentation

This directory contains comprehensive technical documentation about the Dressfield platform's architecture, technology stack, and external integrations.

## Documents

### [STACK.md](./STACK.md)
Complete technology stack documentation covering:
- **Frontend Stack** — Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Zustand, Axios
- **Backend Stack** — ASP.NET Core 9, Entity Framework Core, FluentValidation, Serilog, JWT
- **Database** — MySQL 8.0.36 with Entity Framework ORM
- **Build & Deployment** — Build tools, deployment targets, versioning

Use this document to understand:
- Which libraries and frameworks power Dressfield
- Version numbers and purpose of each dependency
- Architectural decisions and constraints
- Development and production configurations

### [INTEGRATIONS.md](./INTEGRATIONS.md)
External services and third-party integrations documentation covering:
- **Payment Processing** — Bank of Georgia (BOG) iPay OAuth2 + REST API flow
- **Analytics** — Meta Pixel (Facebook Pixel) event tracking
- **Cloud Storage** — Azure Blob Storage for design uploads
- **Email** — SMTP via MailKit for notifications
- **Database** — MySQL 8.0 connection configuration
- **Security** — ClamAV malware scanning (optional)
- **Authentication** — JWT token issuance and refresh
- **Webhooks** — BOG payment callbacks and processing

Use this document to understand:
- How external services are configured
- Integration flows and API contracts
- Security considerations for each service
- Environment variables and deployment requirements
- Error handling and fallback mechanisms

## Quick Reference

### Tech Stack Overview
```
Frontend: Next.js 16 + React 19 + TypeScript + Tailwind CSS + shadcn/ui
State: TanStack Query 5.95 + Zustand 5.0
Backend: ASP.NET Core 9 + Entity Framework Core 9
Database: MySQL 8.0.36
Auth: JWT tokens + ASP.NET Identity
Payments: Bank of Georgia iPay
Analytics: Meta Pixel
Storage: Azure Blob Storage
Email: MailKit SMTP
```

### Key Constraints
- **Static Export:** Frontend is pre-rendered to static HTML/CSS/JS (no SSR, no dynamic routes)
- **Separate Deployments:** Frontend (Hostinger) and Backend (Azure) deployed independently
- **Stateless Auth:** JWT-based, no session cookies
- **Rate Limiting:** Per-IP limits on auth (10/min), orders (20/min), uploads (12/min)
- **File Uploads:** 20 MB maximum request body size for design images

### Architecture Diagram (Conceptual)
```
User Browser
     ↓
Hostinger (Frontend Static Export)
     ↓
Azure App Service (ASP.NET Core API)
     ↓
Hostinger MySQL 8.0 (Database)
     ↓
Azure Blob Storage (Design Images)
     ↓
Bank of Georgia OAuth2 (Payments)
     ↓
Meta Pixel (Analytics)
     ↓
SMTP Service (Email)
```

## Configuration Environments

### Development
- Frontend: `npm run dev` (Next.js dev server on :3000)
- Backend: `dotnet run` (Kestrel on :5000)
- Database: Local MySQL or Docker
- Payments: MockPaymentService (always succeeds)
- Email: DevEmailService (logs to console)
- Storage: LocalStorageService (filesystem)

### Production
- Frontend: Static export to Hostinger (`./out/` directory)
- Backend: Azure App Service
- Database: Hostinger MySQL 8.0.36
- Payments: Real Bank of Georgia iPay
- Email: SMTP (Gmail, SendGrid, or company mail server)
- Storage: Azure Blob Storage
- Scanning: ClamAV (optional, recommended)

## Getting Started for Developers

1. **Read STACK.md first** to understand the technology choices and why each library was selected
2. **Then read INTEGRATIONS.md** to understand how the system connects to external services
3. **Clone the repository:**
   ```bash
   git clone <repo>
   cd Dressfield
   ```
4. **Frontend setup:**
   ```bash
   cd Dressfield.web
   npm install
   npm run dev
   ```
5. **Backend setup:**
   ```bash
   cd ../Dressfield.backend
   dotnet restore
   dotnet run
   ```
6. **Database setup:** Create MySQL database, run migrations via `dotnet ef database update`

## Deployment Checklist

See **INTEGRATIONS.md → Environment Configuration Checklist** for production deployment requirements.

## Questions?

- **Tech stack questions?** → Check STACK.md
- **Integration questions?** → Check INTEGRATIONS.md
- **Deployment questions?** → Check both documents + .planning/ROADMAP.md
- **Architecture decisions?** → Check .planning/PROJECT.md

---

**Last Updated:** 2026-04-01
**Scope:** Dressfield MVP (Phase 1 complete, soft-launch ready)
