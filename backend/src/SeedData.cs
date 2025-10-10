using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ErsaTraining.API.Data;
using ErsaTraining.API.Data.Entities;
using ErsaTraining.API.Services;

namespace ErsaTraining.API;

public static class SeedData
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ErsaTrainingDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var roleService = scope.ServiceProvider.GetRequiredService<RoleService>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

        try
        {
            // Database should already be created by the calling code
            // Remove the EnsureCreatedAsync call to avoid conflicts

            // Seed Roles First
            await roleService.SeedRolesAsync();

            // Seed Default Super Admins
            await CreateSuperAdminUser(serviceProvider, roleService);

            // Seed Super Admin User (with role assignment)
            await SeedSuperAdminAsync(userManager, roleService, logger);

            // Seed Course Categories
            await SeedCourseCategoriesAsync(context, logger);

            // Seed Course Sub-Categories
            await SeedCourseSubCategoriesAsync(context, logger);

            // Seed Test Courses
            await SeedCoursesAsync(context, logger);

            // Seed Content Pages
            await SeedContentPagesAsync(context, logger);

            // Skip mock users and orders - keeping only essential admin users

            await context.SaveChangesAsync();
            logger.LogInformation("Database seeding completed successfully");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while seeding database");
            throw;
        }
    }


    public static async Task CreateSuperAdminUser(IServiceProvider serviceProvider, RoleService roleService)
    {
        using var scope = serviceProvider.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var context = scope.ServiceProvider.GetRequiredService<ErsaTrainingDbContext>();

        // Create Super Admin (System Manager)
        await CreateUserIfNotExists(userManager, roleService,
            "superadmin@ersa-training.com",
            "SuperAdmin123!",
            "System Manager",
            RoleNames.SuperAdmin);

        // Create Operations Manager
        await CreateUserIfNotExists(userManager, roleService,
            "operations@ersa-training.com",
            "Operations123!",
            "Operations Manager",
            RoleNames.Operation);

        // Create legacy admin account for backward compatibility
        await CreateUserIfNotExists(userManager, roleService,
            "admin@ersa-training.com",
            "Admin123!",
            "Legacy Administrator",
            RoleNames.Admin);
    }

    private static async Task CreateUserIfNotExists(
        UserManager<User> userManager,
        RoleService roleService,
        string email,
        string password,
        string fullName,
        string roleName)
    {
        var existingUser = await userManager.FindByEmailAsync(email);
        if (existingUser != null)
        {
            Console.WriteLine($"User {email} already exists!");
            // Ensure existing user has the correct role
            await roleService.AssignUserToRoleAsync(email, roleName);
            return;
        }

        var user = new User
        {
            UserName = email,
            Email = email,
            FullName = fullName,
            Locale = "en",
            Status = UserStatus.Active,
            // Keep boolean properties for backward compatibility
            IsAdmin = roleName == RoleNames.Admin || roleName == RoleNames.SuperAdmin || roleName == RoleNames.Operation,
            IsSuperAdmin = roleName == RoleNames.SuperAdmin,
            EmailConfirmed = true,
            CreatedAt = DateTime.UtcNow
        };

        var result = await userManager.CreateAsync(user, password);

        if (result.Succeeded)
        {
            Console.WriteLine($"User {email} created successfully!");
            Console.WriteLine($"Email: {email}");
            Console.WriteLine($"Password: {password}");
            Console.WriteLine($"Role: {roleName}");
            
            // Assign user to role
            await roleService.AssignUserToRoleAsync(email, roleName);
        }
        else
        {
            Console.WriteLine($"Failed to create user {email}:");
            foreach (var error in result.Errors)
            {
                Console.WriteLine($"- {error.Description}");
            }
        }
    }

    private static async Task SeedSuperAdminAsync(UserManager<User> userManager, RoleService roleService, ILogger logger)
    {
        const string superAdminEmail = "superadmin@ersa-training.com";
        const string superAdminPassword = "SuperAdmin123!";

        var existingUser = await userManager.FindByEmailAsync(superAdminEmail);
        if (existingUser == null)
        {
            var superAdmin = new User
            {
                Id = Guid.NewGuid(),
                FullName = "Super Administrator",
                Email = superAdminEmail,
                UserName = superAdminEmail,
                EmailConfirmed = true,
                IsAdmin = true,
                IsSuperAdmin = true,
                Status = UserStatus.Active,
                Locale = "en",
                CreatedAt = DateTime.UtcNow
            };

            var result = await userManager.CreateAsync(superAdmin, superAdminPassword);
            if (result.Succeeded)
            {
                // Assign SuperAdmin role
                await roleService.AssignUserToRoleAsync(superAdminEmail, RoleNames.SuperAdmin);
                logger.LogInformation("Super admin user created successfully with SuperAdmin role");
            }
            else
            {
                logger.LogError("Failed to create super admin user: {Errors}", string.Join(", ", result.Errors.Select(e => e.Description)));
            }
        }
        else
        {
            // Ensure existing user has the SuperAdmin role
            await roleService.AssignUserToRoleAsync(superAdminEmail, RoleNames.SuperAdmin);
            logger.LogInformation("Super admin user already exists, role assignment verified");
        }
    }

    private static async Task SeedCourseCategoriesAsync(ErsaTrainingDbContext context, ILogger logger)
    {
        if (await context.CourseCategories.AnyAsync())
        {
            logger.LogInformation("Course categories already exist, skipping seed");
            return;
        }

        var categories = new List<CourseCategory>
        {
            new CourseCategory
            {
                Id = new Guid("11111111-1111-1111-1111-111111111111"),
                TitleAr = "الشهادات المهنية",
                TitleEn = "Professional Certificates",
                DisplayOrder = 1,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new CourseCategory
            {
                Id = new Guid("22222222-2222-2222-2222-222222222222"),
                TitleAr = "البرامج المخصصة",
                TitleEn = "Custom Programs",
                DisplayOrder = 2,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new CourseCategory
            {
                Id = new Guid("33333333-3333-3333-3333-333333333333"),
                TitleAr = "الدورات العامة",
                TitleEn = "General Courses",
                DisplayOrder = 3,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };

        context.CourseCategories.AddRange(categories);
        await context.SaveChangesAsync();
        logger.LogInformation("Added {Count} course categories", categories.Count);
    }

    private static async Task SeedCourseSubCategoriesAsync(ErsaTrainingDbContext context, ILogger logger)
    {
        if (await context.CourseSubCategories.AnyAsync())
        {
            logger.LogInformation("Course sub-categories already exist, skipping seed");
            return;
        }

        var subCategories = new List<CourseSubCategory>
        {
            new CourseSubCategory
            {
                Id = new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                TitleAr = "التأمين",
                TitleEn = "Insurance",
                DisplayOrder = 1,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new CourseSubCategory
            {
                Id = new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                TitleAr = "إدارة المشاريع",
                TitleEn = "Project Management",
                DisplayOrder = 2,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new CourseSubCategory
            {
                Id = new Guid("cccccccc-cccc-cccc-cccc-cccccccccccc"),
                TitleAr = "المهارات الناعمة",
                TitleEn = "Soft Skills",
                DisplayOrder = 3,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new CourseSubCategory
            {
                Id = new Guid("dddddddd-dddd-dddd-dddd-dddddddddddd"),
                TitleAr = "الموارد البشرية",
                TitleEn = "Human Resources",
                DisplayOrder = 4,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new CourseSubCategory
            {
                Id = new Guid("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"),
                TitleAr = "البرمجة وتطوير البرمجيات",
                TitleEn = "Programming & Software Development",
                DisplayOrder = 5,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new CourseSubCategory
            {
                Id = new Guid("ffffffff-ffff-ffff-ffff-ffffffffffff"),
                TitleAr = "التسويق الرقمي",
                TitleEn = "Digital Marketing",
                DisplayOrder = 6,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new CourseSubCategory
            {
                Id = new Guid("10101010-1010-1010-1010-101010101010"),
                TitleAr = "علم البيانات والذكاء الاصطناعي",
                TitleEn = "Data Science & AI",
                DisplayOrder = 7,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new CourseSubCategory
            {
                Id = new Guid("20202020-2020-2020-2020-202020202020"),
                TitleAr = "التصميم",
                TitleEn = "Design",
                DisplayOrder = 8,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };

        context.CourseSubCategories.AddRange(subCategories);
        await context.SaveChangesAsync();
        logger.LogInformation("Added {Count} course sub-categories", subCategories.Count);
    }


    private static async Task SeedCoursesAsync(ErsaTrainingDbContext context, ILogger logger)
    {
        if (await context.Courses.AnyAsync())
        {
            logger.LogInformation("Courses already exist, skipping seed");
            return;
        }

        // Get courses from Excel data
        var courses = Data.Seeds.ExcelCourseSeedData.GetCoursesFromExcel();

        context.Courses.AddRange(courses);
        await context.SaveChangesAsync();

        logger.LogInformation("Added {Count} courses from Excel data", courses.Count);
    }


    private static async Task SeedContentPagesAsync(ErsaTrainingDbContext context, ILogger logger)
    {
        if (await context.ContentPages.AnyAsync())
        {
            logger.LogInformation("Content pages already exist, skipping seed");
            return;
        }

        // Home Page
        var homePage = new ContentPage
        {
            Id = Guid.NewGuid(),
            PageKey = "home",
            PageName = "Home Page",
            Description = "Main landing page content",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var heroSection = new ContentSection
        {
            Id = Guid.NewGuid(),
            ContentPageId = homePage.Id,
            SectionKey = "hero",
            SectionName = "Hero Section",
            Description = "Main hero banner",
            SortOrder = 1,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var heroTitle = new ContentBlock
        {
            Id = Guid.NewGuid(),
            ContentSectionId = heroSection.Id,
            BlockKey = "hero-title",
            BlockName = "Hero Title",
            BlockType = "text",
            ContentEn = "Elevate Your Career with Professional Training",
            ContentAr = "ارتق بمسيرتك المهنية مع التدريب المهني",
            SortOrder = 1,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var heroSubtitle = new ContentBlock
        {
            Id = Guid.NewGuid(),
            ContentSectionId = heroSection.Id,
            BlockKey = "hero-subtitle",
            BlockName = "Hero Subtitle",
            BlockType = "text",
            ContentEn = "Discover world-class courses designed to unlock your potential and accelerate your professional growth.",
            ContentAr = "اكتشف دورات عالمية المستوى مصممة لإطلاق إمكاناتك وتسريع نموك المهني.",
            SortOrder = 2,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // About Page
        var aboutPage = new ContentPage
        {
            Id = Guid.NewGuid(),
            PageKey = "about",
            PageName = "About Page",
            Description = "About us page content",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var aboutSection = new ContentSection
        {
            Id = Guid.NewGuid(),
            ContentPageId = aboutPage.Id,
            SectionKey = "about-intro",
            SectionName = "About Introduction",
            Description = "Introduction section for about page",
            SortOrder = 1,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var aboutTitle = new ContentBlock
        {
            Id = Guid.NewGuid(),
            ContentSectionId = aboutSection.Id,
            BlockKey = "about-title",
            BlockName = "About Title",
            BlockType = "text",
            ContentEn = "About Ersa Training",
            ContentAr = "حول إرسا للتدريب",
            SortOrder = 1,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var aboutDescription = new ContentBlock
        {
            Id = Guid.NewGuid(),
            ContentSectionId = aboutSection.Id,
            BlockKey = "about-description",
            BlockName = "About Description",
            BlockType = "text",
            ContentEn = "Ersa Training is a leading provider of professional development courses designed to elevate careers and unlock potential. We offer comprehensive training programs across various industries and skill levels.",
            ContentAr = "إرسا للتدريب هي مزود رائد لدورات التطوير المهني المصممة لرفع مستوى المهن وإطلاق الإمكانات. نحن نقدم برامج تدريبية شاملة عبر مختلف الصناعات ومستويات المهارات.",
            SortOrder = 2,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Courses Page
        var coursesPage = new ContentPage
        {
            Id = Guid.NewGuid(),
            PageKey = "courses",
            PageName = "Courses Page",
            Description = "Courses listing page content",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var coursesSection = new ContentSection
        {
            Id = Guid.NewGuid(),
            ContentPageId = coursesPage.Id,
            SectionKey = "courses",
            SectionName = "Courses Section",
            Description = "Courses page content",
            SortOrder = 1,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var coursesTitle = new ContentBlock
        {
            Id = Guid.NewGuid(),
            ContentSectionId = coursesSection.Id,
            BlockKey = "page-title",
            BlockName = "Page Title",
            BlockType = "text",
            ContentEn = "Our Courses",
            ContentAr = "دوراتنا",
            SortOrder = 1,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var coursesDescription = new ContentBlock
        {
            Id = Guid.NewGuid(),
            ContentSectionId = coursesSection.Id,
            BlockKey = "page-description",
            BlockName = "Page Description",
            BlockType = "text",
            ContentEn = "Discover our comprehensive collection of professional development courses",
            ContentAr = "اكتشف مجموعتنا الشاملة من دورات التطوير المهني",
            SortOrder = 2,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Contact Page
        var contactPage = new ContentPage
        {
            Id = Guid.NewGuid(),
            PageKey = "contact",
            PageName = "Contact Page",
            Description = "Contact page content",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var contactSection = new ContentSection
        {
            Id = Guid.NewGuid(),
            ContentPageId = contactPage.Id,
            SectionKey = "contact",
            SectionName = "Contact Section",
            Description = "Contact page content",
            SortOrder = 1,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var contactTitle = new ContentBlock
        {
            Id = Guid.NewGuid(),
            ContentSectionId = contactSection.Id,
            BlockKey = "page-title",
            BlockName = "Page Title",
            BlockType = "text",
            ContentEn = "Contact Us",
            ContentAr = "اتصل بنا",
            SortOrder = 1,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var contactDescription = new ContentBlock
        {
            Id = Guid.NewGuid(),
            ContentSectionId = contactSection.Id,
            BlockKey = "page-description",
            BlockName = "Page Description",
            BlockType = "text",
            ContentEn = "Get in touch with us for any questions or inquiries",
            ContentAr = "تواصل معنا لأي أسئلة أو استفسارات",
            SortOrder = 2,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.ContentPages.AddRange(homePage, aboutPage, coursesPage, contactPage);
        context.ContentSections.AddRange(heroSection, aboutSection, coursesSection, contactSection);
        context.ContentBlocks.AddRange(heroTitle, heroSubtitle, aboutTitle, aboutDescription, coursesTitle, coursesDescription, contactTitle, contactDescription);

        logger.LogInformation("Added content pages with sections and blocks");
    }

    // Mock users and orders seeding removed - keeping only essential admin users
}
