using Dressfield.Application.DTOs;
using Dressfield.Application.Interfaces;
using Dressfield.Core.Entities;
using Dressfield.Core.Enums;
using Dressfield.Core.Interfaces;
using Dressfield.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Dressfield.Infrastructure.Services;

public class OrderService : IOrderService
{
    private readonly DressfieldDbContext _db;
    private readonly IPaymentService _payment;
    private readonly IEmailService _email;
    private readonly ILogger<OrderService> _logger;
    private readonly decimal _shippingCost;

    public OrderService(DressfieldDbContext db, IPaymentService payment, IEmailService email, IConfiguration configuration, ILogger<OrderService> logger)
    {
        _db = db;
        _payment = payment;
        _email = email;
        _logger = logger;
        _shippingCost = decimal.TryParse(configuration["Orders:ShippingCost"], out var sc) ? sc : 5m;
    }

    // ── Admin ─────────────────────────────────────────────────────────────────

    public async Task<IReadOnlyCollection<OrderSummaryDto>> GetAdminAsync(OrderStatus? status)
    {
        var query = _db.Orders.AsNoTracking().AsQueryable();

        if (status.HasValue)
            query = query.Where(o => o.Status == status.Value);

        return await query
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OrderSummaryDto(
                o.Id,
                o.UserId,
                o.ContactName,
                o.ContactEmail,
                o.ContactPhone,
                o.ShippingCity,
                o.Status,
                o.TotalAmount,
                o.Items.Count,
                o.CreatedAt))
            .ToListAsync();
    }

    public Task<OrderDetailDto?> GetAdminByIdAsync(int id) =>
        BuildDetailQuery().FirstOrDefaultAsync(o => o.Id == id);

    public async Task UpdateStatusAsync(int id, UpdateOrderStatusRequest request)
    {
        var order = await _db.Orders.FindAsync(id)
            ?? throw new KeyNotFoundException("შეკვეთა ვერ მოიძებნა");

        order.Status = request.Status;
        order.AdminNotes = request.AdminNotes?.Trim();
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        // Send shipping notification when status changes to Shipped
        if (request.Status == OrderStatus.Shipped)
        {
            try
            {
                await _email.SendShippingNotificationAsync(order.ContactEmail, order.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send shipping notification for order {OrderId}", order.Id);
            }
        }
    }

    // ── Customer ──────────────────────────────────────────────────────────────

    public async Task<IReadOnlyCollection<OrderSummaryDto>> GetByUserAsync(string userId)
    {
        return await _db.Orders
            .AsNoTracking()
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OrderSummaryDto(
                o.Id,
                o.UserId,
                o.ContactName,
                o.ContactEmail,
                o.ContactPhone,
                o.ShippingCity,
                o.Status,
                o.TotalAmount,
                o.Items.Count,
                o.CreatedAt))
            .ToListAsync();
    }

    public Task<OrderDetailDto?> GetByIdForUserAsync(int id, string userId) =>
        BuildDetailQuery().FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

    // ── Checkout ──────────────────────────────────────────────────────────────

    public async Task<CheckoutResponse> CreateAsync(CreateOrderRequest request, string? userId)
    {
        // 1. Load and validate products
        var productIds = request.Items.Select(i => i.ProductId).Distinct().ToList();
        var products = await _db.Products
            .Include(p => p.Variants)
            .Include(p => p.Images)
            .Where(p => productIds.Contains(p.Id) && p.IsActive)
            .ToListAsync();

        if (products.Count != productIds.Count)
            throw new InvalidOperationException("ერთ-ერთი პროდუქტი მიუწვდომელია.");

        // 2. Build order items with price snapshots
        var items = new List<OrderItem>();
        decimal subtotal = 0;

        foreach (var cartItem in request.Items)
        {
            var product = products.First(p => p.Id == cartItem.ProductId);
            var variant = cartItem.VariantId.HasValue
                ? product.Variants.FirstOrDefault(v => v.Id == cartItem.VariantId.Value && v.IsActive)
                : null;

            var unitPrice = product.BasePrice + (variant?.PriceAdjustment ?? 0);
            var lineTotal = unitPrice * cartItem.Quantity;
            subtotal += lineTotal;

            items.Add(new OrderItem
            {
                ProductId = product.Id,
                ProductName = product.Name,
                ProductSlug = product.Slug,
                ProductImageUrl = product.Images.OrderBy(i => i.SortOrder).FirstOrDefault()?.ImageUrl,
                VariantName = variant != null ? $"{variant.Name}: {variant.Value}" : null,
                UnitPrice = unitPrice,
                Quantity = cartItem.Quantity,
                LineTotal = lineTotal
            });
        }

        var orderKey = Guid.NewGuid().ToString("N");

        var order = new Order
        {
            UserId = userId,
            ContactName = request.ContactName.Trim(),
            ContactPhone = request.ContactPhone.Trim(),
            ContactEmail = request.ContactEmail.Trim().ToLowerInvariant(),
            ShippingCity = request.ShippingCity.Trim(),
            ShippingAddressLine1 = request.ShippingAddressLine1.Trim(),
            ShippingAddressLine2 = request.ShippingAddressLine2?.Trim(),
            ShippingPostalCode = request.ShippingPostalCode?.Trim(),
            CustomerNotes = request.CustomerNotes?.Trim(),
            Subtotal = subtotal,
            ShippingCost = _shippingCost,
            TotalAmount = subtotal + _shippingCost,
            BogOrderKey = orderKey,
            Status = OrderStatus.Pending,
            Items = items
        };

        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        // 3. Create BOG payment session
        var description = $"DressField შეკვეთა #{order.Id}";
        var paymentResult = await _payment.CreateSessionAsync(order.Id, order.TotalAmount, orderKey, description);

        if (paymentResult.Success && paymentResult.BogOrderId != null)
        {
            order.BogOrderId = paymentResult.BogOrderId;
            order.Status = OrderStatus.AwaitingPayment;
            await _db.SaveChangesAsync();
        }

        return new CheckoutResponse(
            order.Id,
            paymentResult.RedirectUrl,
            paymentResult.Success);
    }

    // ── Payment Callback ──────────────────────────────────────────────────────

    public async Task HandlePaymentCallbackAsync(string bogOrderId)
    {
        var order = await _db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.BogOrderId == bogOrderId);

        if (order == null)
        {
            _logger.LogWarning("Payment callback for unknown BOG order {BogOrderId}", bogOrderId);
            return;
        }

        // Idempotency guard — only process if still awaiting payment
        if (order.Status != OrderStatus.AwaitingPayment)
        {
            _logger.LogInformation("Duplicate callback for order {OrderId} (status: {Status}) — skipping",
                order.Id, order.Status);
            return;
        }

        var result = await _payment.VerifyCallbackAsync(bogOrderId);

        order.Status    = result.IsApproved ? OrderStatus.Paid : OrderStatus.Cancelled;
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        _logger.LogInformation("Order {OrderId} payment {Result} (BOG: {BogOrderId})",
            order.Id, result.IsApproved ? "approved" : "declined", bogOrderId);

        // Send confirmation email on successful payment
        if (result.IsApproved)
        {
            try
            {
                var itemsHtml = string.Join("", order.Items.Select(i =>
                    $"<tr><td style=\"padding:6px 0;\">{i.ProductName}{(i.VariantName != null ? $" ({i.VariantName})" : "")}</td>" +
                    $"<td style=\"padding:6px 0;text-align:center;\">{i.Quantity}</td>" +
                    $"<td style=\"padding:6px 0;text-align:right;\">₾{i.LineTotal:F2}</td></tr>"));
                await _email.SendOrderConfirmationAsync(order.ContactEmail, order.Id, itemsHtml, $"₾{order.TotalAmount:F2}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send confirmation email for order {OrderId}", order.Id);
            }
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private IQueryable<OrderDetailDto> BuildDetailQuery() =>
        _db.Orders
            .AsNoTracking()
            .Select(o => new OrderDetailDto(
                o.Id,
                o.UserId,
                o.ContactName,
                o.ContactEmail,
                o.ContactPhone,
                o.ShippingCity,
                o.ShippingAddressLine1,
                o.ShippingAddressLine2,
                o.ShippingPostalCode,
                o.Status,
                o.Subtotal,
                o.ShippingCost,
                o.TotalAmount,
                o.CustomerNotes,
                o.AdminNotes,
                o.BogOrderId,
                o.CreatedAt,
                o.UpdatedAt,
                o.Items
                    .Select(i => new OrderItemDto(
                        i.Id,
                        i.ProductId,
                        i.ProductName,
                        i.ProductSlug,
                        i.ProductImageUrl,
                        i.VariantName,
                        i.UnitPrice,
                        i.Quantity,
                        i.LineTotal))
                    .ToList()));

}
