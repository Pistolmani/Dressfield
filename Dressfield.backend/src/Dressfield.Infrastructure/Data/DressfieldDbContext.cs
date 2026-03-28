using Dressfield.Core.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Dressfield.Infrastructure.Data;

public class DressfieldDbContext : IdentityDbContext<ApplicationUser>
{
    public DressfieldDbContext(DbContextOptions<DressfieldDbContext> options) : base(options) { }

    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();
    public DbSet<CustomOrder> CustomOrders => Set<CustomOrder>();
    public DbSet<CustomOrderDesign> CustomOrderDesigns => Set<CustomOrderDesign>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<RefreshToken>(entity =>
        {
            entity.HasIndex(e => e.Token).IsUnique();
            entity.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Category>(entity =>
        {
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Slug).HasMaxLength(120).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.HasIndex(e => e.Slug).IsUnique();
        });

        builder.Entity<Product>(entity =>
        {
            entity.Property(e => e.Name).HasMaxLength(150).IsRequired();
            entity.Property(e => e.Slug).HasMaxLength(160).IsRequired();
            entity.Property(e => e.ShortDescription).HasMaxLength(300);
            entity.Property(e => e.Description).HasMaxLength(5000).IsRequired();
            entity.Property(e => e.Sku).HasMaxLength(64);
            entity.Property(e => e.BasePrice).HasPrecision(18, 2);
            entity.HasIndex(e => e.Slug).IsUnique();
            entity.HasIndex(e => e.CategoryId);
            entity.HasOne(e => e.Category).WithMany(c => c.Products).HasForeignKey(e => e.CategoryId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<ProductImage>(entity =>
        {
            entity.Property(e => e.ImageUrl).HasMaxLength(500).IsRequired();
            entity.Property(e => e.AltText).HasMaxLength(200);
            entity.HasIndex(e => new { e.ProductId, e.SortOrder });
            entity.HasOne(e => e.Product).WithMany(p => p.Images).HasForeignKey(e => e.ProductId).OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<ProductVariant>(entity =>
        {
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Value).HasMaxLength(100);
            entity.Property(e => e.Sku).HasMaxLength(64);
            entity.Property(e => e.PriceAdjustment).HasPrecision(18, 2);
            entity.HasOne(e => e.Product).WithMany(p => p.Variants).HasForeignKey(e => e.ProductId).OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<CustomOrder>(entity =>
        {
            entity.Property(e => e.ContactName).HasMaxLength(100).IsRequired();
            entity.Property(e => e.ContactPhone).HasMaxLength(30).IsRequired();
            entity.Property(e => e.ContactEmail).HasMaxLength(200).IsRequired();
            entity.Property(e => e.TotalPrice).HasPrecision(18, 2);
            entity.Property(e => e.CustomerNotes).HasMaxLength(1000);
            entity.Property(e => e.AdminNotes).HasMaxLength(1000);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.UserId);
            entity.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.SetNull).IsRequired(false);
            entity.HasOne(e => e.BaseProduct).WithMany().HasForeignKey(e => e.BaseProductId).OnDelete(DeleteBehavior.SetNull).IsRequired(false);
        });

        builder.Entity<CustomOrderDesign>(entity =>
        {
            entity.Property(e => e.DesignImageUrl).HasMaxLength(500).IsRequired();
            entity.Property(e => e.Placement).HasMaxLength(50);
            entity.Property(e => e.Size).HasMaxLength(20);
            entity.Property(e => e.ThreadColor).HasMaxLength(20);
            entity.Property(e => e.Width).HasPrecision(10, 2);
            entity.Property(e => e.Height).HasPrecision(10, 2);
            entity.Property(e => e.PositionX).HasPrecision(10, 2);
            entity.Property(e => e.PositionY).HasPrecision(10, 2);
            entity.HasIndex(e => new { e.CustomOrderId, e.SortOrder });
            entity.HasOne(e => e.CustomOrder).WithMany(o => o.Designs).HasForeignKey(e => e.CustomOrderId).OnDelete(DeleteBehavior.Cascade);
        });
    }
}
