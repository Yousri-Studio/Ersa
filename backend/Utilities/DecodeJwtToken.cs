using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;

class Program
{
    static void Main(string[] args)
    {
        string token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiJhYjRiYWQ2OC1hNjQyLTQ2OWMtYTAyYS1mYjM0MDgzYjgxYzciLCJlbWFpbCI6ImFkbWluQGVyc2F0cmFpbmluZy5jb20iLCJ1bmlxdWUiOiJhZG1pbkBlcnNhdHJhaW5pbmcuY29tIiwicm9sZSI6IkFkbWluIiwibmJmIjoxNjkyNzg4ODAwLCJleHAiOjE2OTMzOTM2MDAsImlhdCI6MTY5Mjc4ODgwMH0.abc123xyz456";

        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        Console.WriteLine("Claims:");
        foreach (var claim in jwtToken.Claims)
        {
            Console.WriteLine($"{claim.Type}: {claim.Value}");
        }
    }
}
