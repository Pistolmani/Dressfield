using Dressfield.Application.DTOs;
using Dressfield.Application.Interfaces;
using Dressfield.Core.Entities;
using Dressfield.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Dressfield.Infrastructure.Services;

public class ProductService : IProductService
{
    private readonly DressfieldDbContext _db;

    public ProductService(DressfieldDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyCollection<ProductSummaryDto>> GetActiveAsync(string? search) =>
        await BuildSummaryQuery(false, search).ToListAsync();

    public async Task<IReadOnlyCollection<ProductSummaryDto>> GetAdminAsync(string? search) =>
        await BuildSummaryQuery(true, search).ToListAsync();

    public Task<ProductDetailDto?> GetActiveByIdAsync(int id) => BuildDetailQuery(false).FirstOrDefaultAsync(x => x.Id == id);
    public Task<ProductDetailDto?> GetActiveBySlugAsync(string slug) => BuildDetailQuery(false).FirstOrDefaultAsync(x => x.Slug == slug);
    public Task<ProductDetailDto?> GetAdminByIdAsync(int id) => BuildDetailQuery(true).FirstOrDefaultAsync(x => x.Id == id);

    public async Task<ProductDetailDto> CreateAsync(CreateProductRequest request)
    {
        await EnsureSlugIsUniqueAsync(request.Slug, null);
        var product = new Product
        {
            Name = request.Name.Trim(),
            Slug = request.Slug.Trim().ToLowerInvariant(),
            ShortDescription = request.ShortDescription?.Trim(),
            Description = request.Description.Trim(),
            BasePrice = request.BasePrice,
            Sku = request.Sku?.Trim(),
            IsActive = request.IsActive,
            IsFeatured = request.IsFeatured,
            Images = MapImages(request.Images),
            Variants = MapVariants(request.Variants)
        };

        _db.Products.Add(product);
        await _db.SaveChangesAsync();
        return (await GetAdminByIdAsync(product.Id))!;
    }

    public async Task<ProductDetailDto> UpdateAsync(int id, UpdateProductRequest request)
    {
        var product = await _db.Products
            .Include(x => x.Images)
            .Include(x => x.Variants)
            .FirstOrDefaultAsync(x => x.Id == id)
            ?? throw new KeyNotFoundException("პროდუქტი ვერ მოიძებნა");

        await EnsureSlugIsUniqueAsync(request.Slug, id);

        product.Name = request.Name.Trim();
        product.Slug = request.Slug.Trim().ToLowerInvariant();
        product.ShortDescription = request.ShortDescription?.Trim();
        product.Description = request.Description.Trim();
        product.BasePrice = request.BasePrice;
        product.Sku = request.Sku?.Trim();
        product.IsActive = request.IsActive;
        product.IsFeatured = request.IsFeatured;
        product.UpdatedAt = DateTime.UtcNow;

        _db.ProductImages.RemoveRange(product.Images);
        _db.ProductVariants.RemoveRange(product.Variants);
        product.Images = MapImages(request.Images);
        product.Variants = MapVariants(request.Variants);

        await _db.SaveChangesAsync();
        return (await GetAdminByIdAsync(product.Id))!;
    }

    public async Task DeleteAsync(int id)
    {
        var product = await _db.Products
            .Include(x => x.Images)
            .Include(x => x.Variants)
            .FirstOrDefaultAsync(x => x.Id == id)
            ?? throw new KeyNotFoundException("პროდუქტი ვერ მოიძებნა");

        _db.Products.Remove(product);
        await _db.SaveChangesAsync();
    }

    private IQueryable<ProductSummaryDto> BuildSummaryQuery(bool includeInactive, string? search)
    {
        var query = _db.Products.AsNoTracking().Include(x => x.Images).AsQueryable();

        if (!includeInactive)
        {
            query = query.Where(x => x.IsActive);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalized = search.Trim().ToLower();
            query = query.Where(x => x.Name.ToLower().Contains(normalized) || x.Description.ToLower().Contains(normalized));
        }

        return query
            .OrderByDescending(x => x.IsFeatured)
            .ThenBy(x => x.Name)
            .Select(x => new ProductSummaryDto(
                x.Id,
                x.Name,
                x.Slug,
                x.ShortDescription,
                x.BasePrice,
                x.Images.OrderBy(i => i.SortOrder).Select(i => i.ImageUrl).FirstOrDefault(),
                x.IsActive,
                x.IsFeatured));
    }

    private IQueryable<ProductDetailDto> BuildDetailQuery(bool includeInactive)
    {
        var query = _db.Products
            .AsNoTracking()
            .Include(x => x.Images)
            .Include(x => x.Variants)
            .AsQueryable();

        if (!includeInactive)
        {
            query = query.Where(x => x.IsActive);
        }

        return query.Select(x => new ProductDetailDto(
            x.Id,
            x.Name,
            x.Slug,
            x.ShortDescription,
            x.Description,
            x.BasePrice,
            x.Sku,
            x.IsActive,
            x.IsFeatured,
            x.Images.OrderBy(i => i.SortOrder).Select(i => new ProductImageDto(i.Id, i.ImageUrl, i.AltText, i.SortOrder, i.IsPrimary)).ToList(),
            x.Variants.OrderBy(v => v.Name).Select(v => new ProductVariantDto(v.Id, v.Name, v.Value, v.Sku, v.PriceAdjustment, v.StockQuantity, v.IsActive)).ToList()));
    }

    private async Task EnsureSlugIsUniqueAsync(string slug, int? currentId)
    {
        var normalized = slug.Trim().ToLowerInvariant();
        var exists = await _db.Products.AnyAsync(x => x.Slug == normalized && (!currentId.HasValue || x.Id != currentId.Value));
        if (exists)
        {
            throw new InvalidOperationException("ამ slug-ით პროდუქტი უკვე არსებობს");
        }
    }

    private static List<ProductImage> MapImages(IReadOnlyCollection<CreateProductImageRequest>? requests) =>
        requests?.Select(x => new ProductImage
        {
            ImageUrl = x.ImageUrl.Trim(),
            AltText = x.AltText?.Trim(),
            SortOrder = x.SortOrder,
            IsPrimary = x.IsPrimary
        }).ToList() ?? new List<ProductImage>();

    private static List<ProductVariant> MapVariants(IReadOnlyCollection<CreateProductVariantRequest>? requests) =>
        requests?.Select(x => new ProductVariant
        {
            Name = x.Name.Trim(),
            Value = x.Value?.Trim(),
            Sku = x.Sku?.Trim(),
            PriceAdjustment = x.PriceAdjustment,
            StockQuantity = x.StockQuantity,
            IsActive = x.IsActive
        }).ToList() ?? new List<ProductVariant>();
}
