# Quick Reference Guide

## Common Commands

### Backend

```bash
# Install dependencies
cd backend && npm install

# Development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Check health
curl http://localhost:3000/api/health
```

### Frontend

```bash
# Install dependencies
cd frontend && npm install

# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=3000
DATABASE_PATH=./data/economic_data.db
CACHE_TTL=3600
CORS_ORIGIN=http://localhost:5173
EXCHANGE_RATE_API_URL=https://api.exchangerate.host
WORLD_BANK_API_URL=https://api.worldbank.org/v2
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
VITE_MAPBOX_TOKEN=pk.your_token_here
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/countries` | GET | List all countries |
| `/api/rates/interest` | GET | Interest rates by country |
| `/api/rates/inflation` | GET | Inflation rates by country |
| `/api/rates/exchange` | GET | Exchange rates vs USD |

## Data Update Schedule

- **Exchange Rates**: Daily at 2 AM UTC
- **Interest Rates**: Weekly (Monday) at 3 AM UTC
- **Inflation Rates**: Monthly (1st) at 4 AM UTC

## Troubleshooting

### Backend won't start
- Check if port 3000 is available
- Verify Node.js version (18+)
- Check database file permissions

### Frontend can't connect to backend
- Verify backend is running
- Check CORS_ORIGIN matches frontend URL
- Check API URL in frontend .env

### Map not loading
- Verify Mapbox token is set
- Check browser console for errors
- Verify token is valid at mapbox.com

### No data showing
- Check backend logs for API errors
- Verify cron jobs are running
- Check database has data: `SELECT COUNT(*) FROM interest_rates;`

## Database Queries

```sql
-- Check countries count
SELECT COUNT(*) FROM countries;

-- Check interest rates
SELECT * FROM interest_rates LIMIT 10;

-- Check inflation rates
SELECT * FROM inflation_rates LIMIT 10;

-- Check exchange rates
SELECT * FROM exchange_rates LIMIT 10;

-- Find countries without data
SELECT c.iso_code, c.name 
FROM countries c 
LEFT JOIN interest_rates ir ON c.iso_code = ir.country_iso 
WHERE ir.country_iso IS NULL;
```

## File Locations

- **Backend logs**: Console output (add file logging if needed)
- **Database**: `backend/data/economic_data.db`
- **Config**: `backend/src/config/`
- **API Routes**: `backend/src/routes/`
- **Frontend build**: `frontend/dist/`

## Useful Links

- **Mapbox**: https://account.mapbox.com/
- **World Bank API**: https://datahelpdesk.worldbank.org/
- **Exchange Rate API**: https://exchangerate.host/
- **Railway**: https://railway.app
- **Vercel**: https://vercel.com

