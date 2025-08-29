using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.Data.Configurations;

public class WishlistConfiguration : IEntityTypeConfiguration<Wishlist>
{
    public void Configure(EntityTypeBuilder<Wishlist> builder)
    {
        builder.HasKey(w => w.Id);

        builder.HasOne(w => w.User)
            .WithMany(u => u.Wishlists)
            .HasForeignKey(w => w.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(w => w.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        // One wishlist per user
        builder.HasIndex(w => w.UserId).IsUnique();
    }
}

public class WishlistItemConfiguration : IEntityTypeConfiguration<WishlistItem>
{
    public void Configure(EntityTypeBuilder<WishlistItem> builder)
    {
        builder.HasKey(wi => wi.Id);

        builder.HasOne(wi => wi.Wishlist)
            .WithMany(w => w.Items)
            .HasForeignKey(wi => wi.WishlistId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(wi => wi.Course)
            .WithMany(c => c.WishlistItems)
            .HasForeignKey(wi => wi.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(wi => wi.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        // Unique constraint to prevent duplicate items in wishlist
        builder.HasIndex(wi => new { wi.WishlistId, wi.CourseId })
            .IsUnique();
    }
}