using Dressfield.Core.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Dressfield.Infrastructure.Services;

/// <summary>
/// Development-only storage service. Saves files to wwwroot/uploads and serves them via localhost.
/// Automatically used when AzureStorage:ConnectionString is empty.
/// </summary>
public class LocalStorageService : IStorageService
{
    private readonly string _uploadDir;
    private readonly string _baseUrl;

    public LocalStorageService(IConfiguration configuration)
    {
        var baseUrl = configuration["AzureStorage:LocalBaseUrl"] ?? "http://localhost:5000";
        _baseUrl = baseUrl.TrimEnd('/');

        _uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "designs");
        Directory.CreateDirectory(_uploadDir);
    }

    public async Task<string> UploadAsync(Stream fileStream, string fileName, string contentType)
    {
        var blobName = $"{Guid.NewGuid()}{Path.GetExtension(fileName)}";
        var filePath = Path.Combine(_uploadDir, blobName);

        await using var fs = new FileStream(filePath, FileMode.Create, FileAccess.Write);
        await fileStream.CopyToAsync(fs);

        return $"{_baseUrl}/uploads/designs/{blobName}";
    }

    public Task DeleteAsync(string fileUrl)
    {
        try
        {
            var fileName = Path.GetFileName(new Uri(fileUrl).LocalPath);
            var filePath = Path.Combine(_uploadDir, fileName);
            if (File.Exists(filePath))
                File.Delete(filePath);
        }
        catch
        {
            // Best-effort
        }

        return Task.CompletedTask;
    }
}
