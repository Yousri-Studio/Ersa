using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.Data.Configurations;

public class EmailTemplateConfiguration : IEntityTypeConfiguration<EmailTemplate>
{
    public void Configure(EntityTypeBuilder<EmailTemplate> builder)
    {
        builder.HasKey(et => et.Id);

        builder.Property(et => et.Key)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasIndex(et => et.Key).IsUnique();

        builder.Property(et => et.SubjectAr)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(et => et.SubjectEn)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(et => et.BodyHtmlAr)
            .IsRequired();

        builder.Property(et => et.BodyHtmlEn)
            .IsRequired();

        builder.Property(et => et.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(et => et.UpdatedAt)
            .HasDefaultValueSql("GETUTCDATE()");
    }
}

public class EmailLogConfiguration : IEntityTypeConfiguration<EmailLog>
{
    public void Configure(EntityTypeBuilder<EmailLog> builder)
    {
        builder.HasKey(el => el.Id);

        builder.HasOne(el => el.User)
            .WithMany(u => u.EmailLogs)
            .HasForeignKey(el => el.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(el => el.Enrollment)
            .WithMany(e => e.EmailLogs)
            .HasForeignKey(el => el.EnrollmentId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(el => el.Template)
            .WithMany(et => et.EmailLogs)
            .HasForeignKey(el => el.TemplateKey)
            .HasPrincipalKey(et => et.Key)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(el => el.TemplateKey)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(el => el.Locale)
            .IsRequired()
            .HasMaxLength(5);

        builder.Property(el => el.Status)
            .HasDefaultValue(EmailStatus.Pending);

        builder.Property(el => el.ProviderMsgId)
            .HasMaxLength(255);

        builder.Property(el => el.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        // Index for querying email logs
        builder.HasIndex(el => new { el.UserId, el.TemplateKey, el.CreatedAt });
        builder.HasIndex(el => new { el.EnrollmentId, el.TemplateKey });
    }
}