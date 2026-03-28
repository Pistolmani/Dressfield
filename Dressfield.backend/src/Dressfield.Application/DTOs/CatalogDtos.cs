namespace Dressfield.Application.DTOs;

public record CategoryDto(int Id, string Name, string Slug, string? Description, int DisplayOrder, bool IsActive, int ProductCount);
public record CreateCategoryRequest(string Name, string Slug, string? Description, int DisplayOrder, bool IsActive);
public record UpdateCategoryRequest(string Name, string Slug, string? Description, int DisplayOrder, bool IsActive);

public record ProductImageDto(int Id, string ImageUrl, string? AltText, int SortOrder, bool IsPrimary);
public record ProductVariantDto(int Id, string Name, string? Value, string? Sku, decimal PriceAdjustment, int StockQuantity, bool IsActive);

public record ProductSummaryDto(int Id, int CategoryId, string CategoryName, string Name, string Slug, string? ShortDescription, decimal BasePrice, string? PrimaryImageUrl, bool IsActive, bool IsFeatured);

public record ProductDetailDto(int Id, int CategoryId, string CategoryName, string CategorySlug, string Name, string Slug, string? ShortDescription, string Description, decimal BasePrice, string? Sku, bool IsActive, bool IsFeatured, IReadOnlyCollection<ProductImageDto> Images, IReadOnlyCollection<ProductVariantDto> Variants);

public record CreateProductImageRequest(string ImageUrl, string? AltText, int SortOrder, bool IsPrimary);
public record CreateProductVariantRequest(string Name, string? Value, string? Sku, decimal PriceAdjustment, int StockQuantity, bool IsActive);
public record CreateProductRequest(int CategoryId, string Name, string Slug, string? ShortDescription, string Description, decimal BasePrice, string? Sku, bool IsActive, bool IsFeatured, IReadOnlyCollection<CreateProductImageRequest>? Images, IReadOnlyCollection<CreateProductVariantRequest>? Variants);
public record UpdateProductRequest(int CategoryId, string Name, string Slug, string? ShortDescription, string Description, decimal BasePrice, string? Sku, bool IsActive, bool IsFeatured, IReadOnlyCollection<CreateProductImageRequest>? Images, IReadOnlyCollection<CreateProductVariantRequest>? Variants);
