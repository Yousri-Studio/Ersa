using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.Data.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.HasKey(o => o.Id);

        builder.HasOne(o => o.User)
            .WithMany(u => u.Orders)
            .HasForeignKey(o => o.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(o => o.Amount)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(o => o.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("SAR");

        builder.Property(o => o.Status)
            .HasDefaultValue(OrderStatus.Pending);

        builder.Property(o => o.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(o => o.UpdatedAt)
            .HasDefaultValueSql("GETUTCDATE()");
    }
}

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.HasKey(p => p.Id);

        builder.HasOne(p => p.Order)
            .WithMany(o => o.Payments)
            .HasForeignKey(p => p.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(p => p.Provider)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(p => p.ProviderRef)
            .HasMaxLength(255);

        builder.Property(p => p.Status)
            .HasDefaultValue(PaymentStatus.Pending);

        builder.Property(p => p.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(p => p.UpdatedAt)
            .HasDefaultValueSql("GETUTCDATE()");
    }
}

public class EnrollmentConfiguration : IEntityTypeConfiguration<Enrollment>
{
    public void Configure(EntityTypeBuilder<Enrollment> builder)
    {
        builder.HasKey(e => e.Id);

        builder.HasOne(e => e.User)
            .WithMany(u => u.Enrollments)
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Course)
            .WithMany(c => c.Enrollments)
            .HasForeignKey(e => e.CourseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Session)
            .WithMany(s => s.Enrollments)
            .HasForeignKey(e => e.SessionId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.Order)
            .WithMany(o => o.Enrollments)
            .HasForeignKey(e => e.OrderId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Property(e => e.Status)
            .HasDefaultValue(EnrollmentStatus.Pending);

        builder.Property(e => e.EnrolledAt)
            .HasDefaultValueSql("GETUTCDATE()");

        // Unique constraint to prevent duplicate enrollments
        builder.HasIndex(e => new { e.UserId, e.CourseId, e.SessionId })
            .IsUnique();
    }
}