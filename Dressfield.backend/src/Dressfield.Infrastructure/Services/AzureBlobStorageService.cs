using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Dressfield.Core.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Dressfield.Infrastructure.Services;

public class AzureBlobStorageService : IStorageService
{
    private readonly BlobContainerClient _container;
    private readonly string? _publicBaseUrl;

    public AzureBlobStorageService(IConfiguration configuration)
    {
        var connectionString = configuration["AzureStorage:ConnectionString"]
            ?? throw new InvalidOperationException("AzureStorage:ConnectionString is not configured.");

        var containerName = configuration["AzureStorage:ContainerName"] ?? "designs";

        _publicBaseUrl = configuration["AzureStorage:PublicBaseUrl"]?.TrimEnd('/');

        _container = new BlobContainerClient(connectionString, containerName);
        _container.CreateIfNotExists(PublicAccessType.Blob);
    }

    public async Task<string> UploadAsync(Stream fileStream, string fileName, string contentType)
    {
        var blobName = $"{Guid.NewGuid()}{Path.GetExtension(fileName)}";
        var blobClient = _container.GetBlobClient(blobName);

        await blobClient.UploadAsync(fileStream, new BlobHttpHeaders { ContentType = contentType });

        // Use CDN base URL if configured, otherwise use the native blob URL
        if (!string.IsNullOrEmpty(_publicBaseUrl))
            return $"{_publicBaseUrl}/{_container.Name}/{blobName}";

        return blobClient.Uri.ToString();
    }

    public async Task DeleteAsync(string fileUrl)
    {
        try
        {
            var uri = new Uri(fileUrl);
            var blobName = Path.GetFileName(uri.LocalPath);
            var blobClient = _container.GetBlobClient(blobName);
            await blobClient.DeleteIfExistsAsync();
        }
        catch
        {
            // Silently ignore — deletion is best-effort
        }
    }
}
