using Dressfield.Application.DTOs;
using Dressfield.Application.Interfaces;
using Dressfield.Core.Entities;
using Dressfield.Core.Enums;
using Dressfield.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Dressfield.Infrastructure.Services;

public class CustomOrderService : ICustomOrderService
{
    private readonly DressfieldDbContext _db;

    public CustomOrderService(DressfieldDbContext db)
    {
        _db = db;
    }

    // ── Admin ────────────────────────────────────────────────────────────────

    public async Task<IReadOnlyCollection<CustomOrderSummaryDto>> GetAdminAsync(CustomOrderStatus? status)
    {
        var query = _db.CustomOrders
            .AsNoTracking()
            .Include(o => o.BaseProduct)
            .AsQueryable();

        if (status.HasValue)
            query = query.Where(o => o.Status == status.Value);

        return await query
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => MapToSummary(o))
            .ToListAsync();
    }

    public Task<CustomOrderDetailDto?> GetAdminByIdAsync(int id) =>
        BuildDetailQuery().FirstOrDefaultAsync(o => o.Id == id);

    public async Task UpdateStatusAsync(int id, UpdateCustomOrderStatusRequest request)
    {
        var order = await _db.CustomOrders.FindAsync(id)
            ?? throw new KeyNotFoundException("შეკვეთა ვერ მოიძებნა");

        order.Status = request.Status;
        order.AdminNotes = request.AdminNotes?.Trim();
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
    }

    // ── Customer ─────────────────────────────────────────────────────────────

    public async Task<IReadOnlyCollection<CustomOrderSummaryDto>> GetByUserAsync(string userId)
    {
        return await _db.CustomOrders
            .AsNoTracking()
            .Include(o => o.BaseProduct)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => MapToSummary(o))
            .ToListAsync();
    }

    public Task<CustomOrderDetailDto?> GetByIdForUserAsync(int id, string userId) =>
        BuildDetailQuery().FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

    // ── Public ───────────────────────────────────────────────────────────────

    public async Task<CustomOrderDetailDto> CreateAsync(CreateCustomOrderRequest request, string? userId)
    {
        if (request.BaseProductId.HasValue)
        {
            var productExists = await _db.Products.AnyAsync(p => p.Id == request.BaseProductId.Value && p.IsActive);
            if (!productExists)
                throw new KeyNotFoundException("არჩეული პროდუქტი ვერ მოიძებნა");
        }

        var order = new CustomOrder
        {
            UserId = userId,
            BaseProductId = request.BaseProductId,
            ContactName = request.ContactName.Trim(),
            ContactPhone = request.ContactPhone.Trim(),
            ContactEmail = request.ContactEmail.Trim().ToLowerInvariant(),
            TotalPrice = request.TotalPrice,
            CustomerNotes = request.CustomerNotes?.Trim(),
            Status = CustomOrderStatus.Pending,
            Designs = request.Designs.Select((d, i) => new CustomOrderDesign
            {
                DesignImageUrl = d.DesignImageUrl.Trim(),
                Placement = d.Placement?.Trim(),
                Size = d.Size?.Trim(),
                ThreadColor = d.ThreadColor?.Trim(),
                Width = d.Width,
                Height = d.Height,
                PositionX = d.PositionX,
                PositionY = d.PositionY,
                SortOrder = d.SortOrder
            }).ToList()
        };

        _db.CustomOrders.Add(order);
        await _db.SaveChangesAsync();

        return (await GetAdminByIdAsync(order.Id))!;
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private IQueryable<CustomOrderDetailDto> BuildDetailQuery() =>
        _db.CustomOrders
            .AsNoTracking()
            .Include(o => o.BaseProduct)
            .Include(o => o.Designs)
            .Select(o => new CustomOrderDetailDto(
                o.Id,
                o.UserId,
                o.BaseProductId,
                o.BaseProduct != null ? o.BaseProduct.Name : null,
                o.ContactName,
                o.ContactPhone,
                o.ContactEmail,
                o.Status,
                o.TotalPrice,
                o.CustomerNotes,
                o.AdminNotes,
                o.CreatedAt,
                o.UpdatedAt,
                o.Designs
                    .OrderBy(d => d.SortOrder)
                    .Select(d => new CustomOrderDesignDto(
                        d.Id,
                        d.DesignImageUrl,
                        d.Placement,
                        d.Size,
                        d.ThreadColor,
                        d.Width,
                        d.Height,
                        d.PositionX,
                        d.PositionY,
                        d.SortOrder))
                    .ToList()));

    private static CustomOrderSummaryDto MapToSummary(CustomOrder o) =>
        new(
            o.Id,
            o.UserId,
            o.BaseProductId,
            o.BaseProduct?.Name,
            o.ContactName,
            o.ContactPhone,
            o.ContactEmail,
            o.Status,
            o.TotalPrice,
            o.CreatedAt);
}
