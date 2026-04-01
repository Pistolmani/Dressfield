# Dressfield Deployment Guide

## Current Target Mode (Locked)

- Mode: **Pre-launch dry run**
- Scope: **Local full stack only** (frontend + backend + local MySQL)
- Payments: **Mock payment only** (do not enable real BOG iPay in this phase)
- Production cutover: **separate phase** after dry-run signoff

---

## 1) Frontend (Static Export)

### Build (deterministic)

```bash
cd Dressfield.web
npm run clean
npm run build
```

Expected output: fresh `Dressfield.web/out/` directory (static HTML/CSS/JS).

### Serve static artifact locally

```bash
cd Dressfield.web
npm run serve:static
```

Default local URL: `http://localhost:3000`

### Local frontend environment

Copy template and fill values:

```bash
cd Dressfield.web
copy .env.example .env.local
```

Required for dry run:
- `NEXT_PUBLIC_API_URL=http://localhost:5000`
- `NEXT_PUBLIC_SITE_URL=http://localhost:3000`

Optional for dry run:
- `NEXT_PUBLIC_META_PIXEL_ID` (leave empty if Pixel not being validated)

---

## 2) Backend (ASP.NET Core API)

### Local configuration

Use `appsettings.Development.json` for local run.  
Reference template file: `src/Dressfield.API/appsettings.Development.example.json`

Important dry-run rules:
- Keep `BogIPay:ClientId` and `BogIPay:ClientSecret` empty to stay in **mock payment** mode.
- Keep `AzureStorage:ConnectionString` empty in development to use local storage fallback.
- Keep `ConnectionStrings:DefaultConnection` pointed to local MySQL.

### Build

```bash
cd Dressfield.backend
dotnet build Dressfield.sln
```

### Run

```bash
cd Dressfield.backend
dotnet run --project src/Dressfield.API
```

Expected local URL: `http://localhost:5000`

### Health check

```bash
curl http://localhost:5000/api/health
```

Expected: HTTP 200 with database check healthy.

---

## 3) Local Dry-Run Sequence (End-to-End)

1. Start local MySQL.
2. Start backend at `http://localhost:5000`.
3. Build frontend static output (`npm run clean && npm run build`).
4. Serve static `out/` (`npm run serve:static`).
5. Execute smoke scenarios:
   - Browse products
   - Add to cart (single toast stream)
   - Checkout (mock payment path)
   - Order confirmation/failure pages
   - Admin login + dashboard + orders + custom orders

---

## 4) CI Note

CI frontend job uses `npm run build`, and because static export is now enforced in config, artifact generation is deterministic for `out/`.

---

## 5) Production Cutover (Not in This Batch)

The following are intentionally deferred:
- Hostinger public deployment
- Azure App Service production deploy
- Real BOG iPay keys and callback validation in production
- SMTP production configuration
- Final DNS/SSL hard cutover

Only proceed after local dry-run signoff.

