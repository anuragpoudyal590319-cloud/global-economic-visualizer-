# Deployment & Scaling Plan

## Free Tier Hosting Strategy

### Backend Deployment Options

#### Option 1: Railway (Recommended)
- **Free Tier**: $5/month credit (sufficient for MVP)
- **PostgreSQL**: Included
- **Auto-deploy**: Git integration
- **Environment Variables**: Easy configuration
- **Cost**: Free for low traffic

#### Option 2: Fly.io
- **Free Tier**: 3 shared VMs
- **PostgreSQL**: Separate free tier
- **Global Edge**: Fast worldwide
- **Cost**: Free for low traffic

#### Option 3: Render
- **Free Tier**: Web service + PostgreSQL
- **Limitations**: Spins down after 15min inactivity
- **Cost**: Free

### Frontend Deployment

#### Vercel (Recommended)
- **Free Tier**: Unlimited static sites
- **CDN**: Global edge network
- **Auto-deploy**: Git integration
- **Cost**: Free

#### Netlify
- **Free Tier**: 100GB bandwidth/month
- **CDN**: Global edge network
- **Cost**: Free

## Environment Configuration

### Backend Environment Variables
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
CACHE_TTL=3600
EXCHANGE_RATE_API_URL=https://api.exchangerate.host
WORLD_BANK_API_URL=https://api.worldbank.org
FRED_API_KEY=optional_if_needed
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Frontend Environment Variables
```env
VITE_API_URL=https://your-backend.railway.app
VITE_MAPBOX_TOKEN=your_mapbox_token
```

## Scaling Considerations

### Current Architecture (Free Tier)
- Handles ~1000 requests/day easily
- In-memory cache sufficient
- SQLite or small PostgreSQL instance

### Future Scaling (If Needed)
1. **Redis Cache**: Move from in-memory to Redis
2. **Database**: Upgrade PostgreSQL plan
3. **CDN**: Already using Vercel/Netlify CDN
4. **Load Balancing**: Not needed until 10k+ requests/day
5. **Monitoring**: Add Sentry (free tier) for error tracking

## Cost Breakdown (Free Tier)

- **Backend Hosting**: $0 (Railway free credit)
- **Database**: $0 (included with Railway)
- **Frontend Hosting**: $0 (Vercel free tier)
- **API Calls**: $0 (all free APIs)
- **Map Tiles**: $0 (Mapbox free tier: 50k loads/month)
- **Total Monthly Cost**: $0

## Performance Targets

- **API Response Time**: < 200ms (cached)
- **Frontend Load Time**: < 2s
- **Map Render Time**: < 1s
- **Data Freshness**: Exchange rates daily, others weekly/monthly

## Monitoring & Alerts

- **Uptime**: UptimeRobot (free tier)
- **Errors**: Console logging + optional Sentry
- **API Health**: Health check endpoint `/health`

