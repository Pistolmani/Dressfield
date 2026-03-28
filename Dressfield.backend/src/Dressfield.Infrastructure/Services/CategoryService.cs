using Dressfield.Application.DTOs;
using Dressfield.Application.Interfaces;
using Dressfield.Core.Entities;
using Dressfield.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Dressfield.Infrastructure.Services;

public class CategoryService : ICategoryService
{
    private readonly DressfieldDbContext _db;

    public CategoryService(DressfieldDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyCollection<CategoryDto>> GetActiveAsync() => await Query(includeInactive: false).ToListAsync();
    public async Task<IReadOnlyCollection<CategoryDto>> GetAdminAsync() => await Query(includeInactive: true).ToListAsync();
    public Task<CategoryDto?> GetActiveByIdAsync(int id) => Query(includeInactive: false).FirstOrDefaultAsync(x => x.Id == id);
    public Task<CategoryDto?> GetAdminByIdAsync(int id) => Query(includeInactive: true).FirstOrDefaultAsync(x => x.Id == id);

    public async Task<CategoryDto> CreateAsync(CreateCategoryRequest request)
    {
        await EnsureSlugIsUniqueAsync(request.Slug, null);
        var category = new Category { Name = request.Name.Trim(), Slug = request.Slug.Trim().ToLowerInvariant(), Description = request.Description?.Trim(), DisplayOrder = request.DisplayOrder, IsActive = request.IsActive };
        _db.Categories.Add(category);
        await _db.SaveChangesAsync();
        return (await GetAdminByIdAsync(category.Id))!;
    }

    public async Task<CategoryDto> UpdateAsync(int id, UpdateCategoryRequest request)
    {
        var category = await _db.Categories.FirstOrDefaultAsync(x => x.Id == id) ?? throw new KeyNotFoundException("კატეგორია ვერ მოიძებნა");
        await EnsureSlugIsUniqueAsync(request.Slug, id);
        category.Name = request.Name.Trim();
        category.Slug = request.Slug.Trim().ToLowerInvariant();
        category.Description = request.Description?.Trim();
        category.DisplayOrder = request.DisplayOrder;
        category.IsActive = request.IsActive;
        category.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return (await GetAdminByIdAsync(category.Id))!;
    }

    public async Task DeleteAsync(int id)
    {
        var category = await _db.Categories.Include(x => x.Products).FirstOrDefaultAsync(x => x.Id == id) ?? throw new KeyNotFoundException("კატეგორია ვერ მოიძებნა");
        if (category.Products.Count > 0) throw new InvalidOperationException("კატეგორიას პროდუქტები აქვს და წაშლა შეუძლებელია");
        _db.Categories.Remove(category);
        await _db.SaveChangesAsync();
    }

    private IQueryable<CategoryDto> Query(bool includeInactive)
    {
        var query = _db.Categories.AsNoTracking();
        if (!includeInactive) query = query.Where(x => x.IsActive);
        return query.OrderBy(x => x.DisplayOrder).ThenBy(x => x.Name).Select(x => new CategoryDto(x.Id, x.Name, x.Slug, x.Description, x.DisplayOrder, x.IsActive, x.Products.Count));
    }

    private async Task EnsureSlugIsUniqueAsync(string slug, int? currentId)
    {
        var normalized = slug.Trim().ToLowerInvariant();
        var exists = await _db.Categories.AnyAsync(x => x.Slug == normalized && (!currentId.HasValue || x.Id != currentId.Value));
        if (exists) throw new InvalidOperationException("ამ slug-ით კატეგორია უკვე არსებობს");
    }
}
