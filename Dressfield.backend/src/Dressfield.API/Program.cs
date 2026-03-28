using System.Text;
using System.Threading.RateLimiting;
using Dressfield.Application.Interfaces;
using Dressfield.Core.Entities;
using Dressfield.Core.Interfaces;
using Dressfield.Infrastructure.Data;
using Dressfield.Infrastructure.Services;
using Dressfield.Application.DTOs;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// ── Logging ───────────────────────────────────────────────────────────────────
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .WriteTo.Console()
    .WriteTo.File("logs/dressfield-.log", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// ── Resolve real client IP from Azure / reverse proxy (required for rate limiting) ──
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    // Trust all known proxies — Azure App Service manages this internally
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

// ── Request body size (20 MB — covers design image uploads) ──────────────────
builder.WebHost.ConfigureKestrel(options =>
    options.Limits.MaxRequestBodySize = 20 * 1024 * 1024);

// ── Database ──────────────────────────────────────────────────────────────────
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<DressfieldDbContext>(options =>
    options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 36))));

// ── Identity ──────────────────────────────────────────────────────────────────
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
    {
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequiredLength = 8;
        options.User.RequireUniqueEmail = true;
    })
    .AddEntityFrameworkStores<DressfieldDbContext>()
    .AddDefaultTokenProviders();

// ── JWT Authentication ────────────────────────────────────────────────────────
// IMPORTANT: Jwt:Secret must NEVER be left as empty in production.
// Set it via Azure App Service → Configuration → Application settings: Jwt__Secret
var jwtSecret = builder.Configuration["Jwt:Secret"];
if (string.IsNullOrWhiteSpace(jwtSecret) || jwtSecret.Length < 32)
    throw new InvalidOperationException(
        "Jwt:Secret is missing or too short (min 32 chars). " +
        "Set it via Azure environment variable Jwt__Secret. " +
        "For local dev, add it to appsettings.Development.json.");

var jwtIssuer   = builder.Configuration["Jwt:Issuer"]!;
var jwtAudience = builder.Configuration["Jwt:Audience"]!;

builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = jwtIssuer,
            ValidAudience            = jwtAudience,
            IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ClockSkew                = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// ── CORS ──────────────────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        var origins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>()
                      ?? ["http://localhost:3000"];
        policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod().AllowCredentials();
    });
});

// ── Rate Limiting ─────────────────────────────────────────────────────────────
builder.Services.AddRateLimiter(options =>
{
    // Auth endpoints — 10 requests per minute per IP (prevents brute-force)
    options.AddFixedWindowLimiter("auth", o =>
    {
        o.Window              = TimeSpan.FromMinutes(1);
        o.PermitLimit         = 10;
        o.QueueLimit          = 0;
        o.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
    });

    // Order creation — 20 requests per minute per IP (prevents order flooding)
    options.AddFixedWindowLimiter("orders", o =>
    {
        o.Window      = TimeSpan.FromMinutes(1);
        o.PermitLimit = 20;
        o.QueueLimit  = 0;
    });

    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

// ── Application Services ──────────────────────────────────────────────────────
builder.Services.AddScoped<IEmailService, DevEmailService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ICustomOrderService, CustomOrderService>();
builder.Services.AddScoped<IOrderService, OrderService>();

// Storage service — Azure Blob in prod, local filesystem in dev
var azureConnectionString = builder.Configuration["AzureStorage:ConnectionString"];
if (string.IsNullOrWhiteSpace(azureConnectionString))
    builder.Services.AddScoped<IStorageService, LocalStorageService>();
else
    builder.Services.AddScoped<IStorageService, AzureBlobStorageService>();

// Payment service — real BOG iPay in prod, mock in dev
var bogClientId = builder.Configuration["BogIPay:ClientId"];
if (string.IsNullOrWhiteSpace(bogClientId))
{
    builder.Services.AddScoped<IPaymentService, MockPaymentService>();
}
else
{
    builder.Services.AddHttpClient<BogIPayService>();
    builder.Services.AddScoped<IPaymentService, BogIPayService>();
}

builder.Services.AddValidatorsFromAssemblyContaining<Dressfield.Application.DTOs.RegisterRequest>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ── Middleware pipeline ───────────────────────────────────────────────────────

// Must be first — resolve real client IP from Azure load balancer
app.UseForwardedHeaders();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    // Azure App Service terminates TLS at the edge, but enforce at app layer too
    app.UseHttpsRedirection();
}

// Security response headers (applied to every response)
app.Use(async (context, next) =>
{
    var headers = context.Response.Headers;
    headers["X-Content-Type-Options"] = "nosniff";          // No MIME sniffing
    headers["X-Frame-Options"]        = "DENY";             // No clickjacking
    headers["Referrer-Policy"]        = "strict-origin-when-cross-origin";
    headers["X-XSS-Protection"]       = "0";                // Disable legacy XSS auditor
    headers["Permissions-Policy"]     = "geolocation=(), camera=(), microphone=()";
    await next();
});

app.UseCors();
app.UseRateLimiter();
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapGet("/api/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

// ── Database seed (roles + first admin account) ───────────────────────────────
try
{
    using var scope       = app.Services.CreateScope();
    var roleManager       = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager       = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

    string[] roles = ["Admin", "Customer"];
    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
            await roleManager.CreateAsync(new IdentityRole(role));
    }

    var adminEmail    = builder.Configuration["Admin:Email"] ?? "admin@dressfield.ge";
    var adminPassword = builder.Configuration["Admin:Password"];

    if (string.IsNullOrWhiteSpace(adminPassword))
    {
        if (app.Environment.IsDevelopment())
        {
            // Acceptable dev default — never reaches production
            adminPassword = "Admin123!@#";
            Log.Warning("Admin:Password not configured — using dev default. Never deploy this to production.");
        }
        else
        {
            // Hard fail in production — no fallback password ever
            throw new InvalidOperationException(
                "Admin:Password must be set in production via Azure environment variable Admin__Password.");
        }
    }

    if (await userManager.FindByEmailAsync(adminEmail) == null)
    {
        var admin = new ApplicationUser
        {
            UserName       = adminEmail,
            Email          = adminEmail,
            FirstName      = "Admin",
            LastName       = "Dressfield",
            EmailConfirmed = true
        };
        var result = await userManager.CreateAsync(admin, adminPassword);
        if (result.Succeeded)
            await userManager.AddToRoleAsync(admin, "Admin");
        else
            Log.Error("Failed to create admin user: {Errors}", string.Join(", ", result.Errors.Select(e => e.Description)));
    }
}
catch (InvalidOperationException)
{
    // Re-throw config errors — these must be fixed before the app can run
    throw;
}
catch (Exception ex)
{
    Log.Warning(ex, "Skipping seed — database is unavailable.");
}

app.Run();
