#r "Microsoft.EntityFrameworkCore.dll"
#r "Microsoft.EntityFrameworkCore.Sqlite.dll"

using Microsoft.EntityFrameworkCore;
using ErsaTraining.API.Data;

var connectionString = "Data Source=ErsaTrainingDB.db";
var options = new DbContextOptionsBuilder<ApplicationDbContext>()
    .UseSqlite(connectionString)
    .Options;

var context = new ApplicationDbContext(options);

// Find the first course and add a video URL
var course = context.Courses.FirstOrDefault();
if (course != null)
{
    Console.WriteLine($"Updating course: {course.TitleEn}");
    course.VideoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"; // Sample YouTube URL
    context.SaveChanges();
    Console.WriteLine("Video URL added successfully!");
}
else
{
    Console.WriteLine("No courses found in database");
}

context.Dispose();
