# Vercel Frontend Deployment Guide

## Quick Steps

### Step 1: Create Vercel Account (if not done)

1. Go to: https://vercel.com
2. Click "Sign Up"
3. Sign up with GitHub (recommended) or email
4. Verify email if required

### Step 2: Import GitHub Repository

1. In Vercel dashboard, click **"Add New Project"**
2. **Import your GitHub repository**
3. Select: `anuragpoudyal590319-cloud/global-economic-visualizer-`
4. Click **"Import"**

### Step 3: Configure Project Settings

1. **Set Root Directory**: 
   - Click "Edit" next to "Root Directory"
   - Set to: `frontend`
   - Click "Continue"

2. **Verify Build Settings** (should auto-detect):
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Step 4: Set Environment Variables

**BEFORE deploying**, go to **"Environment Variables"** section:

Add these variables:

```
VITE_API_URL=https://global-economic-visualizer-production.up.railway.app
VITE_MAPBOX_TOKEN=your_actual_mapbox_token_here
```

**Important**:
- Replace `your_actual_mapbox_token_here` with your real Mapbox token
- The `VITE_API_URL` is already set to your Railway backend
- These are **build-time variables** (Vite requires `VITE_` prefix)

### Step 5: Deploy

1. Click **"Deploy"** button
2. Wait for build (1-2 minutes)
3. Vercel will provide:
   - Preview URL (for each commit)
   - Production URL (for main branch)
4. **Copy the production URL** (e.g., `https://your-app.vercel.app`)

### Step 6: Update Backend CORS

1. Go back to **Railway** → Your backend service → **Variables** tab
2. Update `CORS_ORIGIN`:
   - Change from: `https://your-frontend.vercel.app`
   - To: Your actual Vercel production URL (e.g., `https://your-app.vercel.app`)
3. Railway will auto-redeploy when you save

### Step 7: Verify Deployment

1. Open your Vercel production URL in browser
2. Open DevTools (F12) → Console tab
3. Verify:
   - ✅ Page loads without errors
   - ✅ No CORS errors
   - ✅ Maps render correctly
   - ✅ Network tab shows API calls to Railway backend

## Environment Variables Reference

**Vercel Environment Variables:**
```
VITE_API_URL=https://global-economic-visualizer-production.up.railway.app
VITE_MAPBOX_TOKEN=pk.eyJ1IjoiYW51cmFnNTkwMzE5IiwiYSI6ImNtajY2ZHVpazI1dWYzZXB2bXIyd2MzZXgifQ.6QF_T9c7fTM5sujzsypbqg
```

**Railway Environment Variables (update CORS_ORIGIN):**
```
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

## Troubleshooting

### Build Fails
- Check that root directory is set to `frontend/`
- Verify `package.json` exists in `frontend/` folder
- Check build logs for specific errors

### Maps Don't Load
- Verify `VITE_MAPBOX_TOKEN` is set correctly
- Check browser console for Mapbox errors
- Verify token is valid

### API Calls Fail (CORS Errors)
- Verify `CORS_ORIGIN` in Railway matches exact Vercel URL
- Check that Railway redeployed after CORS update
- Verify `VITE_API_URL` points to correct Railway backend

## Success!

Once deployed, your app will be live at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://global-economic-visualizer-production.up.railway.app`

Both will auto-deploy on git push to main branch!

