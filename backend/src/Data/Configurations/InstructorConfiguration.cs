using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.Data.Configurations;

public class InstructorConfiguration : IEntityTypeConfiguration<Instructor>
{
    public void Configure(EntityTypeBuilder<Instructor> builder)
    {
        builder.HasKey(i => i.Id);

        builder.Property(i => i.InstructorNameEn)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(i => i.InstructorNameAr)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(i => i.InstructorBioEn)
            .HasMaxLength(2500);

        builder.Property(i => i.InstructorBioAr)
            .HasMaxLength(2500);

        builder.Property(i => i.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(i => i.UpdatedAt)
            .HasDefaultValueSql("GETUTCDATE()");
    }
}

