using Dressfield.Application.DTOs;

namespace Dressfield.Application.Interfaces;

public interface IProductService
{
    Task<IReadOnlyCollection<ProductSummaryDto>> GetActiveAsync(int? categoryId, string? search);
    Task<IReadOnlyCollection<ProductSummaryDto>> GetAdminAsync(int? categoryId, string? search);
    Task<ProductDetailDto?> GetActiveByIdAsync(int id);
    Task<ProductDetailDto?> GetActiveBySlugAsync(string slug);
    Task<ProductDetailDto?> GetAdminByIdAsync(int id);
    Task<ProductDetailDto> CreateAsync(CreateProductRequest request);
    Task<ProductDetailDto> UpdateAsync(int id, UpdateProductRequest request);
    Task DeleteAsync(int id);
}
