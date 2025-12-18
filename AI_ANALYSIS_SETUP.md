# AI Analysis Feature - Setup Guide

## ✅ Implementation Complete

The AI analysis feature has been successfully integrated into the Global Economic Visualizer!

## 🎯 Features

- **AI-Powered Economic Analysis**: Explains chart patterns and relationships between indicators
- **Google Gemini Integration**: Uses Gemini 1.5 Flash (free tier: 60 requests/minute)
- **24-Hour Caching**: Results are cached to minimize API calls
- **Manual Generation**: "Generate Analysis" button in the drawer
- **Auto-Generation**: Optional auto-generation on country selection

## 📋 Setup Instructions

### Step 1: Get Gemini API Key

1. Go to https://aistudio.google.com/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key

### Step 2: Configure Backend

Add the API key to your backend `.env` file:

```env
GEMINI_API_KEY=your_api_key_here
```

**Location**: `backend/.env`

### Step 3: Restart Backend

```bash
cd backend
# Stop current server (Ctrl+C)
npm run dev
```

## 🚀 Usage

1. **Open the app** and select a country (click on map or search)
2. **Open the details drawer** (right side panel)
3. **Click "Generate Analysis"** button in the AI Analysis section
4. **Wait a few seconds** for the analysis to generate
5. **Read the insights** explaining:
   - Overall economic health
   - Relationships between indicators
   - Historical chart patterns
   - Notable economic characteristics

## 📊 What the Analysis Includes

The AI analyzes all 14 economic indicators:
- Real Interest Rate
- Inflation
- Exchange Rate
- GDP Growth
- Unemployment
- Government Debt
- GDP Per Capita
- Trade Balance
- Current Account
- FDI
- Population Growth
- Life Expectancy
- Gini Coefficient
- Exports

## 💾 Caching

- Analysis results are cached for **24 hours**
- Same country = same analysis (if data hasn't changed)
- Cached indicator shows "💾 Cached analysis" message

## 🔧 Configuration

### Enable Auto-Generation

In `frontend/src/App.tsx`, change:

```typescript
<AIAnalysis
  countryIso={selectedIso || ''}
  countryName={selectedCountry?.name || selectedIso || ''}
  autoGenerate={true}  // Change to true
/>
```

### Change Cache Duration

In `backend/src/routes/rates.ts`, modify:

```typescript
cache.set(cacheKey, analysis, 86400); // 86400 = 24 hours in seconds
```

## 🐛 Troubleshooting

### "Gemini API key not configured"
- Make sure `GEMINI_API_KEY` is set in `backend/.env`
- Restart the backend server

### "AI analysis failed"
- Check your API key is valid
- Verify you haven't exceeded rate limits (60 requests/minute)
- Check backend console for detailed error messages

### Analysis not showing
- Make sure the country has data
- Check browser console for errors
- Verify backend is running and accessible

## 📈 Cost

- **Free Tier**: 60 requests/minute
- **Estimated Cost**: $0/month for moderate usage
- **Caching**: Reduces API calls significantly

## 🎨 UI Location

The AI Analysis section appears:
- **Location**: Top of the details drawer
- **Above**: "Current Indicators" section
- **Below**: Country header

## 🔄 Next Steps

1. Get your Gemini API key
2. Add it to `backend/.env`
3. Restart backend
4. Test with a country selection
5. Enjoy AI-powered economic insights!

---

**Note**: The feature works even without the API key configured - it will show a helpful error message instead of crashing.

