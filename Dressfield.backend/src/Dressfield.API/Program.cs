using System.Text;
using System.Threading.RateLimiting;
using Microsoft.Extensions.Diagnostics.HealthChecks;
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

// Logging
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .WriteTo.Console()
    .WriteTo.File("logs/dressfield-.log", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Resolve real client IP from Azure / reverse proxy (required for rate limiting)
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    // Trust all known proxies; Azure App Service manages this internally.
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

// Request body size (20 MB covers design image uploads)
builder.WebHost.ConfigureKestrel(options =>
    options.Limits.MaxRequestBodySize = 20 * 1024 * 1024);

// Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<DressfieldDbContext>(options =>
    options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 36))));

// Identity
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

// JWT authentication
// IMPORTANT: Jwt:Secret must NEVER be left as empty in production.
// Set it via Azure App Service -> Configuration -> Application settings: Jwt__Secret
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

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        var origins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>()
                      ?? ["http://localhost:3000"];
        policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod().AllowCredentials();
    });
});

// Rate limiting
builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy("auth", context =>
    {
        var ipAddress = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        return RateLimitPartition.GetFixedWindowLimiter(ipAddress, _ => new FixedWindowRateLimiterOptions
        {
            Window = TimeSpan.FromMinutes(1),
            PermitLimit = 10,
            QueueLimit = 0,
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst
        });
    });

    options.AddPolicy("orders", context =>
    {
        var ipAddress = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        return RateLimitPartition.GetFixedWindowLimiter(ipAddress, _ => new FixedWindowRateLimiterOptions
        {
            Window = TimeSpan.FromMinutes(1),
            PermitLimit = 20,
            QueueLimit = 0
        });
    });

    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

// -- Application Services ------------------------------------------------------
// Email service -- real SMTP in prod, dev logger in dev
var smtpHost = builder.Configuration["Smtp:Host"];
if (string.IsNullOrWhiteSpace(smtpHost))
    builder.Services.AddScoped<IEmailService, DevEmailService>();
else
    builder.Services.AddScoped<IEmailService, SmtpEmailService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ICustomOrderService, CustomOrderService>();
builder.Services.AddScoped<IOrderService, OrderService>();

// Storage service: Azure Blob in prod, local filesystem in dev
var azureConnectionString = builder.Configuration["AzureStorage:ConnectionString"];
if (string.IsNullOrWhiteSpace(azureConnectionString))
    builder.Services.AddScoped<IStorageService, LocalStorageService>();
else
    builder.Services.AddScoped<IStorageService, AzureBlobStorageService>();

// Payment service: real BOG iPay in prod, mock in dev
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

// Email outbox background worker
builder.Services.AddHostedService<EmailOutboxWorker>();

// Health checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<DressfieldDbContext>("database");

var app = builder.Build();

// Middleware pipeline

// Must be first: resolve real client IP from Azure load balancer.
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

// Correlation ID -- read from request or generate; echo back in response header
app.Use(async (context, next) =>
{
    const string header = "X-Correlation-Id";
    var correlationId = context.Request.Headers[header].FirstOrDefault()
        ?? Guid.NewGuid().ToString("N");
    context.Response.Headers[header] = correlationId;
    using (Serilog.Context.LogContext.PushProperty("CorrelationId", correlationId))
        await next();
});

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
app.MapHealthChecks("/api/health");

// Database seed (roles + first admin account)
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
            Log.Warning("Admin:Password not set in appsettings.Development.json -- admin user will not be seeded.");
        else
            throw new InvalidOperationException(
                "Admin:Password must be set in production via Azure environment variable Admin__Password.");
    }

    if (!string.IsNullOrWhiteSpace(adminPassword) && await userManager.FindByEmailAsync(adminEmail) == null)
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
    // Re-throw config errors; these must be fixed before the app can run.
    throw;
}
catch (Exception ex)
{
    Log.Warning(ex, "Skipping seed: database is unavailable.");
}

app.Run();

