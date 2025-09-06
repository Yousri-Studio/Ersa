using System;
using Microsoft.EntityFrameworkCore;
using ErsaTraining.API.Data;
using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.Utilities;

public static class ClearCourses
{
    public static async Task ClearAllCoursesAsync()
    {
        var connectionString = "Data Source=ErsaTrainingDB.db";
        var options = new DbContextOptionsBuilder<ErsaTrainingDbContext>()
            .UseSqlite(connectionString)
            .Options;

        using var context = new ErsaTrainingDbContext(options);

        Console.WriteLine("Deleting all courses from database...");

        // Delete all courses
        var coursesToDelete = await context.Courses.ToListAsync();
        context.Courses.RemoveRange(coursesToDelete);
        await context.SaveChangesAsync();

        Console.WriteLine($"Deleted {coursesToDelete.Count} courses successfully.");
        Console.WriteLine("The application will now re-seed courses on next startup.");
    }
}
