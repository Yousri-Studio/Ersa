# 🚀 Quick Start Guide

## Run Locally with LocalDB (Testing)

```powershell
cd backend/src
dotnet run
```

✅ That's it! The app will:
- Use LocalDB automatically
- Create database if needed
- Apply migrations
- Seed test data
- Start on http://localhost:5002

---

## Test the API

```bash
# Test if backend is running
curl http://localhost:5002/swagger

# Test payment config
curl http://localhost:5002/api/payments/config
```

---

## Switch to Production Database

```powershell
cd backend/src
$env:ASPNETCORE_ENVIRONMENT="Production"
dotnet run
```

✅ Now uses SQL Server (site4now.net)

---

## Key Files

| File | Purpose |
|------|---------|
| `appsettings.json` | Production settings (SQL Server) |
| `appsettings.Development.json` | Development settings (LocalDB) |
| `ENVIRONMENT_CONFIGURATION_GUIDE.md` | Full documentation |
| `test-environment.ps1` | Test environment switching |

---

## Database Locations

**Development:** `(localdb)\mssqllocaldb` → Database: `ErsaTrainingDB`
**Production:** `SQL1002.site4now.net` → Database: `db_abea46_ersatraining`

---

## Need Help?

1. Read `ENVIRONMENT_CONFIGURATION_GUIDE.md`
2. Run `.\test-environment.ps1` to verify setup
3. Check logs for connection string being used

---

**Ready to test the multi-gateway payment system!** 🎉

