# Production Environment Variables Checklist

## Backend Environment Variables (Railway)

Copy these to Railway project settings → Variables:

```
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.vercel.app
GEMINI_API_KEY=your_actual_gemini_key_here
EXCHANGE_RATE_API_URL=https://open.er-api.com/v6/latest/USD
WORLD_BANK_API_URL=https://api.worldbank.org/v2
CACHE_TTL=3600
DATABASE_PATH=./data/economic_data.json
```

**Important Notes:**
- `CORS_ORIGIN` will be updated after frontend deployment with actual Vercel URL
- `GEMINI_API_KEY` - Use your actual Gemini API key
- Railway auto-sets `PORT` - do NOT override it
- `DATABASE_PATH` - Keep as `./data/economic_data.json` (Railway will create data directory)

## Frontend Environment Variables (Vercel)

Copy these to Vercel project settings → Environment Variables:

```
VITE_API_URL=https://your-backend.railway.app
VITE_MAPBOX_TOKEN=your_actual_mapbox_token_here
```

**Important Notes:**
- `VITE_API_URL` will be updated after backend deployment with actual Railway URL
- `VITE_MAPBOX_TOKEN` - Use your actual Mapbox token
- These are build-time variables (Vite requires `VITE_` prefix)

## Deployment Order

1. Deploy backend first → Get Railway URL
2. Update `VITE_API_URL` in Vercel with Railway URL
3. Deploy frontend → Get Vercel URL
4. Update `CORS_ORIGIN` in Railway with Vercel URL

## Verification

After deployment, verify:
- Backend health: `https://your-backend.railway.app/api/health`
- Frontend loads: `https://your-frontend.vercel.app`
- No CORS errors in browser console
- Maps render correctly
- API calls succeed

