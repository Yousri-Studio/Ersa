using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using ErsaTraining.API.Data.Entities;
using ErsaTraining.API.Data.Configurations;

namespace ErsaTraining.API.Data;

public class ErsaTrainingDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>
{
    public ErsaTrainingDbContext(DbContextOptions<ErsaTrainingDbContext> options) : base(options)
    {
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        // Configure warnings for better performance monitoring
        optionsBuilder.ConfigureWarnings(warnings =>
        {
            warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning);
            warnings.Throw(RelationalEventId.MultipleCollectionIncludeWarning);
        });
    }

    // DbSets
    public DbSet<Course> Courses { get; set; } = null!;
    public DbSet<CourseCategory> CourseCategories { get; set; } = null!;
    public DbSet<CourseSubCategory> CourseSubCategories { get; set; } = null!;
    public DbSet<CourseSubCategoryMapping> CourseSubCategoryMappings { get; set; } = null!;
    public DbSet<Instructor> Instructors { get; set; } = null!;
    public DbSet<CourseInstructor> CourseInstructors { get; set; } = null!;
    public DbSet<Session> Sessions { get; set; } = null!;
    public DbSet<Order> Orders { get; set; } = null!;
    public DbSet<OrderItem> OrderItems { get; set; } = null!;
    public DbSet<Bill> Bills { get; set; } = null!;
    public DbSet<Payment> Payments { get; set; } = null!;
    public DbSet<Enrollment> Enrollments { get; set; } = null!;
    public DbSet<Attachment> Attachments { get; set; } = null!;
    public DbSet<SecureLink> SecureLinks { get; set; } = null!;
    public DbSet<Cart> Carts { get; set; } = null!;
    public DbSet<CartItem> CartItems { get; set; } = null!;
    public DbSet<Wishlist> Wishlists { get; set; } = null!;
    public DbSet<WishlistItem> WishlistItems { get; set; } = null!;
    public DbSet<EmailTemplate> EmailTemplates { get; set; } = null!;
    public DbSet<EmailLog> EmailLogs { get; set; } = null!;
    
    // Content Management
    public DbSet<ContentPage> ContentPages { get; set; } = null!;
    public DbSet<ContentSection> ContentSections { get; set; } = null!;
    public DbSet<ContentBlock> ContentBlocks { get; set; } = null!;
    public DbSet<ContentVersion> ContentVersions { get; set; } = null!;
    
    // Contact Management
    public DbSet<ContactMessage> ContactMessages { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Apply configurations
        builder.ApplyConfiguration(new UserConfiguration());
        builder.ApplyConfiguration(new CourseConfiguration());
        builder.ApplyConfiguration(new CourseCategoryConfiguration());
        builder.ApplyConfiguration(new CourseSubCategoryConfiguration());
        builder.ApplyConfiguration(new CourseSubCategoryMappingConfiguration());
        builder.ApplyConfiguration(new InstructorConfiguration());
        builder.ApplyConfiguration(new CourseInstructorConfiguration());
        builder.ApplyConfiguration(new SessionConfiguration());
        builder.ApplyConfiguration(new OrderConfiguration());
        builder.ApplyConfiguration(new OrderItemConfiguration());
        builder.ApplyConfiguration(new BillConfiguration());
        builder.ApplyConfiguration(new PaymentConfiguration());
        builder.ApplyConfiguration(new EnrollmentConfiguration());
        builder.ApplyConfiguration(new AttachmentConfiguration());
        builder.ApplyConfiguration(new SecureLinkConfiguration());
        builder.ApplyConfiguration(new CartConfiguration());
        builder.ApplyConfiguration(new CartItemConfiguration());
        builder.ApplyConfiguration(new WishlistConfiguration());
        builder.ApplyConfiguration(new WishlistItemConfiguration());
        builder.ApplyConfiguration(new EmailTemplateConfiguration());
        builder.ApplyConfiguration(new EmailLogConfiguration());
        
        // Content Management configurations
        builder.ApplyConfiguration(new ContentPageConfiguration());
        builder.ApplyConfiguration(new ContentSectionConfiguration());
        builder.ApplyConfiguration(new ContentBlockConfiguration());
        builder.ApplyConfiguration(new ContentVersionConfiguration());
        
        // Contact Management configurations
        builder.ApplyConfiguration(new ContactMessageConfiguration());

        // Seed data
        SeedData(builder);
    }

    private void SeedData(ModelBuilder builder)
    {
        // Seed email templates
        var templates = new[]
        {
            new EmailTemplate
            {
                Id = Guid.NewGuid(),
                Key = "Welcome",
                SubjectAr = "مرحباً بك في إرساء للتدريب",
                SubjectEn = "Welcome to Ersa Training",
                BodyHtmlAr = "<h1>مرحباً بك في إرساء للتدريب</h1><p>شكراً لانضمامك إلينا!</p>",
                BodyHtmlEn = "<h1>Welcome to Ersa Training</h1><p>Thank you for joining us!</p>",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new EmailTemplate
            {
                Id = Guid.NewGuid(),
                Key = "LiveDetails",
                SubjectAr = "تفاصيل الدورة المباشرة - {{CourseTitleAr}}",
                SubjectEn = "Live Course Details - {{CourseTitleEn}}",
                BodyHtmlAr = "<h1>تفاصيل الدورة المباشرة</h1><p>رابط الانضمام: {{TeamsLink}}</p><p>تاريخ البدء: {{StartDate}}</p>",
                BodyHtmlEn = "<h1>Live Course Details</h1><p>Join Link: {{TeamsLink}}</p><p>Start Date: {{StartDate}}</p>",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new EmailTemplate
            {
                Id = Guid.NewGuid(),
                Key = "MaterialsDelivery",
                SubjectAr = "مواد الدورة - {{CourseTitleAr}}",
                SubjectEn = "Course Materials - {{CourseTitleEn}}",
                BodyHtmlAr = "<h1>مواد الدورة</h1><p>يمكنك تحميل مواد الدورة من الروابط التالية:</p>{{SecureLinks}}",
                BodyHtmlEn = "<h1>Course Materials</h1><p>You can download the course materials from the following links:</p>{{SecureLinks}}",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };

        builder.Entity<EmailTemplate>().HasData(templates);

        // Seed content pages
        var contentPages = new[]
        {
            new ContentPage
            {
                Id = Guid.NewGuid(),
                PageKey = "home",
                PageName = "Home Page",
                Description = "Main landing page of the website",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new ContentPage
            {
                Id = Guid.NewGuid(),
                PageKey = "about",
                PageName = "About Us",
                Description = "Company information and mission",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new ContentPage
            {
                Id = Guid.NewGuid(),
                PageKey = "contact",
                PageName = "Contact Us",
                Description = "Contact information and form",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new ContentPage
            {
                Id = Guid.NewGuid(),
                PageKey = "faq",
                PageName = "FAQ",
                Description = "Frequently asked questions",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new ContentPage
            {
                Id = Guid.NewGuid(),
                PageKey = "services",
                PageName = "Services",
                Description = "Our services overview",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new ContentPage
            {
                Id = Guid.NewGuid(),
                PageKey = "courses",
                PageName = "Courses",
                Description = "Available training courses",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new ContentPage
            {
                Id = Guid.NewGuid(),
                PageKey = "ai-solutions",
                PageName = "AI Solutions",
                Description = "Artificial Intelligence services",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new ContentPage
            {
                Id = Guid.NewGuid(),
                PageKey = "admin-consulting",
                PageName = "Administrative Consulting",
                Description = "Administrative consulting services",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };

        builder.Entity<ContentPage>().HasData(contentPages);
    }
}