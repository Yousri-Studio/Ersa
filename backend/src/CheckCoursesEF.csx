#r "Microsoft.EntityFrameworkCore.dll"
#r "Microsoft.EntityFrameworkCore.Sqlite.dll"
#r "ErsaTraining.API.dll"

using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using ErsaTraining.API.Data;
using ErsaTraining.API.Data.Entities;

var connectionString = "Data Source=ErsaTrainingDB.db";
var options = new DbContextOptionsBuilder<AppDbContext>()
    .UseSqlite(connectionString)
    .Options;

using var context = new AppDbContext(options);

Console.WriteLine("Courses in the database:");
Console.WriteLine("=".PadRight(120, '='));

var courses = await context.Courses.ToListAsync();

foreach (var course in courses)
{
    Console.WriteLine($"ID: {course.Id}");
    Console.WriteLine($"Slug: {course.Slug}");
    Console.WriteLine($"Title EN: {course.TitleEn}");
    Console.WriteLine($"Title AR: {course.TitleAr}");
    Console.WriteLine($"Price: {course.Price}");
    Console.WriteLine($"Type: {course.Type} (1=Live, 0=PDF)");
    Console.WriteLine($"Category: {course.Category} (1=Programming, 2=Business, 3=Design)");
    Console.WriteLine($"Level: {course.Level} (1=Beginner, 2=Intermediate, 3=Advanced)");
    Console.WriteLine($"Featured: {course.IsFeatured}");
    Console.WriteLine($"Active: {course.IsActive}");
    Console.WriteLine($"Instructor: {course.InstructorName}");
    Console.WriteLine($"Photo: {(course.Photo != null ? $"Has Photo: {course.Photo.Length} bytes" : "No Photo")}");
    Console.WriteLine("-".PadRight(80, '-'));
}
