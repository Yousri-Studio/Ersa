using Microsoft.Data.SqlClient;

namespace ErsaTraining.API
{
    public static class TestConnection
    {
        public static async Task TestSqlConnectionAsync(string connectionString)
        {
            try
            {
                using var connection = new SqlConnection(connectionString);
                Console.WriteLine("Attempting to connect to SQL Server...");
                await connection.OpenAsync();
                Console.WriteLine("✅ Successfully connected to SQL Server!");
                
                // Test a simple query
                using var command = new SqlCommand("SELECT @@VERSION", connection);
                var version = await command.ExecuteScalarAsync();
                Console.WriteLine($"SQL Server Version: {version}");
                
                // Check if database exists
                using var dbCommand = new SqlCommand("SELECT DB_NAME()", connection);
                var dbName = await dbCommand.ExecuteScalarAsync();
                Console.WriteLine($"Connected to database: {dbName}");
                
                await connection.CloseAsync();
                Console.WriteLine("Connection closed successfully.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Connection failed: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
            }
        }
    }
}