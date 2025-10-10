#r "nuget: Microsoft.Data.Sqlite, 6.0.0"

using System;
using Microsoft.Data.Sqlite;

var connection = new SqliteConnection("Data Source=ErsaTrainingDB.db");
connection.Open();

var command = connection.CreateCommand();
command.CommandText = "SELECT Email FROM AspNetUsers WHERE Email = 'superadmin@ersa-training.com';";

Console.WriteLine("Super Admin Verification:");
using (var reader = command.ExecuteReader())
{
    if (reader.Read())
    {
        Console.WriteLine($"Super Admin Email: {reader.GetString(0)}");
    }
    else
    {
        Console.WriteLine("Super Admin not found.");
    }
}

connection.Close();
