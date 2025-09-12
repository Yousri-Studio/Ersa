using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.Data.Configurations;

public class BillConfiguration : IEntityTypeConfiguration<Bill>
{
    public void Configure(EntityTypeBuilder<Bill> builder)
    {
        builder.HasKey(b => b.Id);

        // Configure one-to-one relationship with Order
        // Bill is the dependent side (has the foreign key)
        builder.HasOne(b => b.Order)
            .WithOne(o => o.Bill)
            .HasForeignKey<Bill>(b => b.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(b => b.Amount)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(b => b.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("SAR");

        builder.Property(b => b.Status)
            .HasDefaultValue(BillStatus.Pending);

        builder.Property(b => b.PaymentProvider)
            .HasMaxLength(255);

        builder.Property(b => b.ProviderTransactionId)
            .HasMaxLength(255);

        builder.Property(b => b.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(b => b.UpdatedAt)
            .HasDefaultValueSql("GETUTCDATE()");
    }
}
