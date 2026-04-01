using Dressfield.Application.DTOs;
using Dressfield.Core.Entities;
using Dressfield.Infrastructure.Data;
using Dressfield.Infrastructure.Services;
using FluentAssertions;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace Dressfield.Tests.Services;

public class CartServiceTests
{
    [Fact]
    public async Task GetCartAsync_ShouldEnrichItems_AndFilterUnavailableProducts()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using var db = CreateContext(connection);
        await db.Database.EnsureCreatedAsync();

        var user = new ApplicationUser
        {
            Id = "user-1",
            Email = "user@example.com",
            UserName = "user@example.com",
            FirstName = "Nika",
            LastName = "Beridze",
        };
        db.Users.Add(user);

        var activeProduct = new Product
        {
            Name = "Active Tee",
            Slug = "active-tee",
            Description = "desc",
            BasePrice = 50,
            IsActive = true,
            Images =
            [
                new ProductImage { ImageUrl = "https://cdn/tee.png", SortOrder = 0, IsPrimary = true }
            ],
            Variants =
            [
                new ProductVariant { Name = "Size", Value = "L", PriceAdjustment = 10, IsActive = true, StockQuantity = 5 }
            ],
        };

        var inactiveProduct = new Product
        {
            Name = "Inactive",
            Slug = "inactive",
            Description = "desc",
            BasePrice = 20,
            IsActive = false,
        };

        var inactiveVariantProduct = new Product
        {
            Name = "Inactive Variant Product",
            Slug = "inactive-variant-product",
            Description = "desc",
            BasePrice = 35,
            IsActive = true,
            Variants =
            [
                new ProductVariant { Name = "Size", Value = "M", PriceAdjustment = 5, IsActive = false, StockQuantity = 3 }
            ],
        };

        db.Products.AddRange(activeProduct, inactiveProduct, inactiveVariantProduct);
        await db.SaveChangesAsync();

        var activeVariantId = activeProduct.Variants.Single().Id;
        var inactiveVariantId = inactiveVariantProduct.Variants.Single().Id;

        db.Carts.Add(new Cart
        {
            UserId = user.Id,
            Items =
            [
                new CartItem { ProductId = activeProduct.Id, VariantId = 0, Quantity = 2 },
                new CartItem { ProductId = activeProduct.Id, VariantId = activeVariantId, Quantity = 1 },
                new CartItem { ProductId = inactiveProduct.Id, VariantId = 0, Quantity = 1 },
                new CartItem { ProductId = inactiveVariantProduct.Id, VariantId = inactiveVariantId, Quantity = 1 },
            ],
        });
        await db.SaveChangesAsync();

        var service = new CartService(db);
        var result = await service.GetCartAsync(user.Id);

        result.Items.Should().HaveCount(2);
        result.Items.Should().Contain(x => x.ProductId == activeProduct.Id && x.VariantId == null && x.Price == 50m);
        result.Items.Should().Contain(x => x.ProductId == activeProduct.Id && x.VariantId == activeVariantId && x.Price == 60m);
    }

    [Fact]
    public async Task SyncCartAsync_ShouldValidateProducts()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using var db = CreateContext(connection);
        await db.Database.EnsureCreatedAsync();

        db.Users.Add(new ApplicationUser
        {
            Id = "user-1",
            Email = "user@example.com",
            UserName = "user@example.com",
            FirstName = "Nika",
            LastName = "Beridze",
        });
        await db.SaveChangesAsync();

        var service = new CartService(db);

        var action = () => service.SyncCartAsync(
            "user-1",
            new SyncCartRequest([new SyncCartItemRequest(999, null, 1)]));

        await action.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task ClearCartAsync_ShouldRemoveAllItems()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using var db = CreateContext(connection);
        await db.Database.EnsureCreatedAsync();

        var user = new ApplicationUser
        {
            Id = "user-1",
            Email = "user@example.com",
            UserName = "user@example.com",
            FirstName = "Nika",
            LastName = "Beridze",
        };
        db.Users.Add(user);

        var product = new Product
        {
            Name = "Tee",
            Slug = "tee",
            Description = "desc",
            BasePrice = 40,
            IsActive = true,
        };
        db.Products.Add(product);
        await db.SaveChangesAsync();

        db.Carts.Add(new Cart
        {
            UserId = user.Id,
            Items = [new CartItem { ProductId = product.Id, VariantId = 0, Quantity = 1 }],
        });
        await db.SaveChangesAsync();

        var service = new CartService(db);
        await service.ClearCartAsync(user.Id);

        var itemCount = await db.CartItems.CountAsync();
        itemCount.Should().Be(0);
    }

    private static DressfieldDbContext CreateContext(SqliteConnection connection)
    {
        var options = new DbContextOptionsBuilder<DressfieldDbContext>()
            .UseSqlite(connection)
            .Options;

        return new DressfieldDbContext(options);
    }
}
