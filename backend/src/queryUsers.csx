#r "nuget: Microsoft.Data.Sqlite, 6.0.0"

using System;
using Microsoft.Data.Sqlite;

var connection = new SqliteConnection("Data Source=ErsaTrainingDB.db");
connection.Open();

var command = connection.CreateCommand();
command.CommandText = "SELECT name FROM sqlite_master WHERE type='table';";

using (var reader = command.ExecuteReader())
{
    while (reader.Read())
    {
        Console.WriteLine($"Table: {reader.GetString(0)}");
    }
}

connection.Close();
