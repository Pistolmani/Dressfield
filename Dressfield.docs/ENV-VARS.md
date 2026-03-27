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
| `Admin__Password` | No | Yes | `Admin123!@#` | Initial admin password |
