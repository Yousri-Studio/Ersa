#r "nuget: Microsoft.Data.Sqlite, 6.0.0"

using System;
using Microsoft.Data.Sqlite;

var connection = new SqliteConnection("Data Source=ErsaTrainingDB.db");
connection.Open();

var command = connection.CreateCommand();
command.CommandText = "SELECT name FROM sqlite_master WHERE type='table';";

Console.WriteLine("Tables in the database:");
using (var reader = command.ExecuteReader())
{
    while (reader.Read())
    {
        Console.WriteLine(reader.GetString(0));
    }
}

connection.Close();
