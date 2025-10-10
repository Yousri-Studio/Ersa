using OfficeOpenXml;
using Newtonsoft.Json;
using System.Text;

// Set EPPlus license context (for non-commercial use)
ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

Console.WriteLine("Excel Course Reader - Ersa Training");
Console.WriteLine("====================================\n");

// Get the Excel file path
var excelPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "..", "Products Details.xlsx");

if (!File.Exists(excelPath))
{
    Console.WriteLine($"Error: Excel file not found at: {excelPath}");
    return;
}

Console.WriteLine($"Reading Excel file: {excelPath}\n");

try
{
    using var package = new ExcelPackage(new FileInfo(excelPath));
    
    // Get the first worksheet
    var worksheet = package.Workbook.Worksheets[0];
    
    if (worksheet == null)
    {
        Console.WriteLine("Error: No worksheets found in the Excel file.");
        return;
    }
    
    Console.WriteLine($"Worksheet Name: {worksheet.Name}");
    Console.WriteLine($"Dimensions: {worksheet.Dimension?.Address}\n");
    
    // Display ALL rows to understand structure
    var columnCount = worksheet.Dimension?.End.Column ?? 0;
    var rowCount = worksheet.Dimension?.End.Row ?? 0;
    
    Console.WriteLine("Excel Structure Analysis:");
    Console.WriteLine("========================");
    
    for (int row = 1; row <= Math.Min(10, rowCount); row++)
    {
        Console.WriteLine($"\nRow {row}:");
        for (int col = 1; col <= columnCount; col++)
        {
            var value = worksheet.Cells[row, col].Text;
            if (!string.IsNullOrWhiteSpace(value))
            {
                Console.WriteLine($"  Col {col}: {value}");
            }
        }
    }
    
    // Try to find header row (row with most non-empty cells)
    int headerRow = 1;
    int maxNonEmpty = 0;
    
    for (int row = 1; row <= Math.Min(10, rowCount); row++)
    {
        int nonEmptyCount = 0;
        for (int col = 1; col <= columnCount; col++)
        {
            if (!string.IsNullOrWhiteSpace(worksheet.Cells[row, col].Text))
                nonEmptyCount++;
        }
        
        if (nonEmptyCount > maxNonEmpty)
        {
            maxNonEmpty = nonEmptyCount;
            headerRow = row;
        }
    }
    
    Console.WriteLine($"\n\nDetected Header Row: {headerRow}");
    
    // Read headers
    var headers = new List<string>();
    Console.WriteLine("\nColumn Headers:");
    Console.WriteLine("===============");
    for (int col = 1; col <= columnCount; col++)
    {
        var headerValue = worksheet.Cells[headerRow, col].Text;
        if (string.IsNullOrWhiteSpace(headerValue))
            headerValue = $"Column{col}";
        headers.Add(headerValue);
        Console.WriteLine($"Column {col}: {headerValue}");
    }
    
    Console.WriteLine();
    
    // Read all data rows (starting from headerRow + 1)
    var courses = new List<Dictionary<string, string>>();
    
    Console.WriteLine($"\nTotal Rows in Excel: {rowCount}");
    Console.WriteLine($"Starting data from row: {headerRow + 1}\n");
    
    // Display first few data rows as sample
    Console.WriteLine("Sample Data (First 3 Data Rows):");
    Console.WriteLine("=================================");
    
    int sampleCount = 0;
    for (int row = headerRow + 1; row <= rowCount && sampleCount < 3; row++)
    {
        // Check if row has any data
        bool hasData = false;
        for (int col = 1; col <= columnCount; col++)
        {
            if (!string.IsNullOrWhiteSpace(worksheet.Cells[row, col].Text))
            {
                hasData = true;
                break;
            }
        }
        
        if (!hasData) continue;
        
        Console.WriteLine($"\nData Row {sampleCount + 1} (Excel Row {row}):");
        var courseData = new Dictionary<string, string>();
        
        for (int col = 1; col <= columnCount; col++)
        {
            var value = worksheet.Cells[row, col].Text;
            var header = headers[col - 1];
            courseData[header] = value;
            if (!string.IsNullOrWhiteSpace(value))
                Console.WriteLine($"  {header}: {value}");
        }
        
        courses.Add(courseData);
        sampleCount++;
    }
    
    // Read all data rows
    Console.WriteLine("\n\nReading all course data...");
    courses.Clear();
    
    for (int row = headerRow + 1; row <= rowCount; row++)
    {
        // Check if row has any data
        bool hasData = false;
        for (int col = 1; col <= columnCount; col++)
        {
            if (!string.IsNullOrWhiteSpace(worksheet.Cells[row, col].Text))
            {
                hasData = true;
                break;
            }
        }
        
        if (!hasData) continue;
        
        var courseData = new Dictionary<string, string>();
        
        for (int col = 1; col <= columnCount; col++)
        {
            var value = worksheet.Cells[row, col].Text;
            var header = headers[col - 1];
            courseData[header] = value;
        }
        
        courses.Add(courseData);
    }
    
    // Save to JSON file
    var jsonOutput = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "..", "courses-from-excel.json");
    var jsonContent = JsonConvert.SerializeObject(courses, Formatting.Indented);
    File.WriteAllText(jsonOutput, jsonContent);
    
    Console.WriteLine($"\n✓ Successfully exported {courses.Count} courses to: courses-from-excel.json");
    
    // Generate C# course seed code
    Console.WriteLine("\nGenerating C# Course Seed Code...");
    var csharpOutput = GenerateCSharpSeedCode(courses, headers);
    var csharpFile = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "..", "GeneratedCourseSeed.cs");
    File.WriteAllText(csharpFile, csharpOutput);
    
    Console.WriteLine($"✓ Generated C# seed code: GeneratedCourseSeed.cs");
    
    Console.WriteLine("\nDone!");
}
catch (Exception ex)
{
    Console.WriteLine($"Error reading Excel file: {ex.Message}");
    Console.WriteLine($"Stack trace: {ex.StackTrace}");
}

