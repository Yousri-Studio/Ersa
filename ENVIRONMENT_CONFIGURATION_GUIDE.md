# Environment Configuration Guide

## Overview

The project now uses separate configuration files for **Development** and **Production** environments.

---

## Configuration Files

### 📁 `appsettings.json` (Production/Default)
- Used for **production deployments**
- Uses **SQL Server** on site4now.net
- Production payment gateway credentials
- Swagger disabled by default

### 📁 `appsettings.Development.json` (Local Development)
- Used when running with `ASPNETCORE_ENVIRONMENT=Development`
- Uses **LocalDB** for testing
- Test payment gateway credentials
- Swagger enabled
- More verbose logging

---

## Database Connections

### Development (LocalDB)
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=ErsaTrainingDB;Trusted_Connection=true;MultipleActiveResultSets=true"
}
```

**Features:**
- ✅ No installation required (comes with Visual Studio)
- ✅ Local database file
- ✅ Fast for testing
- ✅ Automatic creation on first run

### Production (SQL Server)
```json
"ConnectionStrings": {
  "DefaultConnection": "Data Source=SQL1002.site4now.net;Initial Catalog=db_abea46_ersatraining;User Id=powerDb;Password=P@$sw0rd;TrustServerCertificate=true;Connection Timeout=30;MultipleActiveResultSets=true;"
}
```

**Features:**
- ✅ Hosted SQL Server
- ✅ Persistent data
- ✅ Production-grade
- ✅ Remote access

---

## How It Works

.NET automatically selects the configuration based on the `ASPNETCORE_ENVIRONMENT` variable:

### Development Mode (Default in Visual Studio)
```bash
ASPNETCORE_ENVIRONMENT=Development
```
- Uses `appsettings.Development.json`
- Merges with `appsettings.json`
- Development settings **override** production settings
- **LocalDB connection string is used**

### Production Mode
```bash
ASPNETCORE_ENVIRONMENT=Production
```
- Uses only `appsettings.json`
- **SQL Server connection string is used**

---

## Running in Different Environments

### Option 1: Visual Studio

**Development (Default):**
```
Just press F5 or Run
Environment is automatically set to Development
```

**Production:**
1. Right-click project → Properties
2. Debug → General → Open debug launch profiles UI
3. Set `ASPNETCORE_ENVIRONMENT=Production`

### Option 2: Command Line

**Development:**
```bash
cd backend/src
$env:ASPNETCORE_ENVIRONMENT="Development"
dotnet run
```

**Production:**
```bash
cd backend/src
$env:ASPNETCORE_ENVIRONMENT="Production"
dotnet run
```

### Option 3: launchSettings.json

Edit `backend/src/Properties/launchSettings.json`:

```json
{
  "profiles": {
    "Development": {
      "commandName": "Project",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    },
    "Production": {
      "commandName": "Project",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Production"
      }
    }
  }
}
```

---

## Payment Gateway Configuration

### Development (Test Credentials)

```json
"PaymentGateway": {
  "GatewayMethod": 0,
  "DefaultGateway": "HyperPay"
},
"HyperPay": {
  "ApiUrl": "https://test.oppwa.com",
  "EntityId": "your-hyperpay-test-entity-id",
  "AccessToken": "your-hyperpay-test-access-token"
},
"ClickPay": {
  "ApiUrl": "https://secure-test.clickpay.com.sa",
  "ProfileId": "your-clickpay-test-profile-id",
  "ServerKey": "your-clickpay-test-server-key"
}
```

### Production (Live Credentials)

```json
"PaymentGateway": {
  "GatewayMethod": 0,
  "DefaultGateway": "ClickPay"
},
"HyperPay": {
  "ApiUrl": "https://oppwa.com",
  "EntityId": "your-hyperpay-production-entity-id",
  "AccessToken": "your-hyperpay-production-access-token"
},
"ClickPay": {
  "ApiUrl": "https://secure.clickpay.com.sa",
  "ProfileId": "your-clickpay-production-profile-id",
  "ServerKey": "your-clickpay-production-server-key"
}
```

---

## Database Setup

### First Time Setup - LocalDB (Development)

1. **Start the application in Development mode**
   ```bash
   cd backend/src
   dotnet run
   ```

2. **Database is automatically created**
   - EF Core will create the database on first run
   - Migrations are applied automatically
   - Seed data is inserted

3. **Verify LocalDB connection**
   - Open SQL Server Object Explorer in Visual Studio
   - Connect to `(localdb)\mssqllocaldb`
   - You should see `ErsaTrainingDB`

### Managing LocalDB

**View LocalDB instances:**
```bash
sqllocaldb info
```

**Start LocalDB:**
```bash
sqllocaldb start mssqllocaldb
```

**Stop LocalDB:**
```bash
sqllocaldb stop mssqllocaldb
```

**Delete database (fresh start):**
```bash
sqllocaldb delete mssqllocaldb
sqllocaldb create mssqllocaldb
```

Or in Visual Studio:
1. Open SQL Server Object Explorer
2. Find `(localdb)\mssqllocaldb`
3. Right-click `ErsaTrainingDB` → Delete

---

## Testing the Setup

### 1. Test Development Environment

```bash
cd backend/src
$env:ASPNETCORE_ENVIRONMENT="Development"
dotnet run
```

**Check the logs:**
```
Database connection test: True
Database connected successfully!
Using connection: Server=(localdb)\mssqllocaldb;Database=ErsaTrainingDB...
```

### 2. Test Production Environment

```bash
cd backend/src
$env:ASPNETCORE_ENVIRONMENT="Production"
dotnet run
```

**Check the logs:**
```
Database connection test: True
Database connected successfully!
Using connection: Data Source=SQL1002.site4now.net...
```

### 3. Verify Payment Gateway Config

**Hit the config endpoint:**

Development:
```bash
curl http://localhost:5002/api/payments/config
```

Production:
```bash
curl https://api.ersa-training.com/api/payments/config
```

---

## Configuration Override Priority

.NET loads configurations in this order (later overrides earlier):

1. `appsettings.json` (base configuration)
2. `appsettings.{Environment}.json` (environment-specific)
3. Environment Variables
4. Command-line arguments

**Example:**
- `appsettings.json` has production SQL Server
- `appsettings.Development.json` has LocalDB
- In Development mode → **LocalDB is used** ✅
- In Production mode → **SQL Server is used** ✅

---

## Security Best Practices

### ✅ DO:
- Keep `appsettings.Development.json` in source control (test credentials only)
- Use environment variables for production secrets
- Use Azure Key Vault or similar for production
- Never commit real credentials to git

### ❌ DON'T:
- Don't put production credentials in `appsettings.json` (use env vars)
- Don't commit `.env` files
- Don't share production connection strings in documentation

---

## Environment Variables (Production)

For production, use environment variables instead of hardcoding:

```bash
# Connection String
ConnectionStrings__DefaultConnection="Data Source=SQL1002.site4now.net;..."

