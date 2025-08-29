using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.Data.Configurations;

public class ContentPageConfiguration : IEntityTypeConfiguration<ContentPage>
{
    public void Configure(EntityTypeBuilder<ContentPage> builder)
    {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.PageKey)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(x => x.PageName)
            .IsRequired()
            .HasMaxLength(255);
            
        builder.Property(x => x.Description)
            .HasMaxLength(500);
            
        builder.Property(x => x.CreatedAt)
            .IsRequired();
            
        builder.Property(x => x.UpdatedAt)
            .IsRequired();
            
        // Indexes
        builder.HasIndex(x => x.PageKey)
            .IsUnique();
            
        builder.HasIndex(x => x.IsActive);
    }
}
