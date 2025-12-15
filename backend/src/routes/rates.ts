import { Router } from 'express';
import { RateModel } from '../models/Rate';
import { CountryModel } from '../models/Country';
import { cache, cacheKeys } from '../config/cache';
import { fetchExchangeRates } from '../services/exchangeRateService';

const router = Router();

type RateRow = {
  country_iso: string;
  country_name?: string;
  value: number;
  currency_code?: string | null;
  period?: string | null;
  effective_date?: string;
  updated_at: string;
  is_estimated?: boolean;
  estimated_from?: 'region_avg' | 'global_avg';
};

// Format rates for frontend consumption
function formatRatesForMap(rates: any[]) {
  return rates.map(rate => ({
    country_iso: rate.country_iso,
    country_name: rate.country_name,
    value: rate.rate || rate.rate_to_usd,
    currency_code: rate.currency_code || null,
    period: rate.period || null,
    effective_date: rate.effective_date,
    updated_at: rate.updated_at,
  }));
}

function dedupeLatestByCountry(rows: RateRow[]): RateRow[] {
  const byIso = new Map<string, RateRow>();
  for (const row of rows) {
    const iso = row.country_iso;
    const existing = byIso.get(iso);
    if (!existing) {
      byIso.set(iso, row);
      continue;
    }
    const existingTime = new Date(existing.updated_at).getTime();
    const rowTime = new Date(row.updated_at).getTime();
    if (rowTime >= existingTime) byIso.set(iso, row);
  }
  return Array.from(byIso.values());
}

function fillAllCountries(rows: RateRow[]): RateRow[] {
  const countries = CountryModel.getAll();
  const latestRows = dedupeLatestByCountry(rows);
  const byIso = new Map<string, RateRow>(latestRows.map(r => [r.country_iso, r]));

  // Compute global + region averages from real data
  const regionSum = new Map<string, { sum: number; count: number }>();
  let globalSum = 0;
  let globalCount = 0;

  for (const r of latestRows) {
    if (typeof r.value !== 'number' || Number.isNaN(r.value)) continue;
    globalSum += r.value;
    globalCount += 1;

    const region = countries.find(c => c.iso_code === r.country_iso)?.region || 'Unknown';
    const agg = regionSum.get(region) || { sum: 0, count: 0 };
    agg.sum += r.value;
    agg.count += 1;
    regionSum.set(region, agg);
  }

  const globalAvg = globalCount > 0 ? globalSum / globalCount : 0;
  const nowIso = new Date().toISOString();

  const filled: RateRow[] = [];
  for (const c of countries) {
    const existing = byIso.get(c.iso_code);
    if (existing) {
      filled.push({ ...existing, country_name: existing.country_name || c.name, is_estimated: false });
      continue;
    }

    const region = c.region || 'Unknown';
    const agg = regionSum.get(region);
    const regionAvg = agg && agg.count > 0 ? agg.sum / agg.count : null;

    const value = regionAvg ?? globalAvg;
    filled.push({
      country_iso: c.iso_code,
      country_name: c.name,
      value,
      currency_code: null,
      period: null,
      effective_date: undefined,
      updated_at: nowIso,
      is_estimated: true,
      estimated_from: regionAvg != null ? 'region_avg' : 'global_avg',
    });
  }

  return filled;
}

router.get('/interest', (req, res) => {
  try {
    // Check cache first
    const cached = cache.get(cacheKeys.interestRates);
    if (cached) {
      return res.json(cached);
    }

    // Fetch from database
    const rates = RateModel.getInterestRates();
    const formatted = fillAllCountries(formatRatesForMap(rates) as RateRow[]);

    // Cache the result
    cache.set(cacheKeys.interestRates, formatted);

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching interest rates:', error);
    res.status(500).json({ error: 'Failed to fetch interest rates' });
  }
});

router.get('/inflation', (req, res) => {
  try {
    // Check cache first
    const cached = cache.get(cacheKeys.inflationRates);
    if (cached) {
      return res.json(cached);
    }

    // Fetch from database
    const rates = RateModel.getInflationRates();
    const formatted = fillAllCountries(formatRatesForMap(rates) as RateRow[]);

    // Cache the result
    cache.set(cacheKeys.inflationRates, formatted);

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching inflation rates:', error);
    res.status(500).json({ error: 'Failed to fetch inflation rates' });
  }
});

router.get('/exchange', async (req, res) => {
  try {
    // Check cache first
    const cached = cache.get(cacheKeys.exchangeRates);
    if (cached) {
      return res.json(cached);
    }

    // Fetch from database
    let rates = RateModel.getExchangeRates();

    // If we have no real exchange rows yet, fetch once on-demand (then serve)
    if (!rates || rates.length === 0) {
      // Note: this will run only the first time on a fresh DB (cache empty)
      // and avoids making every request hit the external API.
      console.log('No exchange rates in DB; fetching once on-demand...');
      try {
        await fetchExchangeRates();
        // Invalidate any stale cache and re-read
        cache.del(cacheKeys.exchangeRates);
        rates = RateModel.getExchangeRates();
      } catch (e) {
        console.warn('On-demand exchange rate fetch failed; serving estimated-only response.');
        rates = [];
      }
    }

    const formatted = fillAllCountries(formatRatesForMap(rates) as RateRow[]);

    // Cache the result
    cache.set(cacheKeys.exchangeRates, formatted);

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    res.status(500).json({ error: 'Failed to fetch exchange rates' });
  }
});

router.get('/gdp', (req, res) => {
  try {
    const cached = cache.get(cacheKeys.gdpGrowthRates);
    if (cached) return res.json(cached);

    const rates = RateModel.getGDPGrowthRates();
    const formatted = fillAllCountries(formatRatesForMap(rates) as RateRow[]);

    cache.set(cacheKeys.gdpGrowthRates, formatted);
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching GDP growth rates:', error);
    res.status(500).json({ error: 'Failed to fetch GDP growth rates' });
  }
});

router.get('/unemployment', (req, res) => {
  try {
    const cached = cache.get(cacheKeys.unemploymentRates);
    if (cached) return res.json(cached);

    const rates = RateModel.getUnemploymentRates();
    const formatted = fillAllCountries(formatRatesForMap(rates) as RateRow[]);

    cache.set(cacheKeys.unemploymentRates, formatted);
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching unemployment rates:', error);
    res.status(500).json({ error: 'Failed to fetch unemployment rates' });
  }
});

router.get('/history/:countryIso/:type', (req, res) => {
  try {
    const { countryIso, type } = req.params;

    // Basic validation
    if (!countryIso || !['interest', 'inflation', 'exchange', 'gdp', 'unemployment'].includes(type)) {
      return res.status(400).json({ error: 'Invalid country code or data type' });
    }

    // Historical data is dynamic and country-specific, maybe short-term cache?
    // For now, no cache or very short TTL if implemented.
    const history = RateModel.getHistoricalRates(countryIso, type as any);

    // Simple response, no need to "fill all countries" or global averages
    res.json(history);
  } catch (error) {
    console.error(`Error fetching history for ${req.params.countryIso}/${req.params.type}:`, error);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

export default router;

