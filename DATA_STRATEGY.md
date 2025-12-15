# Data Strategy & API Integration

## Data Schema Design

### Countries Table
```sql
CREATE TABLE countries (
  id INTEGER PRIMARY KEY,
  iso_code TEXT UNIQUE NOT NULL,  -- ISO-3166-1 alpha-2 (e.g., 'US', 'GB')
  iso_code_3 TEXT UNIQUE,          -- ISO-3166-1 alpha-3 (e.g., 'USA', 'GBR')
  name TEXT NOT NULL,
  region TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Interest Rates Table
```sql
CREATE TABLE interest_rates (
  id INTEGER PRIMARY KEY,
  country_iso TEXT NOT NULL,
  rate REAL NOT NULL,              -- Percentage (e.g., 5.25 for 5.25%)
  source TEXT,                     -- API source identifier
  effective_date DATE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (country_iso) REFERENCES countries(iso_code)
);
```

### Inflation Rates Table
```sql
CREATE TABLE inflation_rates (
  id INTEGER PRIMARY KEY,
  country_iso TEXT NOT NULL,
  rate REAL NOT NULL,              -- Percentage (e.g., 2.5 for 2.5%)
  period TEXT,                     -- 'monthly' or 'yearly'
  source TEXT,
  effective_date DATE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (country_iso) REFERENCES countries(iso_code)
);
```

### Exchange Rates Table
```sql
CREATE TABLE exchange_rates (
  id INTEGER PRIMARY KEY,
  country_iso TEXT NOT NULL,
  currency_code TEXT NOT NULL,     -- ISO-4217 (e.g., 'USD', 'EUR')
  rate_to_usd REAL NOT NULL,       -- 1 USD = rate_to_usd * currency
  source TEXT,
  effective_date DATE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (country_iso) REFERENCES countries(iso_code)
);
```

## Free API Integration Plan

### 1. Exchange Rates - exchangerate.host
**Endpoint**: `https://api.exchangerate.host/latest?base=USD`
**Frequency**: Daily
**Rate Limit**: None (public API)
**Data Format**: JSON
```json
{
  "rates": {
    "EUR": 0.85,
    "GBP": 0.73,
    ...
  }
}
```

### 2. Interest Rates - World Bank API
**Endpoint**: `https://api.worldbank.org/v2/country/{iso}/indicator/FR.INR.RINR`
**Frequency**: Weekly
**Rate Limit**: Free tier (no key needed for public data)
**Note**: Requires country-by-country requests, will batch

### 3. Inflation Rates - World Bank API
**Endpoint**: `https://api.worldbank.org/v2/country/{iso}/indicator/FP.CPI.TOTL.ZG`
**Frequency**: Monthly
**Rate Limit**: Free tier

### 4. Alternative: FRED API (US-focused but has international data)
**Endpoint**: `https://api.stlouisfed.org/fred/series/observations`
**Frequency**: As needed
**Rate Limit**: 120 requests/minute (free)

## Data Normalization Strategy

1. **ISO Code Mapping**: All data joined on ISO-3166-1 alpha-2 codes
2. **Currency Mapping**: Map countries to their primary currency (ISO-4217)
3. **Date Normalization**: Store effective dates, use most recent for display
4. **Missing Data**: Handle gracefully with null values, show "N/A" on map

## Update Schedule (Cron Jobs)

```javascript
// Daily at 2 AM UTC
exchangeRatesJob: '0 2 * * *'

// Weekly on Monday at 3 AM UTC
interestRatesJob: '0 3 * * 1'

// Monthly on 1st at 4 AM UTC
inflationRatesJob: '0 4 1 * *'
```

## Fallback Strategy

1. **Primary Source Fails**: Try alternative API
2. **Country Missing**: Skip, log warning
3. **Stale Data**: Use most recent available, mark with indicator
4. **API Rate Limit**: Exponential backoff, queue for retry

## Data Validation

- Interest rates: -10% to 50% (reasonable bounds)
- Inflation rates: -50% to 1000% (hyperinflation edge cases)
- Exchange rates: > 0, reasonable bounds per currency
- ISO codes: Validate against ISO-3166 standard list