static string GenerateCSharpSeedCode(List<Dictionary<string, string>> courses, List<string> headers)
{
    var sb = new StringBuilder();
    
    sb.AppendLine("// Auto-generated Course Seed Data from Excel");
    sb.AppendLine("// Generated on: " + DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"));
    sb.AppendLine();
    sb.AppendLine("using ErsaTraining.API.Data.Entities;");
    sb.AppendLine();
    sb.AppendLine("namespace ErsaTraining.API.Data.Seeds;");
    sb.AppendLine();
    sb.AppendLine("public static class ExcelCourseSeedData");
    sb.AppendLine("{");
    sb.AppendLine("    public static List<Course> GetCourses()");
    sb.AppendLine("    {");
    sb.AppendLine("        var courses = new List<Course>");
    sb.AppendLine("        {");
    
    int courseIndex = 1;
    foreach (var course in courses)
    {
        sb.AppendLine($"            // Course {courseIndex}");
        sb.AppendLine("            new Course");
        sb.AppendLine("            {");
        sb.AppendLine($"                Id = Guid.NewGuid(),");
        
        // Map Excel columns to Course properties
        // This is a template - you'll need to adjust based on actual Excel structure
        if (course.ContainsKey("Slug") && !string.IsNullOrWhiteSpace(course["Slug"]))
            sb.AppendLine($"                Slug = \"{EscapeString(course["Slug"])}\",");
        else
            sb.AppendLine($"                Slug = \"course-{courseIndex}\",");
        
        if (course.ContainsKey("Title (English)") || course.ContainsKey("TitleEn"))
        {
            var titleEn = course.ContainsKey("Title (English)") ? course["Title (English)"] : course.GetValueOrDefault("TitleEn", "");
            sb.AppendLine($"                TitleEn = \"{EscapeString(titleEn)}\",");
        }
        
        if (course.ContainsKey("Title (Arabic)") || course.ContainsKey("TitleAr"))
        {
            var titleAr = course.ContainsKey("Title (Arabic)") ? course["Title (Arabic)"] : course.GetValueOrDefault("TitleAr", "");
            sb.AppendLine($"                TitleAr = \"{EscapeString(titleAr)}\",");
        }
        
        if (course.ContainsKey("Price"))
        {
            var priceStr = course["Price"].Replace("SAR", "").Replace(",", "").Trim();
            if (decimal.TryParse(priceStr, out var price))
                sb.AppendLine($"                Price = {price}m,");
        }
        
        // Add more mappings based on Excel structure
        sb.AppendLine("                Currency = \"SAR\",");
        sb.AppendLine("                Type = CourseType.Live,");
        sb.AppendLine("                Level = CourseLevel.Biginner,");
        sb.AppendLine("                IsActive = true,");
        sb.AppendLine("                IsFeatured = false,");
        sb.AppendLine("                CreatedAt = DateTime.UtcNow,");
        sb.AppendLine("                UpdatedAt = DateTime.UtcNow");
        
        sb.AppendLine("            },");
        courseIndex++;
    }
    
    sb.AppendLine("        };");
    sb.AppendLine();
    sb.AppendLine("        return courses;");
    sb.AppendLine("    }");
    sb.AppendLine("}");
    
    return sb.ToString();
}

static string EscapeString(string input)
{
    if (string.IsNullOrEmpty(input))
        return "";
    
    return input.Replace("\"", "\\\"").Replace("\n", "\\n").Replace("\r", "");
}

