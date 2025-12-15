# Next Steps - Getting Your App Running

## ✅ Backend is Fixed!

Great! Now let's get the frontend running and test the full application.

## Step 1: Install Frontend Dependencies

```bash
cd frontend
npm install
```

This should complete without errors.

## Step 2: Get Mapbox Token (Required)

The map won't work without this:

1. **Go to**: https://account.mapbox.com/
2. **Sign up** for a free account (or log in if you have one)
3. **Navigate to**: "Access tokens" in your account
4. **Copy** your **Default Public Token** (starts with `pk.`)
5. **Free tier**: 50,000 map loads/month (plenty for development)

## Step 3: Create Frontend Environment File

Create `frontend/.env`:

```bash
cd frontend
touch .env
```

Add this content (replace with your actual token):

```env
VITE_API_URL=http://localhost:3000/api
VITE_MAPBOX_TOKEN=pk.your_actual_token_here
```

**Note**: If your backend is on a different port (like 3001), update `VITE_API_URL` accordingly.

## Step 4: Start Backend Server

Make sure your backend is running:

```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:3000
📊 API endpoints available at http://localhost:3000/api
❤️  Health check: http://localhost:3000/api/health
```

**If port 3000 is busy**, update `backend/.env`:
```env
PORT=3001
```

Then update `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

## Step 5: Start Frontend Server

In a **new terminal**:

```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

## Step 6: Open the App

1. Open your browser to: **http://localhost:5173**
2. You should see:
   - A header with "Economic Data World Map"
   - Three buttons: Interest Rates, Inflation Rates, Exchange Rates
   - A world map (may be gray initially if no data)

## Step 7: Test the Application

### Test Backend API First

In a terminal, test the endpoints:

```bash
# Health check
curl http://localhost:3000/api/health

# Get countries (should return list)
curl http://localhost:3000/api/countries | head -20

# Get rates (may be empty initially)
curl http://localhost:3000/api/rates/interest
curl http://localhost:3000/api/rates/inflation
curl http://localhost:3000/api/rates/exchange
```

### Test Frontend

1. **Click the buttons** - Toggle between Interest/Inflation/Exchange rates
2. **Hover over countries** - Should show hover effects
3. **Click countries** - Should show popups with data (if available)
4. **Check browser console** - Should have no errors

## Step 8: Fetch Initial Data (Optional but Recommended)

The map will be empty initially because no economic data has been fetched yet. You have two options:

### Option A: Wait for Scheduled Updates
- Exchange rates: Next run at 2 AM UTC (daily)
- Interest rates: Next run Monday at 3 AM UTC (weekly)
- Inflation rates: Next run 1st of month at 4 AM UTC (monthly)

### Option B: Manually Trigger Data Fetch (Recommended)

Create a script to fetch data immediately. I'll create this for you in the next step.

## Troubleshooting

### Map shows "Mapbox token is required"
- ✅ Check `frontend/.env` exists
- ✅ Verify `VITE_MAPBOX_TOKEN` is set correctly
- ✅ Restart frontend dev server after adding token

### Frontend can't connect to backend
- ✅ Verify backend is running (`curl http://localhost:3000/api/health`)
- ✅ Check `VITE_API_URL` in `frontend/.env` matches backend port
- ✅ Check browser console for CORS errors
- ✅ Verify `CORS_ORIGIN` in `backend/.env` includes `http://localhost:5173`

### No data showing on map
- ✅ This is normal initially - data needs to be fetched
- ✅ Check backend logs for API errors
- ✅ Run the data fetch script (see Step 8)

### Port conflicts
- ✅ Check what's using port 3000: `lsof -i :3000`
- ✅ Use different port: Set `PORT=3001` in `backend/.env`

## Quick Checklist

- [ ] Frontend dependencies installed (`cd frontend && npm install`)
- [ ] Mapbox token obtained and added to `frontend/.env`
- [ ] Backend server running (`cd backend && npm run dev`)
- [ ] Frontend server running (`cd frontend && npm run dev`)
- [ ] Opened http://localhost:5173 in browser
- [ ] Map loads (even if empty)
- [ ] Buttons work (toggle between data types)
- [ ] (Optional) Fetched initial data

## What Success Looks Like

✅ Backend running on port 3000 (or your chosen port)  
✅ Frontend running on port 5173  
✅ Map displays correctly (even if no data yet)  
✅ No errors in browser console  
✅ API endpoints return data (countries at minimum)  
✅ Can toggle between data types  

Once you see the map and can toggle between the three data types, you're ready to fetch data and see it visualized!

---

**Need help?** Check the browser console (F12) and backend terminal for error messages.

