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

            // Seed Instructors
            await SeedInstructorsAsync(context, logger);

            // Seed Test Courses
            await SeedCoursesAsync(context, logger);

            // Seed Course-Instructor Mappings
            await SeedCourseInstructorsAsync(context, logger);

            // Seed Content Pages
            await SeedContentPagesAsync(context, logger);

            // Seed Mock Users for Orders
            await SeedMockUsersAsync(userManager, roleService, logger);

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
            IsAdmin = roleName == RoleNames.Admin || roleName == RoleNames.SuperAdmin,
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

    private static async Task SeedInstructorsAsync(ErsaTrainingDbContext context, ILogger logger)
    {
        if (await context.Instructors.AnyAsync())
        {
            logger.LogInformation("Instructors already exist, skipping seed");
            return;
        }

        var instructors = new List<Instructor>
        {
            new Instructor
            {
                Id = new Guid("11111111-1111-1111-1111-000000000001"),
                InstructorNameEn = "Dr. Mohammed Ahmed",
                InstructorNameAr = "د. محمد أحمد",
                InstructorBioEn = "Expert in project management with over 15 years of experience. Certified PMP and Agile coach with extensive international experience.",
                InstructorBioAr = "خبير في إدارة المشاريع مع أكثر من 15 عامًا من الخبرة. حاصل على شهادة PMP ومدرب أجايل معتمد مع خبرة دولية واسعة.",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Instructor
            {
                Id = new Guid("11111111-1111-1111-1111-000000000002"),
                InstructorNameEn = "Sarah Mahmoud",
                InstructorNameAr = "سارة محمود",
                InstructorBioEn = "Certified digital marketing expert with 10 years experience. Specializes in SEO, social media marketing, and content strategy.",
                InstructorBioAr = "خبيرة تسويق رقمي معتمدة مع 10 سنوات خبرة. متخصصة في تحسين محركات البحث والتسويق عبر وسائل التواصل الاجتماعي واستراتيجية المحتوى.",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Instructor
            {
                Id = new Guid("11111111-1111-1111-1111-000000000003"),
                InstructorNameEn = "Dr. Ahmed Abdullah",
                InstructorNameAr = "د. أحمد عبدالله",
                InstructorBioEn = "Certified data scientist and AI trainer. PhD in Computer Science with focus on machine learning and deep learning applications.",
                InstructorBioAr = "عالم بيانات معتمد ومدرب في الذكاء الاصطناعي. دكتوراه في علوم الحاسوب مع التركيز على تطبيقات التعلم الآلي والتعلم العميق.",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Instructor
            {
                Id = new Guid("11111111-1111-1111-1111-000000000004"),
                InstructorNameEn = "Fatima Al-Ali",
                InstructorNameAr = "فاطمة العلي",
                InstructorBioEn = "Organizational leadership consultant and certified trainer. Expert in team building, conflict resolution, and performance management.",
                InstructorBioAr = "مستشارة قيادة تنظيمية ومدربة معتمدة. خبيرة في بناء الفريق وحل النزاعات وإدارة الأداء.",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Instructor
            {
                Id = new Guid("11111111-1111-1111-1111-000000000005"),
                InstructorNameEn = "Eng. Omar Hassan",
                InstructorNameAr = "م. عمر حسن",
                InstructorBioEn = "Full-stack web developer and university lecturer. Expert in modern web technologies including React, Node.js, and cloud platforms.",
                InstructorBioAr = "مطور ويب متخصص وأستاذ جامعي. خبير في تقنيات الويب الحديثة بما في ذلك React و Node.js والمنصات السحابية.",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Instructor
            {
                Id = new Guid("11111111-1111-1111-1111-000000000006"),
                InstructorNameEn = "Maryam Al-Zahrani",
                InstructorNameAr = "مريم الزهراني",
                InstructorBioEn = "Award-winning UX/UI designer with expertise in user research, prototyping, and design systems. 8+ years of industry experience.",
                InstructorBioAr = "مصممة UX/UI حائزة على جوائز مع خبرة في بحث المستخدم والنماذج الأولية وأنظمة التصميم. أكثر من 8 سنوات من الخبرة في هذا المجال.",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };

        context.Instructors.AddRange(instructors);
        await context.SaveChangesAsync();
        logger.LogInformation("Added {Count} instructors", instructors.Count);
    }

    private static async Task SeedCoursesAsync(ErsaTrainingDbContext context, ILogger logger)
    {
        if (await context.Courses.AnyAsync())
        {
            logger.LogInformation("Courses already exist, skipping seed");
            return;
        }

        // Get seeded categories and sub-categories
        var professionalCertCategory = new Guid("11111111-1111-1111-1111-111111111111");
        var customProgramsCategory = new Guid("22222222-2222-2222-2222-222222222222");
        var generalCoursesCategory = new Guid("33333333-3333-3333-3333-333333333333");

        var projectMgmtSubCat = new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
        var softSkillsSubCat = new Guid("cccccccc-cccc-cccc-cccc-cccccccccccc");
        var programmingSubCat = new Guid("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee");
        var digitalMarketingSubCat = new Guid("ffffffff-ffff-ffff-ffff-ffffffffffff");
        var dataScienceSubCat = new Guid("10101010-1010-1010-1010-101010101010");
        var designSubCat = new Guid("20202020-2020-2020-2020-202020202020");
        var hrSubCat = new Guid("dddddddd-dddd-dddd-dddd-dddddddddddd");

        var course1Id = Guid.NewGuid();
        var course2Id = Guid.NewGuid();
        var course3Id = Guid.NewGuid();
        var course4Id = Guid.NewGuid();
        var course5Id = Guid.NewGuid();
        var course6Id = Guid.NewGuid();
        var course7Id = Guid.NewGuid();
        var course8Id = Guid.NewGuid();
        var course9Id = Guid.NewGuid();
        var course10Id = Guid.NewGuid();
        var course11Id = Guid.NewGuid();
        var course12Id = Guid.NewGuid();

        var courses = new List<Course>
        {
            new Course
            {
                Id = course1Id,
                Slug = "advanced-project-management",
                TitleEn = "Advanced Project Management",
                TitleAr = "إدارة المشاريع المتقدمة",
                SummaryEn = "Master the art of project management with advanced techniques and methodologies.",
                SummaryAr = "أتقن فن إدارة المشاريع بتقنيات ومنهجيات متقدمة.",
                DescriptionEn = "Master the art of project management with advanced techniques and methodologies. Learn to lead complex projects from initiation to closure.",
                DescriptionAr = "أتقن فن إدارة المشاريع بتقنيات ومنهجيات متقدمة. تعلم قيادة المشاريع المعقدة من البداية إلى النهاية.",
                CourseTopicsEn = "Project Planning, Risk Management, Stakeholder Communication, Agile Methodologies, Budget Control",
                CourseTopicsAr = "تخطيط المشاريع، إدارة المخاطر، التواصل مع أصحاب المصلحة، منهجيات أجايل، التحكم في الميزانية",
                Price = 299.99m,
                Currency = "SAR",
                Type = CourseType.Live,
                Level = CourseLevel.Biginner,
                CategoryId = professionalCertCategory,
                InstructorNameAr = "محمد أحمد",
                InstructorNameEn = "Mohammed Ahmed",
                InstructorsBioAr = "خبير في إدارة المشاريع مع أكثر من 15 عامًا من الخبرة",
                InstructorsBioEn = "Project management expert with over 15 years of experience",
                DurationEn = "40 hours",
                DurationAr = "40 ساعة",
                From = DateTime.UtcNow.AddDays(30),
                To = DateTime.UtcNow.AddDays(60),
                SessionsNotesEn = "Classes on Sundays and Tuesdays from 6PM to 9PM",
                SessionsNotesAr = "الحصص أيام الأحد والثلاثاء من 6 مساءً إلى 9 مساءً",
                VideoUrl = "https://example.com/video1.mp4",
                Tags = "project-management,pmp,agile,leadership",
                IsFeatured = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Course
            {
                Id = course2Id,
                Slug = "digital-marketing-fundamentals",
                TitleEn = "Digital Marketing Fundamentals",
                TitleAr = "أساسيات التسويق الرقمي",
                SummaryEn = "Learn the fundamentals of digital marketing including SEO, social media marketing, and content marketing.",
                SummaryAr = "تعلم أساسيات التسويق الرقمي بما في ذلك تحسين محركات البحث والتسويق عبر وسائل التواصل الاجتماعي.",
                DescriptionEn = "Learn the fundamentals of digital marketing including SEO, social media marketing, content marketing, and analytics.",
                DescriptionAr = "تعلم أساسيات التسويق الرقمي بما في ذلك تحسين محركات البحث والتسويق عبر وسائل التواصل الاجتماعي وتسويق المحتوى والتحليلات.",
                CourseTopicsEn = "SEO Basics, Social Media Strategy, Content Marketing, Email Campaigns, Analytics & Reporting",
                CourseTopicsAr = "أساسيات تحسين محركات البحث، استراتيجية وسائل التواصل الاجتماعي، تسويق المحتوى، حملات البريد الإلكتروني، التحليلات والتقارير",
                Price = 199.99m,
                Currency = "SAR",
                Type = CourseType.PDF,
                Level = CourseLevel.Biginner,
                CategoryId = generalCoursesCategory,
                InstructorNameAr = "سارة محمود",
                InstructorNameEn = "Sarah Mahmoud",
                InstructorsBioAr = "خبيرة تسويق رقمي معتمدة مع 10 سنوات خبرة",
                InstructorsBioEn = "Certified digital marketing expert with 10 years experience",
                DurationEn = "30 hours",
                DurationAr = "30 ساعة",
                Tags = "digital-marketing,seo,social-media,content-marketing",
                IsFeatured = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Course
            {
                Id = course3Id,
                Slug = "data-science-with-python",
                TitleEn = "Data Science with Python",
                TitleAr = "علم البيانات باستخدام بايثون",
                SummaryEn = "Comprehensive course covering data analysis, machine learning, and visualization using Python.",
                SummaryAr = "دورة شاملة تغطي تحليل البيانات والتعلم الآلي والتصور باستخدام بايثون.",
                DescriptionEn = "Comprehensive course covering data analysis, machine learning, and visualization using Python and popular libraries.",
                DescriptionAr = "دورة شاملة تغطي تحليل البيانات والتعلم الآلي والتصور باستخدام بايثون والمكتبات الشائعة.",
                CourseTopicsEn = "Python Fundamentals, Pandas & NumPy, Machine Learning Algorithms, Data Visualization, Deep Learning Basics",
                CourseTopicsAr = "أساسيات بايثون، باندز ونامباي، خوارزميات التعلم الآلي، تصور البيانات، أساسيات التعلم العميق",
                Price = 399.99m,
                Currency = "SAR",
                Type = CourseType.Live,
                Level = CourseLevel.Advanced,
                CategoryId = professionalCertCategory,
                InstructorNameAr = "أحمد عبدالله",
                InstructorNameEn = "Ahmed Abdullah",
                InstructorsBioAr = "عالم بيانات معتمد ومدرب في الذكاء الاصطناعي",
                InstructorsBioEn = "Certified data scientist and AI trainer",
                DurationEn = "60 hours",
                DurationAr = "60 ساعة",
                From = DateTime.UtcNow.AddDays(45),
                To = DateTime.UtcNow.AddDays(90),
                SessionsNotesEn = "Intensive course: Mon, Wed, Thu 7PM-10PM",
                SessionsNotesAr = "دورة مكثفة: الاثنين والأربعاء والخميس 7-10 مساءً",
                VideoUrl = "https://example.com/video3.mp4",
                Tags = "data-science,python,machine-learning,ai",
                IsFeatured = false,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Course
            {
                Id = course4Id,
                Slug = "leadership-and-team-management",
                TitleEn = "Leadership and Team Management",
                TitleAr = "القيادة وإدارة الفريق",
                SummaryEn = "Develop essential leadership skills and learn effective team management strategies.",
                SummaryAr = "طور مهارات القيادة الأساسية وتعلم استراتيجيات إدارة الفريق الفعالة.",
                DescriptionEn = "Develop essential leadership skills and learn effective team management strategies for modern workplaces.",
                DescriptionAr = "طور مهارات القيادة الأساسية وتعلم استراتيجيات إدارة الفريق الفعالة لأماكن العمل الحديثة.",
                CourseTopicsEn = "Leadership Styles, Team Building, Conflict Resolution, Motivation Techniques, Performance Management",
                CourseTopicsAr = "أنماط القيادة، بناء الفريق، حل النزاعات، تقنيات التحفيز، إدارة الأداء",
                Price = 249.99m,
                Currency = "SAR",
                Type = CourseType.Live,
                Level = CourseLevel.Advanced,
                CategoryId = customProgramsCategory,
                InstructorNameAr = "فاطمة العلي",
                InstructorNameEn = "Fatima Al-Ali",
                InstructorsBioAr = "مستشارة قيادة تنظيمية ومدربة معتمدة",
                InstructorsBioEn = "Organizational leadership consultant and certified trainer",
                DurationEn = "35 hours",
                DurationAr = "35 ساعة",
                Tags = "leadership,management,team-building,soft-skills",
                IsFeatured = false,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Course
            {
                Id = course5Id,
                Slug = "financial-planning-and-analysis",
                TitleEn = "Financial Planning and Analysis",
                TitleAr = "التخطيط والتحليل المالي",
                SummaryEn = "Master financial planning, budgeting, forecasting, and analysis techniques for business success.",
                SummaryAr = "أتقن التخطيط المالي وتقنيات الميزانية والتنبؤ والتحليل لنجاح الأعمال.",
                DescriptionEn = "Master financial planning, budgeting, forecasting, and analysis techniques for business success.",
                DescriptionAr = "أتقن التخطيط المالي وتقنيات الميزانية والتنبؤ والتحليل لنجاح الأعمال.",
                CourseTopicsEn = "Financial Statements Analysis, Budgeting Techniques, Forecasting Models, KPI Development, Investment Analysis",
                CourseTopicsAr = "تحليل القوائم المالية، تقنيات الميزانية، نماذج التنبؤ، تطوير مؤشرات الأداء، تحليل الاستثمار",
                Price = 329.99m,
                Currency = "SAR",
                Type = CourseType.PDF,
                Level = CourseLevel.Biginner,
                CategoryId = generalCoursesCategory,
                InstructorNameAr = "خالد السعد",
                InstructorNameEn = "Khalid Al-Saad",
                InstructorsBioAr = "محلل مالي معتمد مع خبرة 12 عامًا",
                InstructorsBioEn = "Certified financial analyst with 12 years experience",
                DurationEn = "25 hours",
                DurationAr = "25 ساعة",
                Tags = "finance,planning,budgeting,analysis",
                IsFeatured = false,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Course
            {
                Id = course6Id,
                Slug = "web-development-bootcamp",
                TitleEn = "Web Development Bootcamp",
                TitleAr = "معسكر تطوير الويب",
                SummaryEn = "Full-stack web development course covering HTML, CSS, JavaScript, React, and Node.js.",
                SummaryAr = "دورة تطوير الويب الشاملة تغطي HTML و CSS و JavaScript و React و Node.js.",
                DescriptionEn = "Full-stack web development course covering HTML, CSS, JavaScript, React, Node.js, and database management.",
                DescriptionAr = "دورة تطوير الويب الشاملة تغطي HTML و CSS و JavaScript و React و Node.js وإدارة قواعد البيانات.",
                CourseTopicsEn = "HTML5 & CSS3, JavaScript ES6+, React & Redux, Node.js & Express, MongoDB & SQL",
                CourseTopicsAr = "HTML5 و CSS3، جافا سكريبت ES6+، رياكت وريداكس، نود جي إس وإكسبريس، مونجو دي بي وSQL",
                Price = 499.99m,
                Currency = "SAR",
                Type = CourseType.Live,
                Level = CourseLevel.Advanced,
                CategoryId = professionalCertCategory,
                InstructorNameAr = "عمر حسن",
                InstructorNameEn = "Omar Hassan",
                InstructorsBioAr = "مطور ويب متخصص وأستاذ جامعي",
                InstructorsBioEn = "Full-stack web developer and university lecturer",
                DurationEn = "80 hours",
                DurationAr = "80 ساعة",
                VideoUrl = "https://example.com/video6.mp4",
                Tags = "web-development,react,nodejs,javascript,fullstack",
                IsFeatured = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Course
            {
                Id = course7Id,
                Slug = "cloud-computing-with-aws",
                TitleEn = "Cloud Computing with AWS",
                TitleAr = "الحوسبة السحابية مع أمازون ويب سيرفيسز",
                SummaryEn = "Learn cloud computing concepts and hands-on AWS services including EC2, S3, and Lambda.",
                SummaryAr = "تعلم مفاهيم الحوسبة السحابية وخدمات AWS العملية بما في ذلك EC2 و S3 و Lambda.",
                DescriptionEn = "Learn cloud computing concepts and hands-on AWS services including EC2, S3, Lambda, and more.",
                DescriptionAr = "تعلم مفاهيم الحوسبة السحابية وخدمات AWS العملية بما في ذلك EC2 و S3 و Lambda والمزيد.",
                CourseTopicsEn = "AWS EC2 & S3, Lambda Functions, VPC & Networking, IAM Security, CloudFormation",
                CourseTopicsAr = "AWS EC2 و S3، دوال لامبدا، VPC والشبكات، أمان IAM، CloudFormation",
                Price = 379.99m,
                Currency = "SAR",
                Type = CourseType.Live,
                Level = CourseLevel.Intermediate,
                CategoryId = professionalCertCategory,
                InstructorNameAr = "ياسر قاسم",
                InstructorNameEn = "Yasser Qasim",
                InstructorsBioAr = "مهندس سحابة معتمد من AWS",
                InstructorsBioEn = "AWS Certified Cloud Engineer",
                DurationEn = "45 hours",
                DurationAr = "45 ساعة",
                VideoUrl = "https://example.com/video7.mp4",
                Tags = "aws,cloud-computing,devops,infrastructure",
                IsFeatured = false,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Course
            {
                Id = course8Id,
                Slug = "ux-ui-design-principles",
                TitleEn = "UX/UI Design Principles",
                TitleAr = "مبادئ تصميم تجربة وواجهة المستخدم",
                SummaryEn = "Master user experience and user interface design principles and tools for digital products.",
                SummaryAr = "أتقن مبادئ تصميم تجربة المستخدم وواجهة المستخدم والأدوات للمنتجات الرقمية.",
                DescriptionEn = "Master user experience and user interface design principles, tools, and best practices for digital products.",
                DescriptionAr = "أتقن مبادئ تصميم تجربة المستخدم وواجهة المستخدم والأدوات وأفضل الممارسات للمنتجات الرقمية.",
                CourseTopicsEn = "User Research, Wireframing & Prototyping, Figma & Adobe XD, Design Systems, Usability Testing",
                CourseTopicsAr = "بحث المستخدم، الإطارات الشبكية والنماذج الأولية، فيجما وأدوبي XD، أنظمة التصميم، اختبار قابلية الاستخدام",
                Price = 279.99m,
                Currency = "SAR",
                Type = CourseType.PDF,
                Level = CourseLevel.Biginner,
                CategoryId = generalCoursesCategory,
                InstructorNameAr = "مريم الزهراني",
                InstructorNameEn = "Maryam Al-Zahrani",
                InstructorsBioAr = "مصممة UX/UI حائزة على جوائز",
                InstructorsBioEn = "Award-winning UX/UI designer",
                DurationEn = "30 hours",
                DurationAr = "30 ساعة",
                Tags = "ux,ui,design,figma,user-experience",
                IsFeatured = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Course
            {
                Id = course9Id,
                Slug = "cybersecurity-fundamentals2",
                TitleEn = "Cybersecurity Fundamentals",
                TitleAr = "أساسيات الأمن السيبراني",
                SummaryEn = "Comprehensive introduction to cybersecurity concepts, threats, and protection strategies.",
                SummaryAr = "مقدمة شاملة لمفاهيم الأمن السيبراني والتهديدات واستراتيجيات الحماية.",
                DescriptionEn = "Comprehensive introduction to cybersecurity concepts, threats, and protection strategies for organizations.",
                DescriptionAr = "مقدمة شاملة لمفاهيم الأمن السيبراني والتهديدات واستراتيجيات الحماية للمؤسسات.",
                CourseTopicsEn = "Network Security, Cryptography Basics, Penetration Testing, Security Policies, Incident Response",
                CourseTopicsAr = "أمن الشبكات، أساسيات التشفير، اختبار الاختراق، سياسات الأمان، الاستجابة للحوادث",
                Price = 349.99m,
                Currency = "SAR",
                Type = CourseType.Live,
                Level = CourseLevel.Intermediate,
                CategoryId = professionalCertCategory,
                InstructorNameAr = "أحمد الشمري",
                InstructorNameEn = "Ahmed Al-Shammari",
                InstructorsBioAr = "خبير أمن سيبراني معتمد CISSP",
                InstructorsBioEn = "CISSP Certified Cybersecurity Expert",
                DurationEn = "50 hours",
                DurationAr = "50 ساعة",
                VideoUrl = "https://example.com/video9.mp4",
                Tags = "cybersecurity,security,penetration-testing,network-security",
                IsFeatured = false,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Course
            {
                Id = course10Id,
                Slug = "business-intelligence-and-analytics2",
                TitleEn = "Business Intelligence and Analytics",
                TitleAr = "ذكاء الأعمال والتحليلات",
                SummaryEn = "Learn to transform data into actionable business insights using modern BI tools.",
                SummaryAr = "تعلم تحويل البيانات إلى رؤى عملية للأعمال باستخدام أدوات ذكاء الأعمال الحديثة.",
                DescriptionEn = "Learn to transform data into actionable business insights using modern BI tools and analytical techniques.",
                DescriptionAr = "تعلم تحويل البيانات إلى رؤى عملية للأعمال باستخدام أدوات ذكاء الأعمال الحديثة والتقنيات التحليلية.",
                CourseTopicsEn = "Power BI & Tableau, Data Warehousing, ETL Processes, Dashboard Design, Predictive Analytics",
                CourseTopicsAr = "باور بي آي وتابلو، مستودعات البيانات، عمليات ETL، تصميم لوحات المعلومات، التحليلات التنبؤية",
                Price = 389.99m,
                Currency = "SAR",
                Type = CourseType.PDF,
                Level = CourseLevel.Biginner,
                CategoryId = customProgramsCategory,
                InstructorNameAr = "نورا الخالد",
                InstructorNameEn = "Nora Al-Khalid",
                InstructorsBioAr = "محللة ذكاء أعمال معتمدة",
                InstructorsBioEn = "Certified Business Intelligence Analyst",
                DurationEn = "40 hours",
                DurationAr = "40 ساعة",
                Tags = "business-intelligence,powerbi,tableau,analytics,data",
                IsFeatured = false,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Course
            {
                Id = course11Id,
                Slug = "Agileand-scrum-Methodology",
                TitleEn = "Agile and Scrum Methodology",
                TitleAr = "منهجية أجايل وسكرم",
                SummaryEn = "Master Agile principles and Scrum framework for effective project management.",
                SummaryAr = "أتقن مبادئ أجايل وإطار عمل سكرم لإدارة المشاريع الفعالة.",
                DescriptionEn = "Master Agile principles and Scrum framework for effective project management and team collaboration.",
                DescriptionAr = "أتقن مبادئ أجايل وإطار عمل سكرم لإدارة المشاريع الفعالة والتعاون الجماعي.",
                CourseTopicsEn = "Agile Manifesto, Scrum Framework, Sprint Planning, User Stories, Retrospectives",
                CourseTopicsAr = "بيان أجايل، إطار سكرم، تخطيط السبرينت، قصص المستخدم، الاستعراض الرجعي",
                Price = 229.99m,
                Currency = "SAR",
                Type = CourseType.Live,
                Level = CourseLevel.Biginner,
                CategoryId = customProgramsCategory,
                InstructorNameAr = "علي المطيري",
                InstructorNameEn = "Ali Al-Mutairi",
                InstructorsBioAr = "Scrum Master معتمد ومدرب أجايل",
                InstructorsBioEn = "Certified Scrum Master and Agile Coach",
                DurationEn = "28 hours",
                DurationAr = "28 ساعة",
                VideoUrl = "https://example.com/video11.mp4",
                Tags = "agile,scrum,project-management,sprint",
                IsFeatured = false,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Course
            {
                Id = course12Id,
                Slug = "mobile-app-development",
                TitleEn = "Mobile App Development",
                TitleAr = "تطوير تطبيقات الهاتف المحمول",
                SummaryEn = "Build native and cross-platform mobile applications using React Native and Flutter.",
                SummaryAr = "بناء تطبيقات الهاتف المحمول الأصلية ومتعددة المنصات باستخدام React Native و Flutter.",
                DescriptionEn = "Build native and cross-platform mobile applications using React Native, Flutter, and native development tools.",
                DescriptionAr = "بناء تطبيقات الهاتف المحمول الأصلية ومتعددة المنصات باستخدام React Native و Flutter وأدوات التطوير الأصلية.",
                CourseTopicsEn = "React Native, Flutter & Dart, iOS Development, Android Development, App Store Deployment",
                CourseTopicsAr = "رياكت نيتيف، فلاتر ودارت، تطوير iOS، تطوير أندرويد، نشر على متاجر التطبيقات",
                Price = 449.99m,
                Currency = "SAR",
                Type = CourseType.Live,
                Level = CourseLevel.Advanced,
                CategoryId = professionalCertCategory,
                InstructorNameAr = "سلمان الدوسري",
                InstructorNameEn = "Salman Al-Dosari",
                InstructorsBioAr = "مطور تطبيقات محمول محترف",
                InstructorsBioEn = "Professional mobile app developer",
                DurationEn = "70 hours",
                DurationAr = "70 ساعة",
                From = DateTime.UtcNow.AddDays(15),
                To = DateTime.UtcNow.AddDays(45),
                SessionsNotesEn = "Live sessions on Mondays and Wednesdays from 7PM to 9PM. Interactive coding sessions with real-time feedback.",
                SessionsNotesAr = "جلسات مباشرة أيام الاثنين والأربعاء من 7 مساءً إلى 9 مساءً. جلسات برمجة تفاعلية مع تعليقات فورية.",
                VideoUrl = "https://example.com/video12.mp4",
                Tags = "mobile,react-native,flutter,ios,android",
                IsFeatured = false,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };

        context.Courses.AddRange(courses);
        await context.SaveChangesAsync();

        // Now add course-subcategory mappings
        var courseSubCategoryMappings = new List<CourseSubCategoryMapping>
        {
            // Course 1 - Project Management -> Project Management & Soft Skills
            new CourseSubCategoryMapping { CourseId = course1Id, SubCategoryId = projectMgmtSubCat, CreatedAt = DateTime.UtcNow },
            new CourseSubCategoryMapping { CourseId = course1Id, SubCategoryId = softSkillsSubCat, CreatedAt = DateTime.UtcNow },
            
            // Course 2 - Digital Marketing -> Digital Marketing
            new CourseSubCategoryMapping { CourseId = course2Id, SubCategoryId = digitalMarketingSubCat, CreatedAt = DateTime.UtcNow },
            
            // Course 3 - Data Science -> Data Science & AI & Programming
            new CourseSubCategoryMapping { CourseId = course3Id, SubCategoryId = dataScienceSubCat, CreatedAt = DateTime.UtcNow },
            new CourseSubCategoryMapping { CourseId = course3Id, SubCategoryId = programmingSubCat, CreatedAt = DateTime.UtcNow },
            
            // Course 4 - Leadership -> HR & Soft Skills
            new CourseSubCategoryMapping { CourseId = course4Id, SubCategoryId = hrSubCat, CreatedAt = DateTime.UtcNow },
            new CourseSubCategoryMapping { CourseId = course4Id, SubCategoryId = softSkillsSubCat, CreatedAt = DateTime.UtcNow },
            
            // Course 5 - Financial Planning (no subcategories - general)
            
            // Course 6 - Web Development -> Programming
            new CourseSubCategoryMapping { CourseId = course6Id, SubCategoryId = programmingSubCat, CreatedAt = DateTime.UtcNow },
            
            // Course 7 - Cloud Computing -> Programming
            new CourseSubCategoryMapping { CourseId = course7Id, SubCategoryId = programmingSubCat, CreatedAt = DateTime.UtcNow },
            
            // Course 8 - UX/UI Design -> Design
            new CourseSubCategoryMapping { CourseId = course8Id, SubCategoryId = designSubCat, CreatedAt = DateTime.UtcNow },
            
            // Course 9 - Cybersecurity -> Programming
            new CourseSubCategoryMapping { CourseId = course9Id, SubCategoryId = programmingSubCat, CreatedAt = DateTime.UtcNow },
            
            // Course 10 - Business Intelligence -> Data Science
            new CourseSubCategoryMapping { CourseId = course10Id, SubCategoryId = dataScienceSubCat, CreatedAt = DateTime.UtcNow },
            
            // Course 11 - Agile & Scrum -> Project Management & Soft Skills
            new CourseSubCategoryMapping { CourseId = course11Id, SubCategoryId = projectMgmtSubCat, CreatedAt = DateTime.UtcNow },
            new CourseSubCategoryMapping { CourseId = course11Id, SubCategoryId = softSkillsSubCat, CreatedAt = DateTime.UtcNow },
            
            // Course 12 - Mobile Development -> Programming
            new CourseSubCategoryMapping { CourseId = course12Id, SubCategoryId = programmingSubCat, CreatedAt = DateTime.UtcNow },
        };

        context.CourseSubCategoryMappings.AddRange(courseSubCategoryMappings);
        await context.SaveChangesAsync();
        
        logger.LogInformation("Added {Count} test courses with subcategory mappings", courses.Count);
    }

    private static async Task SeedCourseInstructorsAsync(ErsaTrainingDbContext context, ILogger logger)
    {
        if (await context.CourseInstructors.AnyAsync())
        {
            logger.LogInformation("Course-instructor mappings already exist, skipping seed");
            return;
        }

        // Get instructor IDs
        var instructors = await context.Instructors.ToListAsync();
        if (!instructors.Any())
        {
            logger.LogWarning("No instructors found for course-instructor mapping");
            return;
        }

        var drMohammedAhmed = new Guid("11111111-1111-1111-1111-000000000001");
        var sarahMahmoud = new Guid("11111111-1111-1111-1111-000000000002");
        var drAhmedAbdullah = new Guid("11111111-1111-1111-1111-000000000003");
        var fatimaAlAli = new Guid("11111111-1111-1111-1111-000000000004");
        var omarHassan = new Guid("11111111-1111-1111-1111-000000000005");
        var maryamAlZahrani = new Guid("11111111-1111-1111-1111-000000000006");

        // Get course IDs
        var courses = await context.Courses.ToListAsync();
        if (!courses.Any())
        {
            logger.LogWarning("No courses found for course-instructor mapping");
            return;
        }

        var courseInstructorMappings = new List<CourseInstructor>();

        // Map instructors to courses
        foreach (var course in courses)
        {
            if (course.TitleEn.Contains("Project Management") || course.TitleEn.Contains("Agile"))
            {
                courseInstructorMappings.Add(new CourseInstructor
                {
                    CourseId = course.Id,
                    InstructorId = drMohammedAhmed,
                    CreatedAt = DateTime.UtcNow
                });
            }
            else if (course.TitleEn.Contains("Digital Marketing"))
            {
                courseInstructorMappings.Add(new CourseInstructor
                {
                    CourseId = course.Id,
                    InstructorId = sarahMahmoud,
                    CreatedAt = DateTime.UtcNow
                });
            }
            else if (course.TitleEn.Contains("Data Science") || course.TitleEn.Contains("Intelligence"))
            {
                courseInstructorMappings.Add(new CourseInstructor
                {
                    CourseId = course.Id,
                    InstructorId = drAhmedAbdullah,
                    CreatedAt = DateTime.UtcNow
                });
            }
            else if (course.TitleEn.Contains("Leadership"))
            {
                courseInstructorMappings.Add(new CourseInstructor
                {
                    CourseId = course.Id,
                    InstructorId = fatimaAlAli,
                    CreatedAt = DateTime.UtcNow
                });
            }
            else if (course.TitleEn.Contains("Web Development") || course.TitleEn.Contains("Mobile") || course.TitleEn.Contains("Cloud"))
            {
                courseInstructorMappings.Add(new CourseInstructor
                {
                    CourseId = course.Id,
                    InstructorId = omarHassan,
                    CreatedAt = DateTime.UtcNow
                });
            }
            else if (course.TitleEn.Contains("UX") || course.TitleEn.Contains("UI") || course.TitleEn.Contains("Design"))
            {
                courseInstructorMappings.Add(new CourseInstructor
                {
                    CourseId = course.Id,
                    InstructorId = maryamAlZahrani,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        context.CourseInstructors.AddRange(courseInstructorMappings);
        await context.SaveChangesAsync();
        
        logger.LogInformation("Added {Count} course-instructor mappings", courseInstructorMappings.Count);
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

    private static async Task SeedMockUsersAsync(UserManager<User> userManager, RoleService roleService, ILogger logger)
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
                    // Assign PublicUser role to mock users
                    await roleService.AssignUserToRoleAsync(mockUser.Email, RoleNames.PublicUser);
                    logger.LogInformation("Mock user {Email} created successfully with PublicUser role", mockUser.Email);
                }
                else
                {
                    logger.LogError("Failed to create mock user {Email}: {Errors}", mockUser.Email, string.Join(", ", result.Errors.Select(e => e.Description)));
                }
            }
            else
            {
                // Ensure existing mock users have PublicUser role
                await roleService.AssignUserToRoleAsync(mockUser.Email, RoleNames.PublicUser);
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
