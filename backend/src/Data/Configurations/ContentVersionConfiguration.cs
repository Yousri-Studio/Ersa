using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.Data.Configurations;

public class ContentVersionConfiguration : IEntityTypeConfiguration<ContentVersion>
{
    public void Configure(EntityTypeBuilder<ContentVersion> builder)
    {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.ContentPageId)
            .IsRequired();
            
        builder.Property(x => x.VersionName)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(x => x.ContentData)
            .HasColumnType("TEXT");
            
        builder.Property(x => x.IsPublished)
            .IsRequired();
            
        builder.Property(x => x.CreatedAt)
            .IsRequired();
            
        builder.Property(x => x.CreatedBy)
            .IsRequired();
            
        // Relationships
        builder.HasOne(x => x.ContentPage)
            .WithMany(x => x.Versions)
            .HasForeignKey(x => x.ContentPageId)
            .OnDelete(DeleteBehavior.Cascade);
            
        // Indexes
        builder.HasIndex(x => x.ContentPageId);
        builder.HasIndex(x => x.IsPublished);
        builder.HasIndex(x => x.CreatedAt);
    }
}
