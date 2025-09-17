using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.Data.Configurations;

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.ToTable("OrderItems");
        
        builder.HasKey(oi => oi.Id);
        
        builder.Property(oi => oi.Id)
            .ValueGeneratedOnAdd();
            
        builder.Property(oi => oi.CourseTitleEn)
            .IsRequired()
            .HasMaxLength(255);
            
        builder.Property(oi => oi.CourseTitleAr)
            .IsRequired()
            .HasMaxLength(255);
            
        builder.Property(oi => oi.Price)
            .HasColumnType("decimal(18,2)")
            .IsRequired();
            
        builder.Property(oi => oi.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("SAR");
            
        builder.Property(oi => oi.Qty)
            .IsRequired()
            .HasDefaultValue(1);
            
        builder.Property(oi => oi.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        // Foreign key relationships
        builder.HasOne(oi => oi.Order)
            .WithMany(o => o.OrderItems)
            .HasForeignKey(oi => oi.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.HasOne(oi => oi.Course)
            .WithMany()
            .HasForeignKey(oi => oi.CourseId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasOne(oi => oi.Session)
            .WithMany()
            .HasForeignKey(oi => oi.SessionId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        // Indexes
        builder.HasIndex(oi => oi.OrderId)
            .HasDatabaseName("IX_OrderItems_OrderId");
            
        builder.HasIndex(oi => oi.CourseId)
            .HasDatabaseName("IX_OrderItems_CourseId");
            
        builder.HasIndex(oi => oi.SessionId)
            .HasDatabaseName("IX_OrderItems_SessionId");
    }
}
