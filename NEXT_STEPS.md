# Next Steps - Getting Started

## ✅ Immediate Actions Required

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Get Mapbox Token (Required for Map)

1. Go to https://account.mapbox.com/
2. Sign up for a free account (or log in)
3. Navigate to your account tokens
4. Copy your **Default Public Token** (starts with `pk.`)

### 3. Set Up Environment Variables

**Backend** - Create `backend/.env`:
```env
NODE_ENV=development
PORT=3000
DATABASE_PATH=./data/economic_data.db
CACHE_TTL=3600
CORS_ORIGIN=http://localhost:5173
EXCHANGE_RATE_API_URL=https://api.exchangerate.host
WORLD_BANK_API_URL=https://api.worldbank.org/v2
```

**Frontend** - Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000/api
VITE_MAPBOX_TOKEN=pk.your_actual_token_here
```

### 4. Start the Application

**Terminal 1 - Backend:**
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

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### 5. Test the Application

1. Open http://localhost:5173 in your browser
2. You should see the world map
3. Try clicking the three buttons (Interest Rates, Inflation Rates, Exchange Rates)
4. Hover over countries to see data
5. Click countries for detailed popups

### 6. Verify Backend is Working

Test the API endpoints:
```bash
# Health check
curl http://localhost:3000/api/health

# Get countries
curl http://localhost:3000/api/countries | head -20

# Get interest rates (may be empty initially)
curl http://localhost:3000/api/rates/interest
```

## 🔄 Initial Data Population

The database will be automatically seeded with countries when you first start the backend. However, **economic data (rates) will be empty initially** until the cron jobs run or you manually trigger data fetching.

### Option A: Wait for Scheduled Updates
- Exchange rates: Next run at 2 AM UTC (daily)
- Interest rates: Next run Monday at 3 AM UTC (weekly)
- Inflation rates: Next run 1st of month at 4 AM UTC (monthly)

### Option B: Manually Trigger Data Fetch (Recommended)

You can create a simple script to fetch initial data. Create `backend/src/scripts/fetchInitialData.ts`:

```typescript
import { initializeDatabase } from '../config/database';
import { seedCountries } from '../services/countrySeedService';
import { fetchExchangeRates } from '../services/exchangeRateService';
import { fetchInterestRates, fetchInflationRates } from '../services/worldBankService';

async function main() {
  console.log('Initializing database...');
  initializeDatabase();
  
  const { db } = require('../config/database');
  const countryCount = db.prepare('SELECT COUNT(*) as count FROM countries').get() as { count: number };
  
  if (countryCount.count === 0) {
    console.log('Seeding countries...');
    seedCountries();
  }
  
  console.log('Fetching exchange rates...');
  await fetchExchangeRates();
  
  console.log('Fetching interest rates (this may take a few minutes)...');
  await fetchInterestRates();
  
  console.log('Fetching inflation rates (this may take a few minutes)...');
  await fetchInflationRates();
  
  console.log('✅ Initial data fetch complete!');
  process.exit(0);
}

main().catch(console.error);
```

Then add to `backend/package.json`:
```json
"scripts": {
  "fetch-data": "tsx src/scripts/fetchInitialData.ts"
}
```

Run it:
```bash
cd backend
npm run fetch-data
```

**Note:** World Bank API calls may take 5-10 minutes as they fetch data country-by-country with rate limiting.

## 🐛 Troubleshooting

### Map shows "Mapbox token is required"
- ✅ Check `frontend/.env` exists and has `VITE_MAPBOX_TOKEN`
- ✅ Restart the frontend dev server after adding the token
- ✅ Verify token is valid at https://account.mapbox.com/

### Backend won't start
- ✅ Check Node.js version: `node --version` (should be 18+)
- ✅ Check port 3000 is not in use: `lsof -i :3000`
- ✅ Check database directory permissions

### Frontend can't connect to backend
- ✅ Verify backend is running on port 3000
- ✅ Check `VITE_API_URL` in `pk.eyJ1IjoiYW51cmFnNTkwMzE5IiwiYSI6ImNtajY2ZHVpazI1dWYzZXB2bXIyd2MzZXgifQ.6QF_T9c7fTM5sujzsypbqg`
- ✅ Check browser console for CORS errors
- ✅ Verify `CORS_ORIGIN` in `backend/.env` matches frontend URL

### No data showing on map
- ✅ Check backend logs for API errors
- ✅ Verify data exists: `curl http://localhost:3000/api/rates/interest`
- ✅ Check browser network tab for failed requests
- ✅ Run the initial data fetch script (see above)

### World Bank API errors
- ✅ World Bank API is free but may have rate limits
- ✅ Some countries may not have data available
- ✅ Check backend logs for specific error messages
- ✅ The app will continue working with partial data

## 🚀 Optional: Deploy to Production

Once everything works locally, see `EXECUTION_PLAN.md` for deployment instructions to:
- **Backend**: Railway, Fly.io, or Render
- **Frontend**: Vercel or Netlify

## 📚 Documentation Reference

- **Quick Start**: This file
- **Full Setup Guide**: `EXECUTION_PLAN.md`
- **Architecture**: `ARCHITECTURE.md`
- **Deployment**: `DEPLOYMENT.md`
- **Quick Reference**: `QUICK_REFERENCE.md`

## 💡 Tips

1. **Start with Exchange Rates**: They're fastest to fetch (single API call)
2. **Check Backend Logs**: They show API fetch progress and errors
3. **Use Browser DevTools**: Network tab shows API calls, Console shows errors
4. **Test API Directly**: Use `curl` or Postman to test backend endpoints
5. **Mapbox Free Tier**: 50,000 map loads/month is plenty for development

## ✅ Checklist

- [ ] Installed backend dependencies (`cd backend && npm install`)
- [ ] Installed frontend dependencies (`cd frontend && npm install`)
- [ ] Got Mapbox token from https://account.mapbox.com/
- [ ] Created `backend/.env` with configuration
- [ ] Created `frontend/.env` with Mapbox token
- [ ] Started backend server (`npm run dev` in backend/)
- [ ] Started frontend server (`npm run dev` in frontend/)
- [ ] Opened http://localhost:5173 in browser
- [ ] Verified map loads correctly
- [ ] (Optional) Fetched initial data

Once you complete these steps, your application should be fully functional! 🎉

