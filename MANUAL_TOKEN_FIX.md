# Manual Fix: Add Mapbox Token

## The Problem
Your `.env` file shows `VITE_MAPBOX_TOKEN=` is **empty**. You need to add your actual token.

## Solution: Edit the .env File Directly

### Option 1: Using Terminal (Nano Editor)

1. **Open the .env file**:
   ```bash
   cd "/Users/anuragpoudyal/Library/Mobile Documents/com~apple~CloudDocs/Architect/frontend"
   nano .env
   ```

2. **Edit the file** - It should look like this:
   ```env
   VITE_API_URL=http://localhost:3001/api
   VITE_MAPBOX_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsb2V4YW1wbGUifQ.example
   ```
   
   **Replace** `pk.eyJ...` with your actual Mapbox token.

3. **Save and exit**:
   - Press `Ctrl+X`
   - Press `Y` to confirm
   - Press `Enter` to save

### Option 2: Using VS Code or Your Editor

1. **Open the file**:
   ```bash
   code "/Users/anuragpoudyal/Library/Mobile Documents/com~apple~CloudDocs/Architect/frontend/.env"
   ```

2. **Edit line 2** - Change:
   ```env
   VITE_MAPBOX_TOKEN=
   ```
   
   To:
   ```env
   VITE_MAPBOX_TOKEN=pk.your_actual_token_here
   ```

3. **Save the file** (Cmd+S)

### Option 3: Using the Script

Run:
```bash
cd "/Users/anuragpoudyal/Library/Mobile Documents/com~apple~CloudDocs/Architect"
./ADD_MAPBOX_TOKEN.sh
```

It will prompt you for your token.

## After Adding Token: RESTART SERVER

**This is critical!** Vite only reads `.env` when the server starts.

1. **Stop the frontend server**:
   - Find the terminal running `npm run dev`
   - Press `Ctrl+C`

2. **Restart it**:
   ```bash
   cd "/Users/anuragpoudyal/Library/Mobile Documents/com~apple~CloudDocs/Architect/frontend"
   npm run dev
   ```

3. **Refresh your browser** (or it will auto-reload)

## Verify It Worked

After restarting, check:
- ✅ No console warning about missing token
- ✅ Map loads (even if gray/empty)
- ✅ No "Map Unavailable" message

## Get Your Mapbox Token

If you don't have one yet:
1. Go to: https://account.mapbox.com/
2. Sign up (free)
3. Go to "Access tokens"
4. Copy your **Default Public Token**

## Quick Test

After adding token and restarting, check the console:
- Should NOT see: "Mapbox token not found"
- Should see the map loading

