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
            // Database should already be created by the calling code
            // Remove the EnsureCreatedAsync call to avoid conflicts

            // Seed Default Super Admins
            await CreateSuperAdminUser(serviceProvider);

            // Seed Super Admin User
            await SeedSuperAdminAsync(userManager, logger);

            // Seed Test Courses
            await SeedCoursesAsync(context, logger);

            // Seed Content Pages
            await SeedContentPagesAsync(context, logger);

            // Seed Mock Users for Orders
            await SeedMockUsersAsync(userManager, logger);

            // Seed Mock Orders and Payments
            await SeedMockOrdersAndPaymentsAsync(context, logger);

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
                SummaryEn = "Master the art of project management with advanced techniques and methodologies.",
                SummaryAr = "أتقن فن إدارة المشاريع بتقنيات ومنهجيات متقدمة.",
                DescriptionEn = "Master the art of project management with advanced techniques and methodologies. Learn to lead complex projects from initiation to closure.",
                DescriptionAr = "أتقن فن إدارة المشاريع بتقنيات ومنهجيات متقدمة. تعلم قيادة المشاريع المعقدة من البداية إلى النهاية.",
                Price = 299.99m,
                Type = CourseType.Live,
                Level = CourseLevel.Biginner,
                Category = CourseCategory.Business,
                InstructorName = "محمد أحمد",
                IsFeatured = true,
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
                SummaryEn = "Learn the fundamentals of digital marketing including SEO, social media marketing, and content marketing.",
                SummaryAr = "تعلم أساسيات التسويق الرقمي بما في ذلك تحسين محركات البحث والتسويق عبر وسائل التواصل الاجتماعي.",
                DescriptionEn = "Learn the fundamentals of digital marketing including SEO, social media marketing, content marketing, and analytics.",
                DescriptionAr = "تعلم أساسيات التسويق الرقمي بما في ذلك تحسين محركات البحث والتسويق عبر وسائل التواصل الاجتماعي وتسويق المحتوى والتحليلات.",
                Price = 199.99m,
                Type = CourseType.PDF,
                Level = CourseLevel.Biginner,
                Category = CourseCategory.Business,
                InstructorName = "سارة محمود",
                IsFeatured = true,
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
                SummaryEn = "Comprehensive course covering data analysis, machine learning, and visualization using Python.",
                SummaryAr = "دورة شاملة تغطي تحليل البيانات والتعلم الآلي والتصور باستخدام بايثون.",
                DescriptionEn = "Comprehensive course covering data analysis, machine learning, and visualization using Python and popular libraries.",
                DescriptionAr = "دورة شاملة تغطي تحليل البيانات والتعلم الآلي والتصور باستخدام بايثون والمكتبات الشائعة.",
                Price = 399.99m,
                Type = CourseType.Live,
                Level = CourseLevel.Advanced,
                Category = CourseCategory.Programming,
                InstructorName = "أحمد عبدالله",
                IsFeatured = false,
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
                SummaryEn = "Develop essential leadership skills and learn effective team management strategies.",
                SummaryAr = "طور مهارات القيادة الأساسية وتعلم استراتيجيات إدارة الفريق الفعالة.",
                DescriptionEn = "Develop essential leadership skills and learn effective team management strategies for modern workplaces.",
                DescriptionAr = "طور مهارات القيادة الأساسية وتعلم استراتيجيات إدارة الفريق الفعالة لأماكن العمل الحديثة.",
                Price = 249.99m,
                Type = CourseType.Live,
                Level = CourseLevel.Advanced,
                Category = CourseCategory.Business,
                InstructorName = "فاطمة العلي",
                IsFeatured = false,
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
                SummaryEn = "Master financial planning, budgeting, forecasting, and analysis techniques for business success.",
                SummaryAr = "أتقن التخطيط المالي وتقنيات الميزانية والتنبؤ والتحليل لنجاح الأعمال.",
                DescriptionEn = "Master financial planning, budgeting, forecasting, and analysis techniques for business success.",
                DescriptionAr = "أتقن التخطيط المالي وتقنيات الميزانية والتنبؤ والتحليل لنجاح الأعمال.",
                Price = 329.99m,
                Type = CourseType.PDF,
                Level = CourseLevel.Biginner,
                Category = CourseCategory.Business,
                InstructorName = "خالد السعد",
                IsFeatured = false,
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
                SummaryEn = "Full-stack web development course covering HTML, CSS, JavaScript, React, and Node.js.",
                SummaryAr = "دورة تطوير الويب الشاملة تغطي HTML و CSS و JavaScript و React و Node.js.",
                DescriptionEn = "Full-stack web development course covering HTML, CSS, JavaScript, React, Node.js, and database management.",
                DescriptionAr = "دورة تطوير الويب الشاملة تغطي HTML و CSS و JavaScript و React و Node.js وإدارة قواعد البيانات.",
                Price = 499.99m,
                Type = CourseType.Live,
                Level = CourseLevel.Advanced,
                Category = CourseCategory.Programming,
                InstructorName = "عمر حسن",
                IsFeatured = true,
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
                SummaryEn = "Learn cloud computing concepts and hands-on AWS services including EC2, S3, and Lambda.",
                SummaryAr = "تعلم مفاهيم الحوسبة السحابية وخدمات AWS العملية بما في ذلك EC2 و S3 و Lambda.",
                DescriptionEn = "Learn cloud computing concepts and hands-on AWS services including EC2, S3, Lambda, and more.",
                DescriptionAr = "تعلم مفاهيم الحوسبة السحابية وخدمات AWS العملية بما في ذلك EC2 و S3 و Lambda والمزيد.",
                Price = 379.99m,
                Type = CourseType.Live,
                Level = CourseLevel.Intermediate,
                Category = CourseCategory.Programming,
                InstructorName = "ياسر قاسم",
                IsFeatured = false,
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
                SummaryEn = "Master user experience and user interface design principles and tools for digital products.",
                SummaryAr = "أتقن مبادئ تصميم تجربة المستخدم وواجهة المستخدم والأدوات للمنتجات الرقمية.",
                DescriptionEn = "Master user experience and user interface design principles, tools, and best practices for digital products.",
                DescriptionAr = "أتقن مبادئ تصميم تجربة المستخدم وواجهة المستخدم والأدوات وأفضل الممارسات للمنتجات الرقمية.",
                Price = 279.99m,
                Type = CourseType.PDF,
                Level = CourseLevel.Biginner,
                Category = CourseCategory.Design,
                InstructorName = "مريم الزهراني",
                IsFeatured = true,
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
                SummaryEn = "Comprehensive introduction to cybersecurity concepts, threats, and protection strategies.",
                SummaryAr = "مقدمة شاملة لمفاهيم الأمن السيبراني والتهديدات واستراتيجيات الحماية.",
                DescriptionEn = "Comprehensive introduction to cybersecurity concepts, threats, and protection strategies for organizations.",
                DescriptionAr = "مقدمة شاملة لمفاهيم الأمن السيبراني والتهديدات واستراتيجيات الحماية للمؤسسات.",
                Price = 349.99m,
                Type = CourseType.Live,
                Level = CourseLevel.Intermediate,
                Category = CourseCategory.Programming,
                InstructorName = "أحمد الشمري",
                IsFeatured = false,
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
                SummaryEn = "Learn to transform data into actionable business insights using modern BI tools.",
                SummaryAr = "تعلم تحويل البيانات إلى رؤى عملية للأعمال باستخدام أدوات ذكاء الأعمال الحديثة.",
                DescriptionEn = "Learn to transform data into actionable business insights using modern BI tools and analytical techniques.",
                DescriptionAr = "تعلم تحويل البيانات إلى رؤى عملية للأعمال باستخدام أدوات ذكاء الأعمال الحديثة والتقنيات التحليلية.",
                Price = 389.99m,
                Type = CourseType.PDF,
                Level = CourseLevel.Biginner,
                Category = CourseCategory.Business,
                InstructorName = "نورا الخالد",
                IsFeatured = false,
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
                SummaryEn = "Master Agile principles and Scrum framework for effective project management.",
                SummaryAr = "أتقن مبادئ أجايل وإطار عمل سكرم لإدارة المشاريع الفعالة.",
                DescriptionEn = "Master Agile principles and Scrum framework for effective project management and team collaboration.",
                DescriptionAr = "أتقن مبادئ أجايل وإطار عمل سكرم لإدارة المشاريع الفعالة والتعاون الجماعي.",
                Price = 229.99m,
                Type = CourseType.Live,
                Level = CourseLevel.Biginner,
                Category = CourseCategory.Business,
                InstructorName = "علي المطيري",
                IsFeatured = false,
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
                SummaryEn = "Build native and cross-platform mobile applications using React Native and Flutter.",
                SummaryAr = "بناء تطبيقات الهاتف المحمول الأصلية ومتعددة المنصات باستخدام React Native و Flutter.",
                DescriptionEn = "Build native and cross-platform mobile applications using React Native, Flutter, and native development tools.",
                DescriptionAr = "بناء تطبيقات الهاتف المحمول الأصلية ومتعددة المنصات باستخدام React Native و Flutter وأدوات التطوير الأصلية.",
                Price = 449.99m,
                Type = CourseType.Live,
                Level = CourseLevel.Advanced,
                Category = CourseCategory.Programming,
                InstructorName = "سلمان الدوسري",
                IsFeatured = false,
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

    private static async Task SeedMockUsersAsync(UserManager<User> userManager, ILogger logger)
    {
        var mockUsers = new[]
        {
            new { Email = "ahmed.hassan@email.com", Password = "Ahmed123!", FullName = "Ahmed Hassan", Phone = "+966501234567", Locale = "ar", Country = "Saudi Arabia" },
            new { Email = "sarah.johnson@email.com", Password = "Sarah123!", FullName = "Sarah Johnson", Phone = "+966507654321", Locale = "en", Country = "United States" },
            new { Email = "mohammed.ali@email.com", Password = "Mohammed123!", FullName = "Mohammed Ali", Phone = "+966509876543", Locale = "ar", Country = "Saudi Arabia" },
            new { Email = "fatima.omar@email.com", Password = "Fatima123!", FullName = "Fatima Omar", Phone = "+966502468135", Locale = "ar", Country = "UAE" },
            new { Email = "john.smith@email.com", Password = "John123!", FullName = "John Smith", Phone = "+966508642097", Locale = "en", Country = "Canada" }
        };

        foreach (var mockUser in mockUsers)
        {
            var existingUser = await userManager.FindByEmailAsync(mockUser.Email);
            if (existingUser == null)
            {
                var user = new User
                {
                    UserName = mockUser.Email,
                    Email = mockUser.Email,
                    FullName = mockUser.FullName,
                    Phone = mockUser.Phone,
                    Locale = mockUser.Locale,
                    Country = mockUser.Country,
                    Status = UserStatus.Active,
                    IsAdmin = false,
                    IsSuperAdmin = false,
                    EmailConfirmed = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-30)
                };

                var result = await userManager.CreateAsync(user, mockUser.Password);
                if (result.Succeeded)
                {
                    logger.LogInformation("Mock user {Email} created successfully", mockUser.Email);
                }
                else
                {
                    logger.LogError("Failed to create mock user {Email}: {Errors}", mockUser.Email, string.Join(", ", result.Errors.Select(e => e.Description)));
                }
            }
        }
    }

    private static async Task SeedMockOrdersAndPaymentsAsync(ErsaTrainingDbContext context, ILogger logger)
    {
        if (await context.Orders.AnyAsync())
        {
            logger.LogInformation("Orders already exist, skipping mock orders seed");
            return;
        }

        // Get existing users and courses
        var users = await context.Users.Where(u => !u.IsAdmin).Take(5).ToListAsync();
        var courses = await context.Courses.Take(3).ToListAsync();

        if (!users.Any() || !courses.Any())
        {
            logger.LogWarning("No users or courses found for seeding orders");
            return;
        }

        var random = new Random();
        var orders = new List<Order>();

        // Create 17 orders with different statuses and dates
        var orderStatuses = new[] { OrderStatus.Processed, OrderStatus.Paid, OrderStatus.UnderProcess, OrderStatus.PendingPayment, OrderStatus.Failed, OrderStatus.New, OrderStatus.Expired, OrderStatus.Refunded };

        for (int i = 1; i <= 17; i++)
        {
            var user = users[random.Next(users.Count)];
            var course = courses[random.Next(courses.Count)];
            var status = orderStatuses[random.Next(orderStatuses.Length)];
            var daysAgo = random.Next(1, 45);

            var order = new Order
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Amount = course.Price,
                Currency = "SAR",
                Status = status,
                CreatedAt = DateTime.UtcNow.AddDays(-daysAgo),
                UpdatedAt = DateTime.UtcNow.AddDays(-daysAgo + random.Next(0, 3))
            };

            orders.Add(order);

            // Create order item
            var orderItem = new OrderItem
            {
                Id = Guid.NewGuid(),
                OrderId = order.Id,
                CourseId = course.Id,
                CourseTitleEn = course.TitleEn,
                CourseTitleAr = course.TitleAr,
                Price = course.Price,
                Currency = "SAR",
                Qty = 1,
                CreatedAt = order.CreatedAt
            };

            context.OrderItems.Add(orderItem);

            // Create payment for orders that have been paid or processed
            if (status == OrderStatus.Paid || status == OrderStatus.Processed || status == OrderStatus.Failed || status == OrderStatus.Refunded)
            {
                var providers = new[] { "HyperPay", "Tabby", "Tamara" };
                var paymentStatus = status switch
                {
                    OrderStatus.Paid or OrderStatus.Processed => PaymentStatus.Completed,
                    OrderStatus.Failed => PaymentStatus.Failed,
                    OrderStatus.Refunded => PaymentStatus.Refunded,
                    _ => PaymentStatus.Pending
                };

                var payment = new Payment
                {
                    Id = Guid.NewGuid(),
                    OrderId = order.Id,
                    Provider = providers[random.Next(providers.Length)],
                    ProviderRef = $"REF_{random.Next(100000, 999999)}",
                    Status = paymentStatus,
                    CapturedAt = paymentStatus == PaymentStatus.Completed ? order.UpdatedAt : null,
                    RawPayload = $"{{\"status\":\"{paymentStatus.ToString().ToLower()}\",\"transaction_id\":\"REF_{random.Next(100000, 999999)}\",\"amount\":{order.Amount}}}",
                    CreatedAt = order.CreatedAt,
                    UpdatedAt = order.UpdatedAt
                };

                context.Payments.Add(payment);
            }
            else if (status == OrderStatus.PendingPayment || status == OrderStatus.UnderProcess)
            {
                var providers = new[] { "HyperPay", "Tabby", "Tamara" };
                var paymentStatus = status == OrderStatus.UnderProcess ? PaymentStatus.Processing : PaymentStatus.Pending;

                var payment = new Payment
                {
                    Id = Guid.NewGuid(),
                    OrderId = order.Id,
                    Provider = providers[random.Next(providers.Length)],
                    ProviderRef = $"REF_{random.Next(100000, 999999)}",
                    Status = paymentStatus,
                    CapturedAt = null,
                    RawPayload = $"{{\"status\":\"{paymentStatus.ToString().ToLower()}\",\"transaction_id\":\"REF_{random.Next(100000, 999999)}\",\"amount\":{order.Amount}}}",
                    CreatedAt = order.CreatedAt,
                    UpdatedAt = order.UpdatedAt
                };

                context.Payments.Add(payment);
            }
        }

        context.Orders.AddRange(orders);
        logger.LogInformation("Added {Count} mock orders with payments", orders.Count);
    }
}
