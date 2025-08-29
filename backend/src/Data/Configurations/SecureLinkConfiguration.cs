using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.Data.Configurations;

public class SecureLinkConfiguration : IEntityTypeConfiguration<SecureLink>
{
    public void Configure(EntityTypeBuilder<SecureLink> builder)
    {
        builder.HasKey(sl => sl.Id);

        builder.HasOne(sl => sl.Enrollment)
            .WithMany(e => e.SecureLinks)
            .HasForeignKey(sl => sl.EnrollmentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(sl => sl.Attachment)
            .WithMany(a => a.SecureLinks)
            .HasForeignKey(sl => sl.AttachmentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(sl => sl.Token)
            .IsRequired()
            .HasMaxLength(255);

        builder.HasIndex(sl => sl.Token).IsUnique();

        builder.Property(sl => sl.IsRevoked)
            .HasDefaultValue(false);

        builder.Property(sl => sl.DownloadCount)
            .HasDefaultValue(0);

        builder.Property(sl => sl.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        // Unique constraint to prevent duplicate secure links
        builder.HasIndex(sl => new { sl.EnrollmentId, sl.AttachmentId })
            .IsUnique();
    }
}