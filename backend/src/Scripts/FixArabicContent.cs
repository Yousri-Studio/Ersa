using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ErsaTraining.API.Data;
using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.Scripts;

public static class FixArabicContent
{
    public static async Task FixArabicContentAsync()
    {
        var connectionString = "Data Source=ErsaTrainingDB.db";
        var options = new DbContextOptionsBuilder<ErsaTrainingDbContext>()
            .UseSqlite(connectionString)
            .Options;

        using var context = new ErsaTrainingDbContext(options);

        Console.WriteLine("Fixing Arabic content in database...");

        // Get all content blocks
        var blocks = await context.ContentBlocks.ToListAsync();
        
        Console.WriteLine($"Found {blocks.Count} content blocks to update...");

        foreach (var block in blocks)
        {
            // Update based on block key
            switch (block.BlockKey)
            {
                case "hero-badge":
                    block.ContentAr = "إرساء معك لتطوير المهارات";
                    break;
                case "hero-title":
                    block.ContentAr = "استكشف منصتنا التدريبية وارتقي بقدراتك لتحقيق أقصى إمكاناتك";
                    break;
                case "hero-description":
                    block.ContentAr = "ابن مستقبلاً واعداً وقود حياتك مع برامجنا التفاعلية والشاملة";
                    break;
                case "hero-cta-primary":
                    block.ContentAr = "استكشف الدورات";
                    break;
                case "hero-cta-secondary":
                    block.ContentAr = "طلب استشارة";
                    break;
                case "page-title":
                    if (block.ContentEn == "Our Courses")
                        block.ContentAr = "دوراتنا";
                    break;
                case "page-description":
                    if (block.ContentEn?.Contains("comprehensive collection") == true)
                        block.ContentAr = "اكتشف مجموعتنا الشاملة من دورات التطوير المهني";
                    break;
                case "company-name":
                    block.ContentAr = "إرساء للتدريب";
                    break;
                case "mission":
                    block.ContentAr = "تمكين الأفراد والمنظمات من خلال حلول تدريبية عالمية المستوى";
                    break;
                case "vision":
                    block.ContentAr = "أن نكون الشريك التدريبي المفضل في المنطقة";
                    break;
                case "title":
                    if (block.ContentEn == "Our Services")
                        block.ContentAr = "خدماتنا";
                    else if (block.ContentEn == "Get in Touch")
                        block.ContentAr = "تواصل معنا";
                    break;
                case "description":
                    if (block.ContentEn?.Contains("comprehensive training") == true)
                        block.ContentAr = "نقدم خدمات تدريبية واستشارية شاملة";
                    break;
                case "address":
                    block.ContentAr = "الرياض، المملكة العربية السعودية";
                    break;
                case "faq-title":
                    block.ContentAr = "الأسئلة الشائعة";
                    break;
                case "faq-1-question":
                    block.ContentAr = "كيف يمكنني التسجيل في دورة؟";
                    break;
                case "faq-1-answer":
                    block.ContentAr = "يمكنك التسجيل من خلال موقعنا الإلكتروني أو التواصل معنا مباشرة.";
                    break;
            }
            
            block.UpdatedAt = DateTime.UtcNow;
        }

        await context.SaveChangesAsync();
        
        Console.WriteLine($"Updated {blocks.Count} content blocks successfully!");
        Console.WriteLine("Arabic content has been fixed.");
    }
}

