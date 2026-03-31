# Dressfield Deployment Guide

## Frontend (Hostinger)

**Type:** Static files (Next.js static export)

### Build
```bash
cd Dressfield.web
npm run build
```
Output: `out/` directory with static HTML/CSS/JS

### Deploy
1. FTP/SFTP to Hostinger `public_html/`
2. Upload contents of `out/` to `public_html/`
3. Ensure `.htaccess` handles routing:

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### Environment
- `NEXT_PUBLIC_API_URL` — Backend API URL (baked at build time)

---

## Backend (Azure App Service)

**Type:** ASP.NET Core Web API (.NET 9)
**Tier:** Basic B1 (Always On enabled)

### Build
```bash
cd Dressfield.backend
dotnet publish src/Dressfield.API -c Release -o ./publish
```

### Deploy
1. Create Azure App Service (Linux, .NET 9)
2. Configure Application Settings:
   - `ConnectionStrings__DefaultConnection` — MySQL connection string
   - `Jwt__Secret` — Min 32 char secret key
   - `Jwt__Issuer` — `https://api.dressfield.ge`
   - `Jwt__Audience` — `https://dressfield.ge`
   - `Cors__Origins__0` — `https://dressfield.ge`
   - `AzureStorage__ConnectionString` — Azure Blob Storage connection string
   - `AzureStorage__ContainerName` — `designs` (or your preferred container)
   - `AzureStorage__PublicBaseUrl` — optional CDN/base URL for public assets
3. Deploy via GitHub Actions or Azure CLI

### Image Storage Notes
- In production, image uploads are expected to use Azure Blob Storage.
- If `AzureStorage__ConnectionString` is missing outside development, API startup now fails fast by design.
- Quick verification endpoint after deploy: `POST /api/upload/design` with a test image and confirm URL host points to Azure/CDN.

### Health Check
- Endpoint: `/api/health`
- Configure in Azure Portal > Health Check

---

## Environments

| Environment | Frontend | Backend | Database |
|------------|----------|---------|----------|
| Development | localhost:3000 | localhost:5000 | localhost MySQL |
| Production | dressfield.ge (Hostinger) | api.dressfield.ge (Azure) | Hostinger MySQL |

---

## SSL
- Frontend: Hostinger provides free SSL
- Backend: Azure App Service provides managed SSL
- Ensure all cookies use `Secure` flag in production

