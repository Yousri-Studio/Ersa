using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.Data.Configurations;

public class CourseInstructorConfiguration : IEntityTypeConfiguration<CourseInstructor>
{
    public void Configure(EntityTypeBuilder<CourseInstructor> builder)
    {
        // Composite primary key
        builder.HasKey(ci => new { ci.CourseId, ci.InstructorId });

        // Configure relationships
        builder.HasOne(ci => ci.Course)
            .WithMany(c => c.CourseInstructors)
            .HasForeignKey(ci => ci.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ci => ci.Instructor)
            .WithMany(i => i.CourseInstructors)
            .HasForeignKey(ci => ci.InstructorId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(ci => ci.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");
    }
}

