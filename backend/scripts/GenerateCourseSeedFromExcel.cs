using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using Newtonsoft.Json;
using System.IO;
using System.Text;

/*
 * Script to generate C# course seed code from the exported courses-from-excel.json
 * Run with: dotnet script GenerateCourseSeedFromExcel.cs
 */

var jsonPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "courses-from-excel.json");
var outputPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "GeneratedCourseSeedData.cs");

Console.WriteLine("Reading courses from JSON...");
var json = File.ReadAllText(jsonPath);
var courses = JsonConvert.DeserializeObject<List<Dictionary<string, string>>>(json);

Console.WriteLine($"Found {courses.Count} entries");

// Skip the first row which is headers
var actualCourses = courses.Skip(1).ToList();

Console.WriteLine($"Processing {actualCourses.Count} actual courses...");

var sb = new StringBuilder();
sb.AppendLine("// Auto-generated Course Seed Data from Excel");
sb.AppendLine($"// Generated on: {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
sb.AppendLine("// Source: Products Details.xlsx");
sb.AppendLine();
sb.AppendLine("using ErsaTraining.API.Data.Entities;");
sb.AppendLine();
sb.AppendLine("namespace ErsaTraining.API;");
sb.AppendLine();
sb.AppendLine("public static class GeneratedCourseSeedData");
sb.AppendLine("{");
sb.AppendLine("    public static List<Course> GetCoursesFromExcel()");
sb.AppendLine("    {");
sb.AppendLine("        // Category IDs - These should match the seeded categories");
sb.AppendLine("        var professionalCertsCategory = new Guid(\"11111111-1111-1111-1111-111111111111\");");
sb.AppendLine("        var customProgramsCategory = new Guid(\"22222222-2222-2222-2222-222222222222\");");
sb.AppendLine("        var generalCoursesCategory = new Guid(\"33333333-3333-3333-3333-333333333333\");");
sb.AppendLine();
sb.AppendLine("        var courses = new List<Course>");
sb.AppendLine("        {");

foreach (var course in actualCourses)
{
    var number = course.GetValueOrDefault("#", "");
    if (string.IsNullOrWhiteSpace(number)) continue;
    
    var programName = course.GetValueOrDefault("Program name\nاسم البرنامج", "");
    var parts = programName.Split('\n');
    var titleEn = parts.Length > 0 ? parts[0].Trim() : "";
    var titleAr = parts.Length > 1 ? parts[1].Trim() : "";
    
    var summaryEn = course.GetValueOrDefault("Summary En", "");
    var summaryAr = course.GetValueOrDefault("Column10", "");
    
    var detailsEn = course.GetValueOrDefault("Details", "");
    var detailsAr = course.GetValueOrDefault("Column12", "");
    
    var priceStr = course.GetValueOrDefault("Final Price\nالسعر النهائي", "").Replace("SAR", "").Replace(",", "").Trim();
    decimal.TryParse(priceStr, out var price);
    
    var trainingType = course.GetValueOrDefault("Training\nالتدريب", "").ToLower();
    var courseType = trainingType.Contains("online") ? "CourseType.Live" : "CourseType.PDF";
    
    var level = course.GetValueOrDefault("Level", "");
    var courseLevel = level.ToLower().Contains("advanced") ? "CourseLevel.Advanced" : 
                     level.ToLower().Contains("intermediate") ? "CourseLevel.Intermediate" : 
                     "CourseLevel.Biginner";
    
    var mainCategory = course.GetValueOrDefault("Main Category", "");
    var categoryId = "generalCoursesCategory";
    if (mainCategory.Contains("شهادات مهنية") || mainCategory.Contains("Professional"))
        categoryId = "professionalCertsCategory";
    else if (mainCategory.Contains("برامج مخصصة") || mainCategory.Contains("Custom"))
        categoryId = "customProgramsCategory";
    
    var duration = course.GetValueOrDefault("Date – التاريــخ", "");
    var daysInfo = course.GetValueOrDefault("Column15", "");
    var fromDate = course.GetValueOrDefault("Column16", "");
    var toDate = course.GetValueOrDefault("Column17", "");
    
    var slug = CreateSlug(titleEn);
    
    sb.AppendLine($"            // Course {number}: {titleEn}");
    sb.AppendLine("            new Course");
    sb.AppendLine("            {");
    sb.AppendLine($"                Id = Guid.NewGuid(),");
    sb.AppendLine($"                Slug = \"{EscapeString(slug)}\",");
    sb.AppendLine($"                TitleEn = \"{EscapeString(titleEn)}\",");
    sb.AppendLine($"                TitleAr = \"{EscapeString(titleAr)}\",");
    sb.AppendLine($"                SummaryEn = \"{EscapeString(Truncate(summaryEn, 1900))}\",");
    sb.AppendLine($"                SummaryAr = \"{EscapeString(Truncate(summaryAr, 1900))}\",");
    sb.AppendLine($"                DescriptionEn = \"{EscapeString(Truncate(detailsEn, 4900))}\",");
    sb.AppendLine($"                DescriptionAr = \"{EscapeString(Truncate(detailsAr, 4900))}\",");
    sb.AppendLine($"                Price = {price}m,");
    sb.AppendLine("                Currency = \"SAR\",");
    sb.AppendLine($"                Type = {courseType},");
    sb.AppendLine($"                Level = {courseLevel},");
    sb.AppendLine($"                CategoryId = {categoryId},");
    
    if (!string.IsNullOrWhiteSpace(duration))
    {
        sb.AppendLine($"                DurationEn = \"{EscapeString(duration)}\",");
        sb.AppendLine($"                DurationAr = \"{EscapeString(duration)}\",");
    }
    
    if (!string.IsNullOrWhiteSpace(daysInfo))
    {
        sb.AppendLine($"                SessionsNotesEn = \"{EscapeString(Truncate(daysInfo, 140))}\",");
        sb.AppendLine($"                SessionsNotesAr = \"{EscapeString(Truncate(daysInfo, 140))}\",");
    }
    
    if (!string.IsNullOrWhiteSpace(fromDate) && !string.IsNullOrWhiteSpace(toDate))
    {
        sb.AppendLine($"                // From: {fromDate}, To: {toDate}");
        sb.AppendLine($"                From = DateTime.UtcNow.AddDays(30),");
        sb.AppendLine($"                To = DateTime.UtcNow.AddDays(45),");
    }
    
    sb.AppendLine("                IsActive = true,");
    sb.AppendLine("                IsFeatured = false,");
    sb.AppendLine("                CreatedAt = DateTime.UtcNow,");
    sb.AppendLine("                UpdatedAt = DateTime.UtcNow");
    sb.AppendLine("            },");
}

sb.AppendLine("        };");
sb.AppendLine();
sb.AppendLine("        return courses;");
sb.AppendLine("    }");
sb.AppendLine("}");

File.WriteAllText(outputPath, sb.ToString());

Console.WriteLine($"✓ Generated course seed code at: {outputPath}");
Console.WriteLine($"✓ Total courses: {actualCourses.Count(c => !string.IsNullOrWhiteSpace(c.GetValueOrDefault(\"#\", \"\")))}");

string EscapeString(string input)
{
    if (string.IsNullOrEmpty(input))
        return "";
    
    return input.Replace("\"", "\\\"")
                .Replace("\n", "\\n")
                .Replace("\r", "")
                .Replace("\t", " ");
}

string Truncate(string input, int maxLength)
{
    if (string.IsNullOrEmpty(input) || input.Length <= maxLength)
        return input;
    
    return input.Substring(0, maxLength);
}

string CreateSlug(string input)
{
    if (string.IsNullOrEmpty(input))
        return "course-" + Guid.NewGuid().ToString("N").Substring(0, 8);
    
    var slug = input.ToLower();
    slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
    slug = Regex.Replace(slug, @"\s+", "-");
    slug = Regex.Replace(slug, @"-+", "-");
    slug = slug.Trim('-');
    
    return string.IsNullOrEmpty(slug) ? "course-" + Guid.NewGuid().ToString("N").Substring(0, 8) : slug;
}

