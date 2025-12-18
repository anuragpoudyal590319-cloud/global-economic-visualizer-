import axios from 'axios';
import { RateModel } from '../models/Rate';
import { CountryModel } from '../models/Country';
import { getCountriesByCurrency } from '../utils/countryCurrencyMap';
import { exchangeRateLimiter } from '../utils/apiRateLimiter';

// Using ER API (free, no key required for basic usage)
// https://open.er-api.com/v6/latest/USD
const EXCHANGE_API_URL = process.env.EXCHANGE_RATE_API_URL || 'https://open.er-api.com/v6/latest/USD';

export interface ExchangeRateResponse {
  result?: string;
  base_code?: string;
  time_last_update_utc?: string;
  rates: Record<string, number>;
}

export async function fetchExchangeRates(): Promise<void> {
  try {
    console.log('Fetching exchange rates...');
    
    // Wait for rate limiter before making API call
    await exchangeRateLimiter.wait();
    
    const response = await axios.get<ExchangeRateResponse>(EXCHANGE_API_URL);

    const rates = response.data.rates;
    const dateStr =
      response.data.time_last_update_utc ||
      new Date().toISOString();
    const date = String(dateStr).split(' ')[0]?.split('T')[0] || new Date().toISOString().split('T')[0];
    
    if (!rates || typeof rates !== 'object') {
      throw new Error('Invalid API response: rates not found');
    }

    // Ensure USD itself exists (some APIs omit it)
    rates.USD = rates.USD ?? 1;

    // Process each currency and map to countries
    for (const [currencyCode, rate] of Object.entries(rates)) {
      // Find all countries using this currency
      const countries = getCountriesByCurrency(currencyCode);
      
      if (countries.length === 0) {
        // If no direct mapping, try to find by currency code as country code
        // Some currencies match country codes (e.g., EUR for EU)
        continue;
      }

      // Upsert exchange rate for each country
      for (const countryIso of countries) {
        // Verify country exists in database
        const country = CountryModel.getByIso(countryIso);
        if (!country) {
          console.warn(`Country ${countryIso} not found in database, skipping`);
          continue;
        }

        RateModel.upsertExchangeRate({
          country_iso: countryIso,
          currency_code: currencyCode,
          rate_to_usd: rate,
          source: 'open.er-api.com',
          effective_date: date,
        });
      }
    }

    console.log(`Successfully updated exchange rates for ${Object.keys(rates).length} currencies`);
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    throw error;
  }
}

