using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.Data.Configurations;

public class ContentSectionConfiguration : IEntityTypeConfiguration<ContentSection>
{
    public void Configure(EntityTypeBuilder<ContentSection> builder)
    {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.ContentPageId)
            .IsRequired();
            
        builder.Property(x => x.SectionKey)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(x => x.SectionName)
            .IsRequired()
            .HasMaxLength(255);
            
        builder.Property(x => x.Description)
            .HasMaxLength(500);
            
        builder.Property(x => x.SortOrder)
            .IsRequired();
            
        builder.Property(x => x.CreatedAt)
            .IsRequired();
            
        builder.Property(x => x.UpdatedAt)
            .IsRequired();
            
        // Relationships
        builder.HasOne(x => x.ContentPage)
            .WithMany(x => x.Sections)
            .HasForeignKey(x => x.ContentPageId)
            .OnDelete(DeleteBehavior.Cascade);
            
        // Indexes
        builder.HasIndex(x => new { x.ContentPageId, x.SectionKey })
            .IsUnique();
            
        builder.HasIndex(x => x.IsActive);
        builder.HasIndex(x => x.SortOrder);
    }
}
