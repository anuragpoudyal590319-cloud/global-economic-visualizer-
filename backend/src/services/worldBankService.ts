import axios from 'axios';
import { RateModel } from '../models/Rate';
import { CountryModel } from '../models/Country';

const WORLD_BANK_API_URL = process.env.WORLD_BANK_API_URL || 'https://api.worldbank.org/v2';

// World Bank country code mapping (ISO-3166-1 alpha-2 to World Bank codes)
const WB_COUNTRY_CODE_MAP: Record<string, string> = {
  // Add special mappings if needed
};

function getWorldBankCountryCode(isoCode: string): string {
  return WB_COUNTRY_CODE_MAP[isoCode] || isoCode;
}

// Generic fetcher for World Bank indicators
async function fetchIndicator(
  indicatorCode: string,
  onData: (countryIso: string, value: number, date: string) => void,
  label: string
) {
  try {
    console.log(`Fetching ${label} from World Bank...`);

    const countries = CountryModel.getAll();
    let successCount = 0;
    let errorCount = 0;

    // Batch sizing
    const batchSize = 10;

    // Fetch last 15 years of data to populate history
    const dateRange = `${new Date().getFullYear() - 15}:${new Date().getFullYear()}`;

    for (let i = 0; i < countries.length; i += batchSize) {
      const batch = countries.slice(i, i + batchSize);

      for (const country of batch) {
        try {
          const wbCode = getWorldBankCountryCode(country.iso_code);
          // Fetch historical data with date query
          const url = `${WORLD_BANK_API_URL}/country/${wbCode}/indicator/${indicatorCode}?format=json&per_page=20&date=${dateRange}`;

          const response = await axios.get(url);
          const data = response.data;

          if (data && data[1] && Array.isArray(data[1])) {
            const records = data[1];
            let recordsProcessed = 0;

            for (const record of records) {
              const value = parseFloat(record.value);
              if (!isNaN(value)) {
                // Determine date
                // World Bank returns "date" as "2022" for yearly data.
                // We'll normalize to ISO date (e.g. 2022-01-01) for consistency.
                const year = parseInt(record.date);
                const isoDate = !isNaN(year) ? `${year}-01-01` : null;

                if (isoDate) {
                  onData(country.iso_code, value, isoDate);
                  recordsProcessed++;
                }
              }
            }
            if (recordsProcessed > 0) successCount++;
          }

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (error) {
          errorCount++;
          // console.warn(`Failed to fetch ${label} for ${country.iso_code}`);
        }
      }
    }

    console.log(`${label}: ${successCount} countries updated successfully, ${errorCount} errors`);
  } catch (error) {
    console.error(`Error fetching ${label}:`, error);
    throw error;
  }
}

export async function fetchInterestRates(): Promise<void> {
  // FR.INR.RINR = Real interest rate
  await fetchIndicator('FR.INR.RINR', (iso, val, date) => {
    RateModel.upsertInterestRate({
      country_iso: iso,
      rate: val,
      source: 'worldbank',
      effective_date: date,
    });
  }, 'Interest Rates');
}

export async function fetchInflationRates(): Promise<void> {
  // FP.CPI.TOTL.ZG = Inflation, consumer prices (annual %)
  await fetchIndicator('FP.CPI.TOTL.ZG', (iso, val, date) => {
    RateModel.upsertInflationRate({
      country_iso: iso,
      rate: val,
      period: 'yearly',
      source: 'worldbank',
      effective_date: date,
    });
  }, 'Inflation Rates');
}

export async function fetchGDPGrowthRates(): Promise<void> {
  // NY.GDP.MKTP.KD.ZG = GDP growth (annual %)
  await fetchIndicator('NY.GDP.MKTP.KD.ZG', (iso, val, date) => {
    RateModel.upsertGDPGrowthRate({
      country_iso: iso,
      rate: val,
      source: 'worldbank',
      effective_date: date,
    });
  }, 'GDP Growth Rates');
}

export async function fetchUnemploymentRates(): Promise<void> {
  // SL.UEM.TOTL.ZS = Unemployment, total (% of total labor force) (modeled ILO estimate)
  await fetchIndicator('SL.UEM.TOTL.ZS', (iso, val, date) => {
    RateModel.upsertUnemploymentRate({
      country_iso: iso,
      rate: val,
      source: 'worldbank',
      effective_date: date,
    });
  }, 'Unemployment Rates');
}
