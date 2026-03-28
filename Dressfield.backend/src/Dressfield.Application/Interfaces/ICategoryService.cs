using Dressfield.Application.DTOs;

namespace Dressfield.Application.Interfaces;

public interface ICategoryService
{
    Task<IReadOnlyCollection<CategoryDto>> GetActiveAsync();
    Task<IReadOnlyCollection<CategoryDto>> GetAdminAsync();
    Task<CategoryDto?> GetActiveByIdAsync(int id);
    Task<CategoryDto?> GetAdminByIdAsync(int id);
    Task<CategoryDto> CreateAsync(CreateCategoryRequest request);
    Task<CategoryDto> UpdateAsync(int id, UpdateCategoryRequest request);
    Task DeleteAsync(int id);
}
