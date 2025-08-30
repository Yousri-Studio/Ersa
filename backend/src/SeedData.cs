using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ErsaTraining.API.Data;
using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API;

public static class SeedData
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ErsaTrainingDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

        try
        {
            // Ensure database is created
            await context.Database.EnsureCreatedAsync();

            // Seed Default Super Admins
            await CreateSuperAdminUser(serviceProvider);

            // Seed Super Admin User
            await SeedSuperAdminAsync(userManager, logger);

            // Seed Test Courses
            await SeedCoursesAsync(context, logger);

            // Seed Content Pages
            await SeedContentPagesAsync(context, logger);

            await context.SaveChangesAsync();
            logger.LogInformation("Database seeding completed successfully");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while seeding database");
            throw;
        }
    }


    public static async Task CreateSuperAdminUser(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var context = scope.ServiceProvider.GetRequiredService<ErsaTrainingDbContext>();

        // Create Super Admin (System Manager)
        await CreateUserIfNotExists(userManager,
            "superadmin@ersatraining.com",
            "SuperAdmin123!",
            "System Manager",
            true,
            true);

        // Create Operations Manager
        await CreateUserIfNotExists(userManager,
            "operations@ersatraining.com",
            "Operations123!",
            "Operations Manager",
            true,
            false);

        // Create legacy admin account for backward compatibility
        await CreateUserIfNotExists(userManager,
            "admin@ersatraining.com",
            "Admin123!",
            "Legacy Administrator",
            true,
            true);
    }

    private static async Task CreateUserIfNotExists(
        UserManager<User> userManager,
        string email,
        string password,
        string fullName,
        bool isAdmin,
        bool isSuperAdmin)
    {
        var existingUser = await userManager.FindByEmailAsync(email);
        if (existingUser != null)
        {
            Console.WriteLine($"User {email} already exists!");
            return;
        }

        var user = new User
        {
            UserName = email,
            Email = email,
            FullName = fullName,
            Locale = "en",
            Status = UserStatus.Active,
            IsAdmin = isAdmin,
            IsSuperAdmin = isSuperAdmin,
            EmailConfirmed = true,
            CreatedAt = DateTime.UtcNow
        };

        var result = await userManager.CreateAsync(user, password);

        if (result.Succeeded)
        {
            Console.WriteLine($"User {email} created successfully!");
            Console.WriteLine($"Email: {email}");
            Console.WriteLine($"Password: {password}");
            Console.WriteLine($"Role: {(isSuperAdmin ? "Super Admin" : "Operations Admin")}");
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

    private static async Task SeedSuperAdminAsync(UserManager<User> userManager, ILogger logger)
    {
        const string superAdminEmail = "superadmin@ersatraining.com";
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
                logger.LogInformation("Super admin user created successfully");
            }
            else
            {
                logger.LogError("Failed to create super admin user: {Errors}", string.Join(", ", result.Errors.Select(e => e.Description)));
            }
        }
        else
        {
            logger.LogInformation("Super admin user already exists");
        }
    }

    private static async Task SeedCoursesAsync(ErsaTrainingDbContext context, ILogger logger)
    {
        if (await context.Courses.AnyAsync())
        {
            logger.LogInformation("Courses already exist, skipping seed");
            return;
        }

        var courses = new List<Course>
        {
            new Course
            {
                Id = Guid.NewGuid(),
                Slug = "advanced-project-management",
                TitleEn = "Advanced Project Management",
                TitleAr = "إدارة المشاريع المتقدمة",
                DescriptionEn = "Master the art of project management with advanced techniques and methodologies. Learn to lead complex projects from initiation to closure.",
                DescriptionAr = "أتقن فن إدارة المشاريع بتقنيات ومنهجيات متقدمة. تعلم قيادة المشاريع المعقدة من البداية إلى النهاية.",
                Price = 299.99m,
                Type = CourseType.Live,
                Level=CourseLevel.Biginner,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Course
            {
                Id = Guid.NewGuid(),
                Slug = "digital-marketing-fundamentals",
                TitleEn = "Digital Marketing Fundamentals",
                TitleAr = "أساسيات التسويق الرقمي",
                DescriptionEn = "Learn the fundamentals of digital marketing including SEO, social media marketing, content marketing, and analytics.",
                DescriptionAr = "تعلم أساسيات التسويق الرقمي بما في ذلك تحسين محركات البحث والتسويق عبر وسائل التواصل الاجتماعي وتسويق المحتوى والتحليلات.",
                Price = 199.99m,
                Type = CourseType.PDF,
                Level=CourseLevel.Biginner,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Course
            {
                Id = Guid.NewGuid(),
                Slug = "data-science-with-python",
                TitleEn = "Data Science with Python",
                TitleAr = "علم البيانات باستخدام بايثون",
                DescriptionEn = "Comprehensive course covering data analysis, machine learning, and visualization using Python and popular libraries.",
                DescriptionAr = "دورة شاملة تغطي تحليل البيانات والتعلم الآلي والتصور باستخدام بايثون والمكتبات الشائعة.",
                Price = 399.99m,
                Type = CourseType.Live,
                Level=CourseLevel.Advanced,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Course
            {
                Id = Guid.NewGuid(),
                Slug = "leadership-and-team-management",
                TitleEn = "Leadership and Team Management",
                TitleAr = "القيادة وإدارة الفريق",
                DescriptionEn = "Develop essential leadership skills and learn effective team management strategies for modern workplaces.",
                DescriptionAr = "طور مهارات القيادة الأساسية وتعلم استراتيجيات إدارة الفريق الفعالة لأماكن العمل الحديثة.",
                Price = 249.99m,
                Type = CourseType.Live,
                Level=CourseLevel.Advanced,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Course
            {
                Id = Guid.NewGuid(),
                Slug = "financial-planning-and-analysis",
                TitleEn = "Financial Planning and Analysis",
                TitleAr = "التخطيط والتحليل المالي",
                DescriptionEn = "Master financial planning, budgeting, forecasting, and analysis techniques for business success.",
                DescriptionAr = "أتقن التخطيط المالي وتقنيات الميزانية والتنبؤ والتحليل لنجاح الأعمال.",
                Price = 329.99m,
                Type = CourseType.PDF,
                Level=CourseLevel.Biginner,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Course
            {
                Id = Guid.NewGuid(),
                Slug = "web-development-bootcamp",
                TitleEn = "Web Development Bootcamp",
                TitleAr = "معسكر تطوير الويب",
                DescriptionEn = "Full-stack web development course covering HTML, CSS, JavaScript, React, Node.js, and database management.",
                DescriptionAr = "دورة تطوير الويب الشاملة تغطي HTML و CSS و JavaScript و React و Node.js وإدارة قواعد البيانات.",
                Price = 499.99m,
                Type = CourseType.Live,Level=CourseLevel.Advanced,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Course
            {
                Id = Guid.NewGuid(),
                Slug = "cloud-computing-with-aws",
                TitleEn = "Cloud Computing with AWS",
                TitleAr = "الحوسبة السحابية مع أمازون ويب سيرفيسز",
                DescriptionEn = "Learn cloud computing concepts and hands-on AWS services including EC2, S3, Lambda, and more.",
                DescriptionAr = "تعلم مفاهيم الحوسبة السحابية وخدمات AWS العملية بما في ذلك EC2 و S3 و Lambda والمزيد.",
                Price = 379.99m,
                Type = CourseType.Live,
                Level=CourseLevel.Intermediate,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Course
            {
                Id = Guid.NewGuid(),
                Slug = "ux-ui-design-principles",
                TitleEn = "UX/UI Design Principles",
                TitleAr = "مبادئ تصميم تجربة وواجهة المستخدم",
                DescriptionEn = "Master user experience and user interface design principles, tools, and best practices for digital products.",
                DescriptionAr = "أتقن مبادئ تصميم تجربة المستخدم وواجهة المستخدم والأدوات وأفضل الممارسات للمنتجات الرقمية.",
                Price = 279.99m,
                Type = CourseType.PDF,
                Level=CourseLevel.Biginner,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Course
            {
                Id = Guid.NewGuid(),
                Slug = "cybersecurity-fundamentals2",
                TitleEn = "Cybersecurity Fundamentals",
                TitleAr = "أساسيات الأمن السيبراني",
                DescriptionEn = "Comprehensive introduction to cybersecurity concepts, threats, and protection strategies for organizations.",
                DescriptionAr = "مقدمة شاملة لمفاهيم الأمن السيبراني والتهديدات واستراتيجيات الحماية للمؤسسات.",
                Price = 349.99m,
                Type = CourseType.Live,
                Level=CourseLevel.Intermediate,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Course
            {
                Id = Guid.NewGuid(),
                Slug = "business-intelligence-and-analytics2",
                TitleEn = "Business Intelligence and Analytics",
                TitleAr = "ذكاء الأعمال والتحليلات",
                DescriptionEn = "Learn to transform data into actionable business insights using modern BI tools and analytical techniques.",
                DescriptionAr = "تعلم تحويل البيانات إلى رؤى عملية للأعمال باستخدام أدوات ذكاء الأعمال الحديثة والتقنيات التحليلية.",
                Price = 389.99m,
                Type = CourseType.PDF,
                Level=CourseLevel.Biginner,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Course
            {
                Id = Guid.NewGuid(),
                Slug = "Agileand-scrum-Methodology",
                TitleEn = "Agile and Scrum Methodology",
                TitleAr = "منهجية أجايل وسكرم",
                DescriptionEn = "Master Agile principles and Scrum framework for effective project management and team collaboration.",
                DescriptionAr = "أتقن مبادئ أجايل وإطار عمل سكرم لإدارة المشاريع الفعالة والتعاون الجماعي.",
                Price = 229.99m,
                Type = CourseType.Live,
                Level=CourseLevel.Biginner,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Course
            {
                Id = Guid.NewGuid(),
                Slug = "mobile-app-development2",
                TitleEn = "Mobile App Development",
                TitleAr = "تطوير تطبيقات الهاتف المحمول",
                Level=CourseLevel.Advanced,
                DescriptionEn = "Build native and cross-platform mobile applications using React Native, Flutter, and native development tools.",
                DescriptionAr = "بناء تطبيقات الهاتف المحمول الأصلية ومتعددة المنصات باستخدام React Native و Flutter وأدوات التطوير الأصلية.",
                Price = 449.99m,
                Type = CourseType.Live,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };

        context.Courses.AddRange(courses);
        logger.LogInformation("Added {Count} test courses", courses.Count);
    }

    private static async Task SeedContentPagesAsync(ErsaTrainingDbContext context, ILogger logger)
    {
        // Seed content pages if they don't exist
        var contentPagesCount = await context.ContentPages.CountAsync();
        if (contentPagesCount == 0)
        {
            await SeedContentPages(context, logger);
        }
        else
        {
            logger.LogInformation("Content pages already exist, skipping seed");
        }
    }

    private static async Task SeedContentPages(ErsaTrainingDbContext context, ILogger logger)
    {
        try
        {
            var contentPages = new List<ContentPage>();
            var contentSections = new List<ContentSection>();
            var contentBlocks = new List<ContentBlock>();

            // Home Page
            var homePage = new ContentPage
            {
                Id = Guid.NewGuid(),
                PageKey = "home",
                PageName = "Home Page",
                Description = "Main landing page",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            contentPages.Add(homePage);

            // Hero Section
            var heroSection = new ContentSection
            {
                Id = Guid.NewGuid(),
                ContentPageId = homePage.Id,
                SectionKey = "hero",
                SectionName = "Hero Section",
                Description = "Main banner section",
                SortOrder = 1,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            contentSections.Add(heroSection);

            contentBlocks.AddRange(new[]
            {
                new ContentBlock
                {
                    Id = Guid.NewGuid(),
                    ContentSectionId = heroSection.Id,
                    BlockKey = "title",
                    BlockName = "Title",
                    BlockType = "text",
                    ContentEn = "Welcome to Ersa Training",
                    ContentAr = "مرحباً بكم في إرسا للتدريب",
                    SortOrder = 1,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new ContentBlock
                {
                    Id = Guid.NewGuid(),
                    ContentSectionId = heroSection.Id,
                    BlockKey = "subtitle",
                    BlockName = "Subtitle",
                    BlockType = "text",
                    ContentEn = "Professional Training & Consultancy Services",
                    ContentAr = "خدمات التدريب والاستشارات المهنية",
                    SortOrder = 2,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new ContentBlock
                {
                    Id = Guid.NewGuid(),
                    ContentSectionId = heroSection.Id,
                    BlockKey = "description",
                    BlockName = "Description",
                    BlockType = "text",
                    ContentEn = "Empowering individuals and organizations with world-class training solutions",
                    ContentAr = "تمكين الأفراد والمؤسسات بحلول تدريبية عالمية المستوى",
                    SortOrder = 3,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            });

            // Other pages
            var otherPages = new[]
            {
                new { Key = "courses", Name = "Courses", Description = "Courses listing page" },
                new { Key = "about", Name = "About Us", Description = "About us page" },
                new { Key = "contact", Name = "Contact", Description = "Contact page" },
                new { Key = "consultation", Name = "Consultation", Description = "Consultation services page" }
            };

            foreach (var pageInfo in otherPages)
            {
                var page = new ContentPage
                {
                    Id = Guid.NewGuid(),
                    PageKey = pageInfo.Key,
                    PageName = pageInfo.Name,
                    Description = pageInfo.Description,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                contentPages.Add(page);

                var section = new ContentSection
                {
                    Id = Guid.NewGuid(),
                    ContentPageId = page.Id,
                    SectionKey = "header",
                    SectionName = "Page Header",
                    Description = $"{pageInfo.Name} page header",
                    SortOrder = 1,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                contentSections.Add(section);

                contentBlocks.Add(new ContentBlock
                {
                    Id = Guid.NewGuid(),
                    ContentSectionId = section.Id,
                    BlockKey = "title",
                    BlockName = "Title",
                    BlockType = "text",
                    ContentEn = pageInfo.Name,
                    ContentAr = pageInfo.Name,
                    SortOrder = 1,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
            }

            // FAQ Page with specific content
            var faqPage = new ContentPage
            {
                Id = Guid.NewGuid(),
                PageKey = "faq",
                PageName = "FAQ",
                Description = "Frequently asked questions",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            contentPages.Add(faqPage);

            var faqSection = new ContentSection
            {
                Id = Guid.NewGuid(),
                ContentPageId = faqPage.Id,
                SectionKey = "faq",
                SectionName = "FAQ Section",
                Description = "Frequently asked questions",
                SortOrder = 1,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            contentSections.Add(faqSection);

            contentBlocks.AddRange(new[]
            {
                new ContentBlock
                {
                    Id = Guid.NewGuid(),
                    ContentSectionId = faqSection.Id,
                    BlockKey = "faq_0",
                    BlockName = "How do I enroll in a course?",
                    BlockType = "faq",
                    ContentEn = "You can enroll through our website or contact us directly.",
                    ContentAr = "يمكنك التسجيل من خلال موقعنا أو التواصل معنا مباشرة.",
                    SortOrder = 1,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new ContentBlock
                {
                    Id = Guid.NewGuid(),
                    ContentSectionId = faqSection.Id,
                    BlockKey = "faq_1",
                    BlockName = "What payment methods do you accept?",
                    BlockType = "faq",
                    ContentEn = "We accept credit cards, bank transfers, and online payments.",
                    ContentAr = "نقبل البطاقات الائتمانية والتحويلات البنكية والمدفوعات الإلكترونية.",
                    SortOrder = 2,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            });

            context.ContentPages.AddRange(contentPages);
            context.ContentSections.AddRange(contentSections);
            context.ContentBlocks.AddRange(contentBlocks);

            await context.SaveChangesAsync();

            logger.LogInformation("Content pages seeded successfully with {PageCount} pages, {SectionCount} sections, and {BlockCount} blocks", 
                contentPages.Count, contentSections.Count, contentBlocks.Count);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error seeding content pages");
            throw;
        }
    }
}