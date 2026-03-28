using Dressfield.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Dressfield.API.Controllers;

[ApiController]
[Route("api/upload")]
public class UploadsController : ControllerBase
{
    private static readonly string[] AllowedContentTypes = ["image/jpeg", "image/png", "image/webp"];
    private static readonly string[] AllowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10 MB

    private readonly IStorageService _storage;

    public UploadsController(IStorageService storage)
    {
        _storage = storage;
    }

    /// <summary>
    /// Upload a design image (JPG/PNG/WebP, max 10 MB).
    /// Returns the public URL for use in custom order submissions.
    /// Open to all — no authentication required (guests need to upload too).
    /// </summary>
    [HttpPost("design")]
    [RequestSizeLimit(MaxFileSizeBytes + 1024)] // slight buffer for multipart headers
    public async Task<ActionResult<UploadDesignResponse>> UploadDesign(IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { message = "ფაილი არ არის მოწოდებული." });

        if (file.Length > MaxFileSizeBytes)
            return BadRequest(new { message = "ფაილის ზომა არ უნდა აღემატებოდეს 10 MB-ს." });

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(ext))
            return BadRequest(new { message = "მხოლოდ JPG, PNG ან WebP ფორმატი დასაშვებია." });

        if (!AllowedContentTypes.Contains(file.ContentType.ToLowerInvariant()))
            return BadRequest(new { message = "ფაილის ტიპი დასაშვები არ არის." });

        await using var stream = file.OpenReadStream();
        var url = await _storage.UploadAsync(stream, file.FileName, file.ContentType);

        return Ok(new UploadDesignResponse(url));
    }
}

public record UploadDesignResponse(string Url);
