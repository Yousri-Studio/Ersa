using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.Data.Configurations;

public class CourseConfiguration : IEntityTypeConfiguration<Course>
{
    public void Configure(EntityTypeBuilder<Course> builder)
    {
        builder.HasKey(c => c.Id);

        builder.HasIndex(c => c.Slug).IsUnique();

        builder.Property(c => c.Slug)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(c => c.Price)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(c => c.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("SAR");

        builder.Property(c => c.TitleAr)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(c => c.TitleEn)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(c => c.DescriptionAr)
            .HasMaxLength(2000);

        builder.Property(c => c.DescriptionEn)
            .HasMaxLength(2000);

        builder.Property(c => c.IsActive)
            .HasDefaultValue(true);

        builder.Property(c => c.IsFeatured)
            .HasDefaultValue(false);

        builder.Property(c => c.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(c => c.UpdatedAt)
            .HasDefaultValueSql("GETUTCDATE()");
    }
}

public class SessionConfiguration : IEntityTypeConfiguration<Session>
{
    public void Configure(EntityTypeBuilder<Session> builder)
    {
        builder.HasKey(s => s.Id);

        builder.HasOne(s => s.Course)
            .WithMany(c => c.Sessions)
            .HasForeignKey(s => s.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(s => s.TeamsLink)
            .HasMaxLength(500);

        builder.Property(s => s.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");
    }
}

public class AttachmentConfiguration : IEntityTypeConfiguration<Attachment>
{
    public void Configure(EntityTypeBuilder<Attachment> builder)
    {
        builder.HasKey(a => a.Id);

        builder.HasOne(a => a.Course)
            .WithMany(c => c.Attachments)
            .HasForeignKey(a => a.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(a => a.FileName)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(a => a.BlobPath)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(a => a.IsRevoked)
            .HasDefaultValue(false);

        builder.Property(a => a.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");
    }
}