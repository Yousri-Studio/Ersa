#r "nuget: Microsoft.Data.Sqlite, 6.0.0"

using System;
using Microsoft.Data.Sqlite;

var connection = new SqliteConnection("Data Source=ErsaTrainingDB.db");
connection.Open();

var command = connection.CreateCommand();
command.CommandText = @"
SELECT Id, Slug, TitleEn, TitleAr, Price, Type, Category, Level, 
       IsFeatured, IsActive, InstructorName,
       CASE WHEN Photo IS NULL THEN 'No Photo' ELSE 'Has Photo: ' || LENGTH(Photo) || ' bytes' END as PhotoInfo
FROM Courses 
ORDER BY TitleEn;";

Console.WriteLine("Courses in the database:");
Console.WriteLine("=".PadRight(120, '='));
using (var reader = command.ExecuteReader())
{
    while (reader.Read())
    {
        Console.WriteLine($"ID: {reader.GetValue(0)}");
        Console.WriteLine($"Slug: {reader.GetValue(1)}");
        Console.WriteLine($"Title EN: {reader.GetValue(2)}");
        Console.WriteLine($"Title AR: {reader.GetValue(3)}");
        Console.WriteLine($"Price: {reader.GetValue(4)}");
        Console.WriteLine($"Type: {reader.GetValue(5)} (1=Live, 0=PDF)");
        Console.WriteLine($"Category: {reader.GetValue(6)} (1=Programming, 2=Business, 3=Design)");
        Console.WriteLine($"Level: {reader.GetValue(7)} (1=Beginner, 2=Intermediate, 3=Advanced)");
        Console.WriteLine($"Featured: {reader.GetValue(8)}");
        Console.WriteLine($"Active: {reader.GetValue(9)}");
        Console.WriteLine($"Instructor: {reader.GetValue(10)}");
        Console.WriteLine($"Photo: {reader.GetValue(11)}");
        Console.WriteLine("-".PadRight(80, '-'));
    }
}

connection.Close();
