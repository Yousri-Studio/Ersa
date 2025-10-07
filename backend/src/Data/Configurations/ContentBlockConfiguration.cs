using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.Data.Configurations;

public class ContentBlockConfiguration : IEntityTypeConfiguration<ContentBlock>
{
    public void Configure(EntityTypeBuilder<ContentBlock> builder)
    {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.ContentSectionId)
            .IsRequired();
            
        builder.Property(x => x.BlockKey)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(x => x.BlockName)
            .IsRequired()
            .HasMaxLength(255);
            
        builder.Property(x => x.BlockType)
            .IsRequired()
            .HasMaxLength(50);
            
        builder.Property(x => x.ContentEn)
            .HasColumnType("NVARCHAR(MAX)");
            
        builder.Property(x => x.ContentAr)
            .HasColumnType("NVARCHAR(MAX)");
            
        builder.Property(x => x.ImageUrl)
            .HasMaxLength(500);
            
        builder.Property(x => x.LinkUrl)
            .HasMaxLength(500);
            
        builder.Property(x => x.LinkText)
            .HasMaxLength(100);
            
        builder.Property(x => x.SortOrder)
            .IsRequired();
            
        builder.Property(x => x.CreatedAt)
            .IsRequired();
            
        builder.Property(x => x.UpdatedAt)
            .IsRequired();
            
        // Relationships
        builder.HasOne(x => x.ContentSection)
            .WithMany(x => x.Blocks)
            .HasForeignKey(x => x.ContentSectionId)
            .OnDelete(DeleteBehavior.Cascade);
            
        // Indexes
        builder.HasIndex(x => new { x.ContentSectionId, x.BlockKey })
            .IsUnique();
            
        builder.HasIndex(x => x.IsActive);
        builder.HasIndex(x => x.SortOrder);
    }
}
