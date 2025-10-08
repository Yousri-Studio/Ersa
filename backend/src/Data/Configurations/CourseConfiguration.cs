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

        builder.Property(c => c.SummaryAr)
            .HasMaxLength(5000);

        builder.Property(c => c.SummaryEn)
            .HasMaxLength(5000);

        builder.Property(c => c.DescriptionAr)
            .HasMaxLength(5000);

        builder.Property(c => c.DescriptionEn)
            .HasMaxLength(5000);

        builder.Property(c => c.IsActive)
            .HasDefaultValue(true);

        builder.Property(c => c.IsFeatured)
            .HasDefaultValue(false);
        
        builder.Property(c => c.Duration);

        builder.Property(c => c.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(c => c.Type)
            .IsRequired()
            .HasDefaultValue(CourseType.PDF);

        builder.Property(c => c.Level)
            .IsRequired()
            .HasDefaultValue(CourseLevel.Biginner);

        // Configure relationship with CourseCategory
        builder.HasOne(c => c.Category)
            .WithMany(cat => cat.Courses)
            .HasForeignKey(c => c.CategoryId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Property(c => c.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(c => c.UpdatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(c => c.VideoUrl)
            .IsRequired()
            .HasDefaultValue("")
            .HasMaxLength(1000);

        builder.Property(c => c.InstructorNameAr)
            .IsRequired()
            .HasMaxLength(255)
            .HasDefaultValue("");

        builder.Property(c => c.InstructorNameEn)
            .IsRequired()
            .HasMaxLength(255)
            .HasDefaultValue("");

        // New field configurations
        builder.Property(c => c.Photo)
            .HasMaxLength(1000);

        builder.Property(c => c.Tags)
            .HasMaxLength(2000);

        builder.Property(c => c.InstructorsBioAr)
            .HasMaxLength(2500);

        builder.Property(c => c.InstructorsBioEn)
            .HasMaxLength(2500);

        builder.Property(c => c.CourseTopicsAr);

        builder.Property(c => c.CourseTopicsEn);
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