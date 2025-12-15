# Economic Data World Map

A production-ready web application displaying country-level economic indicators (interest rates, inflation, exchange rates) on an interactive world map.

## Features

- 🌍 Interactive world map with country-level data
- 📊 Three data types: Interest Rates, Inflation Rates, Exchange Rates (vs USD)
- 🎨 Color-scaled choropleth visualization
- ⚡ Fast, cached API responses
- 💰 100% free to operate (free APIs + free hosting)

## Tech Stack

- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React + Vite + Mapbox GL JS
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Caching**: In-memory cache

## Project Structure

```
├── backend/          # Node.js + Express API
├── frontend/         # React + Vite app
├── docs/            # Architecture documentation
└── README.md
```

## Quick Start

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:3000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## API Endpoints

- `GET /api/countries` - List all countries with ISO codes
- `GET /api/rates/interest` - Interest rates by country
- `GET /api/rates/inflation` - Inflation rates by country
- `GET /api/rates/exchange` - Exchange rates vs USD by country
- `GET /health` - Health check

## Data Sources

- **Exchange Rates**: exchangerate.host (free, no API key)
- **Interest Rates**: World Bank API (free)
- **Inflation Rates**: World Bank API (free)

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## License

MIT

