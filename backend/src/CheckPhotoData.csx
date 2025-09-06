#r "Microsoft.EntityFrameworkCore"
#r "Microsoft.EntityFrameworkCore.Sqlite"
#load "Data/ErsaTrainingDbContext.cs"
#load "Data/Entities/Course.cs"

using ErsaTraining.API.Data;
using Microsoft.EntityFrameworkCore;

var connectionString = "Data Source=ErsaTrainingDB.db";
var optionsBuilder = new DbContextOptionsBuilder<ErsaTrainingDbContext>();
optionsBuilder.UseSqlite(connectionString);

using var context = new ErsaTrainingDbContext(optionsBuilder.Options);

// Check courses with photo data
var courses = await context.Courses
    .Where(c => c.Photo != null)
    .Select(c => new { c.Slug, c.TitleEn, PhotoLength = c.Photo.Length })
    .ToListAsync();

Console.WriteLine($"Found {courses.Count} courses with photo data:");
foreach (var course in courses)
{
    Console.WriteLine($"- {course.TitleEn} ({course.Slug}): {course.PhotoLength} bytes");
}

// Check specific course
var specificCourse = await context.Courses
    .FirstOrDefaultAsync(c => c.Slug == "advanced-project-management");

if (specificCourse != null)
{
    Console.WriteLine($"\nAdvanced Project Management course:");
    Console.WriteLine($"- Has photo: {specificCourse.Photo != null}");
    if (specificCourse.Photo != null)
    {
        Console.WriteLine($"- Photo length: {specificCourse.Photo.Length} bytes");
        Console.WriteLine($"- First 10 bytes: [{string.Join(", ", specificCourse.Photo.Take(10))}]");
    }
}
