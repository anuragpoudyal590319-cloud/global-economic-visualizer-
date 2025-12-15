# Fix Mapbox Token Issue

## Problem
The app shows "Map Unavailable" because the Mapbox token isn't being read.

## Solution

### Step 1: Verify Token in .env File

Open `frontend/.env` and make sure it looks like this:

```env
VITE_API_URL=http://localhost:3001/api
VITE_MAPBOX_TOKEN=pk.your_actual_token_here
```

**Important**: 
- Replace `pk.your_actual_token_here` with your actual Mapbox token
- The token should start with `pk.`
- No quotes needed
- No spaces around the `=`

### Step 2: Restart Frontend Server

**Vite requires a server restart to pick up new environment variables!**

1. **Stop the frontend server** (if running):
   - Press `Ctrl+C` in the terminal where it's running
   - Or run: `pkill -f vite`

2. **Restart the frontend server**:
   ```bash
   cd "/Users/anuragpoudyal/Library/Mobile Documents/com~apple~CloudDocs/Architect/frontend"
   npm run dev
   ```

3. **Refresh your browser** (or the page will auto-reload)

### Step 3: Verify It Works

After restarting:
- The console warning should disappear
- The map should load (even if empty/gray)
- You should see the world map instead of "Map Unavailable"

## Quick Check

To verify your token is set correctly:
```bash
cd frontend
cat .env | grep MAPBOX_TOKEN
```

You should see your token (not empty).

## Still Not Working?

1. **Check token format**: Should be `pk.eyJ...` (long string)
2. **Check file location**: Must be in `frontend/.env` (not `backend/.env`)
3. **Check server restart**: Must restart Vite after changing `.env`
4. **Check browser cache**: Try hard refresh (Cmd+Shift+R on Mac)

