# Railway Data Persistence Guide

## How Data Persistence Works

The application uses a file-based JSON database stored at `./data/economic_data.json`.

### Railway Storage Behavior

Railway **does persist files** in your project directory between deployments. The `./data/` directory and its contents will persist as long as:

1. The service is not deleted
2. The file is written to the project directory (not `/tmp` or other ephemeral locations)

### Current Configuration

- **Database Path**: `./data/economic_data.json` (set via `DATABASE_PATH` env var)
- **Location**: Project root directory (`/app/data/economic_data.json` in Railway)
- **Persistence**: ✅ Files in project directory persist between deployments

### Automatic Data Population

The application now automatically:
1. **Checks on startup** if data exists
2. **Fetches data automatically** if database is empty or missing indicators
3. **Runs in background** so server starts immediately
4. **Takes 10-15 minutes** to complete initial fetch

### Manual Data Fetch

You can still manually trigger data fetch:
```bash
curl -X POST https://your-backend.railway.app/api/fetch-data
```

### Scheduled Updates

Data is automatically updated:
- **Exchange rates**: Every 6 hours
- **World Bank indicators**: Monthly (1st of month at 3 AM UTC)

### Troubleshooting

If data is not persisting:

1. **Check Railway logs** for database initialization messages
2. **Verify DATABASE_PATH** is set to `./data/economic_data.json`
3. **Check file permissions** - Railway should handle this automatically
4. **Verify data directory exists** - Created automatically on startup

### Railway Volumes (Optional)

If you need guaranteed persistence across service restarts, you can add a Railway volume:

1. Go to Railway → Your service → Settings
2. Add a volume mount:
   - **Mount Path**: `/app/data`
   - **Volume Name**: `economic-data`

However, this is **not required** - Railway persists files in the project directory by default.