# Payment Gateway
PaymentGateway__GatewayMethod=0
ClickPay__ProfileId="xxxxx"
ClickPay__ServerKey="xxxxx"
HyperPay__EntityId="xxxxx"
HyperPay__AccessToken="xxxxx"
```

### In IIS:
1. Open IIS Manager
2. Select your application
3. Configuration Editor
4. Section: `system.webServer/aspNetCore`
5. Add environment variables

### In Docker:
```yaml
environment:
  - ASPNETCORE_ENVIRONMENT=Production
  - ConnectionStrings__DefaultConnection=Data Source=SQL1002...
```

---

## Quick Reference

| Environment | Database | Config File | Payment Gateways | Swagger |
|-------------|----------|-------------|------------------|---------|
| Development | LocalDB | `appsettings.Development.json` | Test credentials | Enabled |
| Production | SQL Server | `appsettings.json` | Live credentials | Disabled |

---

## Troubleshooting

### Issue: "Cannot connect to LocalDB"

**Solution:**
```bash
# Create LocalDB instance
sqllocaldb create mssqllocaldb
sqllocaldb start mssqllocaldb
```

### Issue: "Using wrong database"

**Solution:**
- Check `ASPNETCORE_ENVIRONMENT` variable
- Verify correct `appsettings.{Environment}.json` exists
- Check application logs for connection string being used

### Issue: "Production credentials in development"

**Solution:**
- Verify `appsettings.Development.json` has correct LocalDB connection
- Check environment variable is set to "Development"
- Restart the application

---

## Summary

✅ **Development:**
- Uses LocalDB (automatic, no setup)
- Test payment credentials
- Verbose logging
- Swagger enabled

✅ **Production:**
- Uses SQL Server (site4now.net)
- Live payment credentials
- Production logging
- Swagger disabled

✅ **Automatic Selection:**
- .NET automatically picks the right config
- No code changes needed
- Environment variable controls it

**Current Status:** ✅ Ready for testing with LocalDB!

---

## Next Steps

1. ✅ Configuration files created
2. ⏳ Add your test payment credentials to `appsettings.Development.json`
3. ⏳ Run in Development mode
4. ⏳ Test payment gateway integration
5. ⏳ Deploy to production with `ASPNETCORE_ENVIRONMENT=Production`

---

**Last Updated:** October 13, 2025  
**Version:** 1.0

