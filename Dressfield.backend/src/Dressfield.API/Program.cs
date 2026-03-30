using Dressfield.API.Extensions;
using Dressfield.API.Startup;

var builder = WebApplication.CreateBuilder(args);

builder
    .AddDressfieldLogging()
    .AddDressfieldProxying()
    .AddDressfieldRequestLimits()
    .AddDressfieldPersistence()
    .AddDressfieldIdentityAndAuth()
    .AddDressfieldCors()
    .AddDressfieldRateLimiting()
    .AddDressfieldApplicationServices()
    .AddDressfieldApi();

var app = builder.Build();

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

app.UseDressfieldCorrelationId();
app.UseDressfieldSecurityHeaders();
app.UseCors();
app.UseRateLimiter();
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/api/health");

await AdminSeeder.SeedAsync(app);

app.Run();

