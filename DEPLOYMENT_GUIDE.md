# Production Deployment Guide

## ✅ Phase 1: Pre-Deployment (COMPLETED)

- ✅ Backend built successfully (`backend/dist/` created)
- ✅ Frontend built successfully (`frontend/dist/` created)
- ✅ Environment variables checklist created (`PRODUCTION_ENV_CHECKLIST.md`)

## 📋 Phase 2: Account Creation

### Step 2.1: Create Railway Account (Backend)

1. **Go to Railway**: https://railway.app
2. **Click "Start a New Project"** or **"Login"** if you have an account
3. **Sign up options**:
   - **Recommended**: Sign up with GitHub (easiest for deployment)
   - Alternative: Sign up with email
4. **Complete registration**:
   - If using GitHub: Authorize Railway to access your repositories
   - If using email: Verify your email address
5. **Note**: Free tier includes $5/month credit (sufficient for MVP)

**Action Required**: Complete Railway account creation, then proceed to Step 2.2

---

### Step 2.2: Create Vercel Account (Frontend)

1. **Go to Vercel**: https://vercel.com
2. **Click "Sign Up"**
3. **Sign up options**:
   - **Recommended**: Sign up with GitHub (easiest for deployment)
   - Alternative: Sign up with email
4. **Complete registration**:
   - If using GitHub: Authorize Vercel to access your repositories
   - If using email: Verify your email address
5. **Note**: Free tier includes unlimited static sites

**Action Required**: Complete Vercel account creation, then proceed to Phase 3

---

## 🚀 Phase 3: Backend Deployment (Railway)

### Step 3.1: Connect GitHub Repository

1. **In Railway dashboard**, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. **Authorize Railway** to access your GitHub (if not already done)
4. **Select your repository** containing this project
5. Railway will auto-detect Node.js

### Step 3.2: Configure Backend Service

