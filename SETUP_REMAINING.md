# Remaining Setup Steps

## ✅ Completed
- [x] Backend dependencies installed
- [x] Frontend dependencies installed
- [x] Backend database fixed (JSON-based)

## 🔄 Next Steps

### 1. Get Mapbox Token (REQUIRED)
1. Go to: https://account.mapbox.com/
2. Sign up for free account (or log in)
3. Go to "Access tokens"
4. Copy your **Default Public Token** (starts with `pk.`)

### 2. Add Token to .env File
Edit `frontend/.env` and add your token:
```env
VITE_API_URL=http://localhost:3000/api
VITE_MAPBOX_TOKEN=pk.your_actual_token_here
```

### 3. Start Backend Server
In Terminal 1:
```bash
cd "/Users/anuragpoudyal/Library/Mobile Documents/com~apple~CloudDocs/Architect/backend"
npm run dev
```

Wait for: `🚀 Server running on http://localhost:3000`

### 4. Start Frontend Server
In Terminal 2:
```bash
cd "/Users/anuragpoudyal/Library/Mobile Documents/com~apple~CloudDocs/Architect/frontend"
npm run dev
```

Wait for: `➜  Local:   http://localhost:5173/`

### 5. Open Browser
Visit: **http://localhost:5173**

### 6. Test the App
- ✅ Map should load (may be gray if no data)
- ✅ Three buttons should work (Interest/Inflation/Exchange)
- ✅ Hover over countries
- ✅ Click countries for popups

## 📝 Notes

- **Map will be empty initially** - This is normal! No economic data has been fetched yet.
- **Vulnerabilities warning** - The 2 moderate vulnerabilities are in dev dependencies and won't affect the app. You can ignore them for now.
- **Port conflicts** - If port 3000 is busy, change `PORT=3001` in `backend/.env` and update `VITE_API_URL` in `frontend/.env`

## 🎯 What Success Looks Like

When everything works:
- Backend shows: `🚀 Server running on http://localhost:3000`
- Frontend shows: `➜  Local:   http://localhost:5173/`
- Browser shows: World map with header and three buttons
- No errors in browser console (F12)

## 🐛 Quick Troubleshooting

**Map shows "Mapbox token is required"**
→ Add token to `frontend/.env` and restart frontend server

**Frontend can't connect**
→ Check backend is running, verify `VITE_API_URL` matches backend port

**Port 3000 busy**
→ Use port 3001: Update `backend/.env` (PORT=3001) and `frontend/.env` (VITE_API_URL=http://localhost:3001/api)
