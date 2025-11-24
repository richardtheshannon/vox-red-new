# Railway Production Database Download Guide

**Last Updated**: November 24, 2025
**Status**: Production Ready

---

## Overview

This guide explains how to safely download your Railway production database to your local development environment for testing purposes.

**Key Features:**
- ✅ Completely safe - no impact on production
- ✅ Separate backup database (won't overwrite your local dev data)
- ✅ Automated script with safety checks
- ✅ Easy to switch between databases

---

## Prerequisites

### 1. Railway CLI
Install from: https://docs.railway.app/guides/cli

```bash
# Check if installed
railway --version
```

### 2. Railway Authentication
```bash
# Login to Railway
railway login
```

### 3. Link Railway Project
```bash
# In your project directory
railway link
```

### 4. Local PostgreSQL Running
Ensure your local PostgreSQL server is running and accessible.

---

## Quick Start

### One-Command Download

```bash
npm run db:download-prod
```

This automated script will:
1. ✅ Check all prerequisites
2. ✅ Export production database from Railway
3. ✅ Create local backup database (`mp3_manager_backup`)
4. ✅ Import production data to backup database
5. ✅ Provide next steps

---

## Step-by-Step Process

### Step 1: Run the Download Script

```bash
npm run db:download-prod
```

The script will:
- Check Railway CLI is installed and authenticated
- Verify Railway project is linked
- Confirm local PostgreSQL is accessible
- Ask for confirmation before proceeding

### Step 2: Confirm the Download

When prompted:
```
This will download production data to your local machine. Continue? (yes/no):
```

Type `yes` and press Enter.

### Step 3: Wait for Download

The script will:
1. Export production database (creates `railway-prod-dump.sql`)
2. Create `mp3_manager_backup` database locally
3. Import the data

**Note**: If `mp3_manager_backup` already exists, you'll be asked if you want to drop and recreate it.

### Step 4: Switch to Backup Database

Update your `.env` file:

```env
# Change from:
DB_NAME="mp3_manager"

# To:
DB_NAME="mp3_manager_backup"
```

### Step 5: Restart Dev Server

Stop your current dev server (Ctrl+C) and restart:

```bash
npm run dev
```

Your app now uses the production data locally!

---

## Switching Between Databases

### Use Production Clone
```env
DB_NAME="mp3_manager_backup"
```

### Use Original Local Dev Database
```env
DB_NAME="mp3_manager"
```

After changing, restart your dev server.

---

## Manual Process (Alternative)

If you prefer to do it manually:

### 1. Export Production Database

```bash
# Connect to Railway and export
railway run pg_dump $DATABASE_URL -f railway-prod-dump.sql
```

### 2. Create Local Backup Database

```bash
# Windows
set PGPASSWORD=Superculture1@
psql -U postgres -h localhost -c "CREATE DATABASE mp3_manager_backup;"
```

### 3. Import to Local

```bash
psql -U postgres -h localhost -d mp3_manager_backup -f railway-prod-dump.sql
```

### 4. Update .env

```env
DB_NAME="mp3_manager_backup"
```

---

## Important Safety Notes

### Production is NEVER Modified
- ✅ All operations are **READ-ONLY** on production
- ✅ No changes to production DATABASE_URL
- ✅ No write operations to Railway database

### Local Isolation
- ✅ Backup database is completely separate
- ✅ Original local dev database (`mp3_manager`) is untouched
- ✅ You can switch between them anytime

### Testing Changes
Any changes you make to `mp3_manager_backup` will:
- ❌ **NOT** affect production
- ❌ **NOT** affect your original local dev database
- ✅ Only exist in the backup database

---

## Common Use Cases

### 1. Testing with Real Data
```env
DB_NAME="mp3_manager_backup"
```
Test features with actual production data without risk.

### 2. Debugging Production Issues
Download production data, reproduce issue locally, debug safely.

### 3. Data Analysis
Analyze production data locally without impacting live users.

### 4. Migration Testing
Test database migrations on production-like data before deploying.

---

## Troubleshooting

### "Unauthorized. Please login with `railway login`"
**Solution**: Run `railway login` and authenticate with your Railway account.

### "No linked project found"
**Solution**: Run `railway link` in your project directory and select your project.

### "Cannot connect to local PostgreSQL"
**Solution**:
- Ensure PostgreSQL is running locally
- Verify credentials in `.env` file
- Check `DB_PASSWORD` is correct

### "Database mp3_manager_backup already exists"
**Solution**:
- Script will ask if you want to drop and recreate
- Answer `yes` to overwrite with fresh production data

### Dump File Very Large
**Solution**:
- This is normal if you have lots of data
- Keep the file for faster re-imports
- Delete `railway-prod-dump.sql` when done to save space

### Changes Not Appearing
**Solution**:
- Verify `.env` has `DB_NAME="mp3_manager_backup"`
- Restart dev server completely
- Check you're not caching old data

---

## File Locations

### Script
```
scripts/download-production-db.ts
```

### Dump File
```
railway-prod-dump.sql (in project root)
```

### Environment Config
```
.env
```

---

## Best Practices

### 1. Regular Downloads
Download fresh production data periodically for accurate testing:
```bash
npm run db:download-prod
```

### 2. Keep Databases Separate
Never point production app to your local databases.

### 3. Clean Up Old Dumps
Delete `railway-prod-dump.sql` when not needed (can be 100+ MB).

### 4. Document Changes
If testing migrations, document schema changes before applying to production.

### 5. Use for Testing Only
Never use backup database for permanent development work.

---

## Cleanup

### Remove Backup Database
When finished testing:

```bash
# Windows
set PGPASSWORD=Superculture1@
psql -U postgres -h localhost -c "DROP DATABASE mp3_manager_backup;"
```

### Delete Dump File
```bash
# Windows
del railway-prod-dump.sql
```

### Reset .env
```env
DB_NAME="mp3_manager"
```

---

## Additional Commands

### Check Railway Connection
```bash
railway status
```

### View Railway Variables
```bash
railway variables
```

### Connect to Production Database (READ-ONLY)
```bash
railway connect
```
**⚠️ CAUTION**: This connects directly to production. Use only for reading data.

---

## FAQ

### Q: Will this affect my production database?
**A**: No. All operations are read-only on production. You're downloading a copy.

### Q: Will this overwrite my local development database?
**A**: No. It creates a separate `mp3_manager_backup` database.

### Q: Can I make changes to the backup database?
**A**: Yes! That's the whole point. Changes only affect the local backup.

### Q: How long does it take?
**A**: Depends on database size. Usually 1-5 minutes for typical databases.

### Q: Can I download multiple times?
**A**: Yes! Run the script anytime. It will drop and recreate the backup database.

### Q: What if I want to keep multiple versions?
**A**: Manually create databases with different names (e.g., `mp3_manager_backup_nov24`).

---

## Summary

```bash
# Download production data
npm run db:download-prod

# Update .env
DB_NAME="mp3_manager_backup"

# Restart dev server
npm run dev

# When done, switch back
DB_NAME="mp3_manager"
```

**Remember**: Production is never modified. Your local dev database is never modified. The backup is isolated and safe for testing.

---

**Status**: Production Ready | **Last Updated**: November 24, 2025