1. Railway should auto-detect the `backend/` folder
2. **If not detected**, click on the service → Settings → Set root directory to `backend/`
3. **Verify build settings** (should be auto-detected):
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Port**: Railway auto-assigns (use `PORT` env var - don't override)

### Step 3.3: Set Environment Variables

1. **In Railway project**, click on your service
2. Go to **"Variables"** tab
3. **Add each variable** (click "New Variable"):

```
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.vercel.app
GEMINI_API_KEY=your_actual_gemini_key_here
EXCHANGE_RATE_API_URL=https://open.er-api.com/v6/latest/USD
WORLD_BANK_API_URL=https://api.worldbank.org/v2
CACHE_TTL=3600
DATABASE_PATH=./data/economic_data.json
```

**Important**:
- Replace `your_actual_gemini_key_here` with your real Gemini API key
- `CORS_ORIGIN` will be updated after frontend deployment (use placeholder for now)
- Railway auto-sets `PORT` - do NOT add it manually

### Step 3.4: Deploy Backend

1. Railway will **auto-deploy** when you connect the repo
2. **Or click "Deploy"** button if needed
3. **Wait for build** (2-5 minutes)
4. **Check deployment logs**:
   - Click on deployment → View logs
   - Look for: `🚀 Server running on http://localhost:${PORT}`
   - Look for: `📊 API endpoints available at http://localhost:${PORT}/api`
5. **Copy the generated URL**:
   - Railway provides a URL like: `https://your-app-name.up.railway.app`
   - Or you can set a custom domain
   - **Save this URL** - you'll need it for frontend!

### Step 3.5: Verify Backend

1. **Test health endpoint**:
   ```
   https://your-backend.railway.app/api/health
   ```
   Should return:
   ```json
   {
     "status": "ok",
     "timestamp": "...",
     "uptime": ...,
     "queue": {...}
   }
   ```

2. **Test countries endpoint**:
   ```
   https://your-backend.railway.app/api/countries
   ```
   Should return an array of countries

3. **If errors occur**:
   - Check Railway logs for error messages
   - Verify all environment variables are set correctly
   - Check that `GEMINI_API_KEY` is valid

**Action Required**: Complete backend deployment and save the Railway URL, then proceed to Phase 4

---

## 🎨 Phase 4: Frontend Deployment (Vercel)

### Step 4.1: Connect GitHub Repository

1. **In Vercel dashboard**, click **"Add New Project"**
2. **Import your GitHub repository**
3. **Authorize Vercel** to access your GitHub (if not already done)
4. **Select your repository**

### Step 4.2: Configure Frontend Project

1. **Set root directory** to `frontend/`
2. **Verify build settings** (should be auto-detected):
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 4.3: Set Environment Variables

1. **Before deploying**, go to **"Environment Variables"** section
2. **Add variables**:

```
VITE_API_URL=https://your-backend.railway.app
VITE_MAPBOX_TOKEN=your_actual_mapbox_token_here
```

**Important**:
- Replace `https://your-backend.railway.app` with your **actual Railway URL** from Step 3.4
- Replace `your_actual_mapbox_token_here` with your real Mapbox token
- These are **build-time variables** (Vite requires `VITE_` prefix)

### Step 4.4: Deploy Frontend

1. **Click "Deploy"** button
2. **Wait for build** (1-2 minutes)
3. **Vercel provides**:
   - Preview URL (for each commit)
   - Production URL (for main branch)
4. **Copy the production URL** (e.g., `https://your-app.vercel.app`)
   - **Save this URL** - you'll need it for CORS update!

### Step 4.5: Update Backend CORS

1. **Go back to Railway** → Your backend service → Variables
2. **Update `CORS_ORIGIN`**:
   - Change from: `https://your-frontend.vercel.app`
   - To: Your actual Vercel production URL (e.g., `https://your-app.vercel.app`)
3. **Railway will auto-redeploy** when you save the variable
4. **Wait for redeploy** (1-2 minutes)

**Action Required**: Complete frontend deployment and update CORS, then proceed to Phase 5

---

## ✅ Phase 5: Post-Deployment Verification

### Step 5.1: Test Frontend

1. **Open your Vercel production URL** in a browser
2. **Open browser DevTools** (F12) → Console tab
3. **Verify**:
   - ✅ Page loads without errors
   - ✅ No CORS errors in console
   - ✅ Maps render correctly
   - ✅ Network tab shows API calls to Railway backend

### Step 5.2: Test API Integration

1. **In browser DevTools** → Network tab
2. **Interact with the app**:
   - Click on a country
   - Search for a country
   - Generate AI analysis
3. **Verify**:
   - ✅ API calls succeed (status 200)
   - ✅ Data loads on maps
   - ✅ No CORS errors

### Step 5.3: Test Critical Features

Test each feature:

- [ ] **All 14 maps load** and display data
- [ ] **Country selection** works (clicking countries highlights them)
- [ ] **Search functionality** works (search bar finds countries)
- [ ] **Details drawer** opens when clicking countries
- [ ] **Historical charts** display in drawer
- [ ] **AI analysis** generates successfully (click "Generate Analysis")
- [ ] **Mobile responsiveness** (test on phone or resize browser)

### Step 5.4: Monitor Logs

1. **Railway logs**:
   - Check for scheduler messages (cron jobs running)
   - Check for any error messages
   - Verify data fetching is working

2. **Vercel logs**:
   - Check function logs (if any)
   - Check for build errors

---

## 🎉 Success Criteria

Your deployment is successful when:

- ✅ Backend health endpoint returns 200 OK
- ✅ Frontend loads without console errors
- ✅ All maps render with data
- ✅ API calls succeed (no CORS errors)
- ✅ AI analysis works
- ✅ No errors in Railway/Vercel logs
- ✅ All 14 maps display correctly
- ✅ Country search and selection work

---

## 🆘 Troubleshooting

### CORS Errors
- **Problem**: Browser console shows CORS errors
- **Solution**: Verify `CORS_ORIGIN` in Railway matches exact Vercel URL (including `https://`)

### API Not Responding
- **Problem**: API calls fail or timeout
- **Solution**: 
  - Check Railway logs for errors
  - Verify `PORT` env var is not set (Railway auto-sets it)
  - Check Railway service is running (not sleeping)

### Maps Not Loading
- **Problem**: Maps don't render or show errors
- **Solution**: 
  - Verify `VITE_MAPBOX_TOKEN` is set correctly in Vercel
  - Check browser console for Mapbox errors
  - Verify Mapbox token is valid and has quota remaining

### Build Failures
- **Problem**: Railway or Vercel build fails
- **Solution**:
  - Check build logs for specific errors
  - Verify all dependencies in `package.json`
  - Check that root directory is set correctly (`backend/` for Railway, `frontend/` for Vercel)

### Data Not Loading
- **Problem**: Maps show "No data" for all countries
- **Solution**:
  - Wait 2-3 minutes after first deploy (initial data fetch)
  - Check Railway logs for scheduler messages
  - Verify external APIs are accessible (World Bank, Exchange Rate API)

---

## 📝 Next Steps After Deployment

1. **Set up monitoring** (optional):
   - Create UptimeRobot account (free)
   - Add monitors for backend and frontend URLs

2. **Custom domains** (optional):
   - Add custom domain in Railway
   - Add custom domain in Vercel
   - Update DNS records
   - Update `CORS_ORIGIN` and `VITE_API_URL`

3. **Enable auto-deploy**:
   - Both Railway and Vercel auto-deploy on git push to main branch
   - This is enabled by default

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Railway and Vercel deployment logs
3. Check browser console for client-side errors
4. Verify all environment variables are set correctly

Good luck with your deployment! 🚀

