using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.Data.Configurations;

public class CartConfiguration : IEntityTypeConfiguration<Cart>
{
    public void Configure(EntityTypeBuilder<Cart> builder)
    {
        builder.HasKey(c => c.Id);

        builder.HasOne(c => c.User)
            .WithMany(u => u.Carts)
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(c => c.AnonymousId)
            .HasMaxLength(255);

        builder.Property(c => c.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(c => c.UpdatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        // Index for anonymous carts
        builder.HasIndex(c => c.AnonymousId);
    }
}

public class CartItemConfiguration : IEntityTypeConfiguration<CartItem>
{
    public void Configure(EntityTypeBuilder<CartItem> builder)
    {
        builder.HasKey(ci => ci.Id);

        builder.HasOne(ci => ci.Cart)
            .WithMany(c => c.Items)
            .HasForeignKey(ci => ci.CartId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ci => ci.Course)
            .WithMany(c => c.CartItems)
            .HasForeignKey(ci => ci.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ci => ci.Session)
            .WithMany(s => s.CartItems)
            .HasForeignKey(ci => ci.SessionId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Property(ci => ci.Qty)
            .HasDefaultValue(1);

        builder.Property(ci => ci.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        // Unique constraint to prevent duplicate items in cart
        builder.HasIndex(ci => new { ci.CartId, ci.CourseId, ci.SessionId })
            .IsUnique();
    }
}