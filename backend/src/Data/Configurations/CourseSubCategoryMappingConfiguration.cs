using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.Data.Configurations;

public class CourseSubCategoryMappingConfiguration : IEntityTypeConfiguration<CourseSubCategoryMapping>
{
    public void Configure(EntityTypeBuilder<CourseSubCategoryMapping> builder)
    {
        // Composite primary key
        builder.HasKey(m => new { m.CourseId, m.SubCategoryId });

        // Configure relationships
        builder.HasOne(m => m.Course)
            .WithMany(c => c.CourseSubCategoryMappings)
            .HasForeignKey(m => m.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(m => m.SubCategory)
            .WithMany(s => s.CourseSubCategoryMappings)
            .HasForeignKey(m => m.SubCategoryId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(m => m.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");
    }
}

