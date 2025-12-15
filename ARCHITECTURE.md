# Economic Data World Map - System Architecture

## Overview
A production-ready single-page web application displaying country-level economic indicators (interest rates, inflation, exchange rates) on an interactive world map.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  React + Vite + Mapbox GL JS                                 │
│  - Single-page app                                           │
│  - Choropleth map visualization                              │
│  - Toggle between Interest/Inflation/FX                      │
│  - Consumes ONLY backend APIs                                │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS REST API
┌──────────────────────┴──────────────────────────────────────┐
│                         BACKEND                              │
│  Node.js + Express + TypeScript                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  REST API Layer                                       │   │
│  │  - /api/countries                                     │   │
│  │  - /api/rates/interest                                │   │
│  │  - /api/rates/inflation                               │   │
│  │  - /api/rates/exchange                                │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Caching Layer (In-Memory / Redis)                   │   │
│  │  - Cache pre-processed country datasets              │   │
│  │  - TTL: 1 hour (configurable)                        │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Data Ingestion Pipeline                              │   │
│  │  - Scheduled cron jobs                                │   │
│  │  - Batch API fetching                                 │   │
│  │  - Data validation & normalization                    │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Database (PostgreSQL / SQLite)                       │   │
│  │  - Countries table (ISO-3166)                         │   │
│  │  - Interest rates table                               │   │
│  │  - Inflation rates table                              │   │
│  │  - Exchange rates table                               │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌─────▼──────┐ ┌────▼──────┐
│  Free APIs   │ │  Free APIs │ │ Free APIs │
│  Interest    │ │  Inflation │ │  Exchange │
│  Rates       │ │  Rates     │ │  Rates    │
└──────────────┘ └────────────┘ └───────────┘
```

## Data Flow

1. **Data Ingestion (Scheduled)**
   - Cron jobs fetch data from free APIs
   - Data is validated and normalized
   - Stored in database with timestamps
   - Cache is invalidated

2. **API Request Flow**
   - Frontend requests `/api/rates/{type}`
   - Backend checks cache first
   - If cache miss, queries database
   - Joins country data with ISO codes
   - Returns pre-processed JSON for map rendering
   - Caches result

3. **Frontend Rendering**
   - Receives country-level datasets
   - Maps data to country polygons by ISO code
   - Applies color scale based on values
   - Updates on toggle between data types

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: Prisma or TypeORM
- **Caching**: Node-cache (in-memory) or Redis
- **Scheduling**: node-cron
- **Validation**: Zod

### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite
- **Map Library**: Mapbox GL JS (or Leaflet)
- **Styling**: Tailwind CSS
- **State Management**: React hooks (useState, useEffect)

### Deployment
- **Backend**: Railway / Fly.io / Render (free tier)
- **Frontend**: Vercel / Netlify (free tier)
- **Database**: Railway PostgreSQL (free tier) or SQLite file

## Data Sources (Free APIs)

### Interest Rates
- **FRED API** (Federal Reserve Economic Data) - Free, no key required for public data
- **World Bank API** - Free, requires registration for API key
- **IMF Data Portal** - Free, public endpoints

### Inflation Rates
- **World Bank API** - Consumer Price Index (CPI) data
- **IMF Data Portal** - Inflation indicators
- **FRED API** - For US and some international data

### Exchange Rates
- **exchangerate.host** - Free, no API key required
- **ECB (European Central Bank)** - Free XML/JSON API
- **Fixer.io** - Free tier available (limited requests)

## Update Frequency Strategy

- **Exchange Rates**: Daily (updated once per day, cached for 1 hour)
- **Interest Rates**: Weekly (central banks update monthly/quarterly)
- **Inflation Rates**: Monthly (most countries report monthly)

## Caching Strategy

- **API Response Cache**: 1 hour TTL
- **Database Queries**: Results cached in memory
- **Frontend**: Static assets cached by CDN

## Cost Optimization

- All APIs are free tier
- Backend caching reduces API calls by 95%+
- Batch updates minimize external requests
- Free hosting tiers sufficient for MVP
- No client-side API calls (reduces CORS issues and API key exposure)

## Security

- No API keys exposed to frontend
- Environment variables for sensitive config
- Rate limiting on backend endpoints
- Input validation on all endpoints
- CORS configured for frontend domain only

