# Environment Variables

## Frontend (Dressfield.web)

| Variable | Required | Secret | Default | Description |
|----------|----------|--------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | No | `http://localhost:5000` | Backend API base URL |

## Backend (Dressfield.API)

| Variable | Required | Secret | Default | Description |
|----------|----------|--------|---------|-------------|
| `ConnectionStrings__DefaultConnection` | Yes | Yes | — | MySQL connection string (utf8mb4) |
| `Jwt__Secret` | Yes | Yes | — | JWT signing key (min 32 chars) |
| `Jwt__Issuer` | Yes | No | `http://localhost:5000` | JWT token issuer |
| `Jwt__Audience` | Yes | No | `http://localhost:3000` | JWT token audience |
| `Jwt__AccessTokenExpirationMinutes` | No | No | `15` | Access token TTL |
| `Jwt__RefreshTokenExpirationDays` | No | No | `7` | Refresh token TTL |
| `Cors__Origins__0` | Yes | No | `http://localhost:3000` | Allowed CORS origin |
| `Admin__Email` | No | No | `admin@dressfield.ge` | Initial admin email |
| `Admin__Password` | No | Yes | Dev-only in `appsettings.Development.json` | Initial admin password |
| `AzureStorage__ConnectionString` | Yes (prod) | Yes | — | Azure Blob Storage connection string |
| `AzureStorage__ContainerName` | No | No | `designs` | Blob container for uploaded images |
| `AzureStorage__PublicBaseUrl` | No | No | — | Public CDN/base URL for blob-hosted assets |
| `AzureStorage__LocalBaseUrl` | No | No | `http://localhost:5000` | Base URL used by local filesystem fallback (development only) |
| `BogIPay__ClientId` | No | Yes | — | Bank of Georgia iPay client ID |
| `BogIPay__ClientSecret` | No | Yes | — | Bank of Georgia iPay client secret |
| `BogIPay__ApiBaseUrl` | No | No | `http://localhost:5000` | Public backend base URL used in callback URL generation |
| `BogIPay__FrontendBaseUrl` | No | No | `http://localhost:3000` | Public frontend base URL used in redirect URLs |
| `BogIPay__TokenUrl` | No | No | Official BOG OAuth URL | OAuth token endpoint |
| `BogIPay__OrdersUrl` | No | No | Official BOG orders URL | BOG ecommerce orders endpoint |
| `BogIPay__CallbackPublicKeyPem` | No | No | Built-in BOG public key | Optional override for callback signature verification key |
| `Smtp__Host` | No | No | — | SMTP host; when empty, dev email logger is used |
| `Smtp__Port` | No | No | `465` | SMTP port |
| `Smtp__Username` | No | Yes | — | SMTP username |
| `Smtp__Password` | No | Yes | — | SMTP password |
| `Smtp__FromEmail` | No | No | `noreply@dressfield.ge` | Sender email |
| `Smtp__FromName` | No | No | `DressField` | Sender display name |
| `Smtp__UseSsl` | No | No | `true` | Whether SMTP uses SSL |
| `Orders__ShippingCost` | No | No | `5.00` | Flat shipping cost in GEL |
