# Step-by-Step Execution Plan

This document provides a complete guide to setting up, running, and deploying the Economic Data World Map application.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Mapbox account (free tier: 50k map loads/month)
- Git (for deployment)

## Step 1: Backend Setup

### 1.1 Install Dependencies

```bash
cd backend
npm install
```

### 1.2 Configure Environment

Create a `.env` file in the `backend` directory:

```env
NODE_ENV=development
PORT=3000
DATABASE_PATH=./data/economic_data.db
CACHE_TTL=3600
CORS_ORIGIN=http://localhost:5173
EXCHANGE_RATE_API_URL=https://api.exchangerate.host
WORLD_BANK_API_URL=https://api.worldbank.org/v2
```

### 1.3 Initialize Database

The database will be automatically initialized and seeded when you start the server for the first time.

### 1.4 Start Backend Server

```bash
npm run dev
```

The backend will:
- Initialize SQLite database
- Seed countries data
- Start API server on http://localhost:3000
- Initialize cron jobs for scheduled data updates

### 1.5 Manual Data Fetch (Optional)

To fetch initial data immediately, you can create a script or use the API endpoints after the server starts. The cron jobs will handle regular updates:
- Exchange rates: Daily at 2 AM UTC
- Interest rates: Weekly on Monday at 3 AM UTC
- Inflation rates: Monthly on 1st at 4 AM UTC

## Step 2: Frontend Setup

### 2.1 Install Dependencies

```bash
cd frontend
npm install
```

### 2.2 Get Mapbox Token

1. Go to https://account.mapbox.com/
2. Sign up for a free account
3. Copy your default public token
4. Create `.env` file in `frontend` directory:

```env
VITE_API_URL=http://localhost:3000/api
VITE_MAPBOX_TOKEN=pk.your_token_here
```

### 2.3 Start Frontend Development Server

```bash
npm run dev
```

The frontend will start on http://localhost:5173

## Step 3: Testing

### 3.1 Test Backend API

```bash
# Health check
curl http://localhost:3000/api/health

# Get countries
curl http://localhost:3000/api/countries

# Get interest rates
curl http://localhost:3000/api/rates/interest

# Get inflation rates
curl http://localhost:3000/api/rates/inflation

# Get exchange rates
curl http://localhost:3000/api/rates/exchange
```

### 3.2 Test Frontend

1. Open http://localhost:5173 in your browser
2. Verify map loads correctly
3. Test toggling between data types
4. Hover over countries to see data
5. Click countries to see detailed popups

## Step 4: Building for Production

### 4.1 Build Backend

```bash
cd backend
npm run build
```

This creates the `dist` folder with compiled JavaScript.

### 4.2 Build Frontend

```bash
cd frontend
npm run build
```

This creates the `dist` folder with optimized production assets.

## Step 5: Deployment

### Option A: Railway (Recommended for Backend)

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Deploy Backend**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway auto-detects Node.js
   - Add environment variables:
     ```
     NODE_ENV=production
     PORT=3000
     DATABASE_PATH=/data/economic_data.db
     CACHE_TTL=3600
     CORS_ORIGIN=https://your-frontend.vercel.app
     EXCHANGE_RATE_API_URL=https://api.exchangerate.host
     WORLD_BANK_API_URL=https://api.worldbank.org/v2
     ```
   - Add PostgreSQL service (free tier available)
   - Update DATABASE_URL if using PostgreSQL

3. **Get Backend URL**
   - Railway provides a URL like: `https://your-app.railway.app`

### Option B: Fly.io (Alternative Backend)

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Login: `fly auth login`
3. Initialize: `fly launch` in backend directory
4. Deploy: `fly deploy`

### Option C: Render (Alternative Backend)

1. Go to https://render.com
2. Create new Web Service
3. Connect GitHub repository
4. Set build command: `npm install && npm run build`
5. Set start command: `npm start`
6. Add environment variables

### Frontend Deployment: Vercel

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Deploy Frontend**
   - Click "New Project"
   - Import your GitHub repository
   - Set root directory to `frontend`
   - Add environment variables:
     ```
     VITE_API_URL=https://your-backend.railway.app/api
     VITE_MAPBOX_TOKEN=your_mapbox_token
     ```
   - Deploy

3. **Update CORS in Backend**
   - Update `CORS_ORIGIN` in backend to your Vercel URL

## Step 6: Post-Deployment

### 6.1 Verify Deployment

1. Check backend health: `https://your-backend.railway.app/api/health`
2. Check frontend loads: `https://your-frontend.vercel.app`
3. Test API endpoints
4. Verify map displays correctly

### 6.2 Monitor

- Check Railway/Fly.io logs for backend
- Check Vercel logs for frontend
- Monitor API rate limits
- Check database size

### 6.3 Set Up Monitoring (Optional)

- **Uptime Monitoring**: UptimeRobot (free tier)
- **Error Tracking**: Sentry (free tier)
- **Analytics**: Google Analytics or Plausible

## Troubleshooting

### Backend Issues

**Database not initializing**
- Check file permissions for data directory
- Ensure SQLite is available
- Check logs for errors

**API calls failing**
- Verify API URLs are correct
- Check rate limits
- Verify network connectivity

**Cron jobs not running**
- Check server timezone
- Verify cron syntax
- Check logs for errors

### Frontend Issues

**Map not loading**
- Verify Mapbox token is set
- Check browser console for errors
- Verify CORS is configured correctly

**Data not displaying**
- Check backend is running
- Verify API URL is correct
- Check network tab for failed requests

**Styling issues**
- Clear browser cache
- Verify CSS is loading
- Check for console errors

## Performance Optimization

### Backend

1. **Enable Redis** (if scaling)
   - Replace in-memory cache with Redis
   - Update cache configuration

2. **Database Optimization**
   - Add more indexes if needed
   - Consider connection pooling for PostgreSQL

3. **API Optimization**
   - Implement request batching
   - Add response compression

### Frontend

1. **Code Splitting**
   - Lazy load map component
   - Split routes if adding more pages

2. **Asset Optimization**
   - Enable gzip compression
   - Optimize images
   - Use CDN for static assets

## Maintenance

### Regular Tasks

1. **Monitor API Usage**
   - Check World Bank API limits
   - Monitor exchangerate.host usage
   - Track Mapbox usage

2. **Update Data**
   - Cron jobs handle automatic updates
   - Manual updates can be triggered via API

3. **Database Maintenance**
   - Regular backups
   - Clean old data if needed
   - Monitor database size

### Scaling Considerations

- **Traffic Growth**: Upgrade hosting plan
- **Database Growth**: Migrate to PostgreSQL
- **Cache**: Move to Redis for distributed caching
- **CDN**: Already using Vercel CDN for frontend

## Cost Breakdown (Free Tier)

- **Backend Hosting**: $0 (Railway free credit)
- **Database**: $0 (SQLite or Railway PostgreSQL free tier)
- **Frontend Hosting**: $0 (Vercel free tier)
- **API Calls**: $0 (all free APIs)
- **Map Tiles**: $0 (Mapbox free tier: 50k loads/month)
- **Total**: $0/month for MVP scale

## Next Steps

1. Add more data sources
2. Implement historical data views
3. Add country comparison features
4. Create data export functionality
5. Add mobile app (React Native)

