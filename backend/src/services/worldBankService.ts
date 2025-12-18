import axios from 'axios';
import { RateModel } from '../models/Rate';
import { CountryModel } from '../models/Country';
import { worldBankLimiter } from '../utils/apiRateLimiter';

const WORLD_BANK_API_URL = process.env.WORLD_BANK_API_URL || 'https://api.worldbank.org/v2';

// World Bank country code mapping (ISO-3166-1 alpha-2 to World Bank codes)
const WB_COUNTRY_CODE_MAP: Record<string, string> = {
  // Add special mappings if needed
};

function getWorldBankCountryCode(isoCode: string): string {
  return WB_COUNTRY_CODE_MAP[isoCode] || isoCode;
}

// Map World Bank ISO3 codes to our ISO-3166-1 alpha-2 codes
function getIso2FromIso3(iso3: string, countries: any[]): string | null {
  const country = countries.find(c => c.iso_code_3 === iso3);
  return country ? country.iso_code : null;
}

// Generic fetcher for World Bank indicators using bulk endpoint
// Optimized to fetch latest data first, then historical for charts
async function fetchIndicator(
  indicatorCode: string,
  onData: (countryIso: string, value: number, date: string) => void,
  label: string
) {
  try {
    console.log(`Fetching ${label} from World Bank (optimized for latest data)...`);

    const countries = CountryModel.getAll();
    const currentYear = new Date().getFullYear();
    
    // Strategy: Fetch latest 3 years first (for current values), then historical for charts
    // This ensures we get the most recent data quickly
    const latestDateRange = `${currentYear - 2}:${currentYear}`;
    const historicalDateRange = `${currentYear - 15}:${currentYear - 3}`;
    
    let totalRecords = 0;
    let countriesUpdated = new Set<string>();
    const perPage = 10000;

    // Helper function to fetch and process a date range
    const fetchDateRange = async (dateRange: string, rangeLabel: string) => {
      let page = 1;
      let rangeRecords = 0;

      while (true) {
        try {
          // Wait for rate limiter before making API call
          await worldBankLimiter.wait();
          
          const url = `${WORLD_BANK_API_URL}/countries/all/indicators/${indicatorCode}?format=json&per_page=${perPage}&date=${dateRange}&page=${page}`;
          
          const response = await axios.get(url, { timeout: 30000 });
          const data = response.data;

          if (!data || !Array.isArray(data) || data.length < 2 || !Array.isArray(data[1])) {
            break;
          }

          const records = data[1];
          if (records.length === 0) {
            break;
          }

          const pagination = data[0];
          if (pagination && pagination.page && pagination.pages && page === 1) {
            console.log(`  ${rangeLabel}: Processing ${pagination.pages} page(s)...`);
          }

          for (const record of records) {
            const value = parseFloat(record.value);
            if (isNaN(value)) continue;

            const iso3 = record.countryiso3code;
            if (!iso3) continue;

            const iso2 = getIso2FromIso3(iso3, countries);
            if (!iso2) continue;

            const year = parseInt(record.date);
            if (isNaN(year)) continue;

            const isoDate = `${year}-01-01`;
            onData(iso2, value, isoDate);
            countriesUpdated.add(iso2);
            totalRecords++;
            rangeRecords++;
          }

          if (pagination && pagination.page >= pagination.pages) {
            break;
          }

          page++;
          await new Promise(resolve => setTimeout(resolve, 150)); // Reduced delay for efficiency
        } catch (error: any) {
          if (error.response?.status === 502) {
            console.warn(`  ${rangeLabel} page ${page} returned 502, retrying...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
          console.error(`  Error fetching ${rangeLabel} page ${page}:`, error.message);
          break;
        }
      }

      return rangeRecords;
    };

    // Fetch latest data first (most important for current values)
    await fetchDateRange(latestDateRange, 'Latest data');
    
    // Then fetch historical data for charts (less critical, can be slower)
    await fetchDateRange(historicalDateRange, 'Historical data');

    console.log(`${label}: ${totalRecords} records processed, ${countriesUpdated.size} countries updated`);
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

export async function fetchGovernmentDebtRates(): Promise<void> {
  // GC.DOD.TOTL.GD.ZS = Central government debt, total (% of GDP)
  await fetchIndicator('GC.DOD.TOTL.GD.ZS', (iso, val, date) => {
    RateModel.upsertGovernmentDebtRate({
      country_iso: iso,
      rate: val,
      source: 'worldbank',
      effective_date: date,
    });
  }, 'Government Debt Rates');
}

export async function fetchGDPPerCapitaRates(): Promise<void> {
  // NY.GDP.PCAP.CD = GDP per capita (current US$)
  await fetchIndicator('NY.GDP.PCAP.CD', (iso, val, date) => {
    RateModel.upsertGDPPerCapitaRate({
      country_iso: iso,
      rate: val,
      source: 'worldbank',
      effective_date: date,
    });
  }, 'GDP Per Capita Rates');
}

export async function fetchTradeBalanceRates(): Promise<void> {
  // NE.TRD.GNFS.ZS = Trade (% of GDP)
  await fetchIndicator('NE.TRD.GNFS.ZS', (iso, val, date) => {
    RateModel.upsertTradeBalanceRate({
      country_iso: iso,
      rate: val,
      source: 'worldbank',
      effective_date: date,
    });
  }, 'Trade Balance Rates');
}

export async function fetchCurrentAccountRates(): Promise<void> {
  // BN.CAB.XOKA.GD.ZS = Current account balance (% of GDP)
  await fetchIndicator('BN.CAB.XOKA.GD.ZS', (iso, val, date) => {
    RateModel.upsertCurrentAccountRate({
      country_iso: iso,
      rate: val,
      source: 'worldbank',
      effective_date: date,
    });
  }, 'Current Account Rates');
}

export async function fetchFDIRates(): Promise<void> {
  // BX.KLT.DINV.WD.GD.ZS = Foreign direct investment, net inflows (% of GDP)
  await fetchIndicator('BX.KLT.DINV.WD.GD.ZS', (iso, val, date) => {
    RateModel.upsertFDIRate({
      country_iso: iso,
      rate: val,
      source: 'worldbank',
      effective_date: date,
    });
  }, 'FDI Rates');
}

export async function fetchPopulationGrowthRates(): Promise<void> {
  // SP.POP.GROW = Population growth (annual %)
  await fetchIndicator('SP.POP.GROW', (iso, val, date) => {
    RateModel.upsertPopulationGrowthRate({
      country_iso: iso,
      rate: val,
      source: 'worldbank',
      effective_date: date,
    });
  }, 'Population Growth Rates');
}

export async function fetchLifeExpectancyRates(): Promise<void> {
  // SP.DYN.LE00.IN = Life expectancy at birth, total (years)
  await fetchIndicator('SP.DYN.LE00.IN', (iso, val, date) => {
    RateModel.upsertLifeExpectancyRate({
      country_iso: iso,
      rate: val,
      source: 'worldbank',
      effective_date: date,
    });
  }, 'Life Expectancy Rates');
}

export async function fetchGiniCoefficientRates(): Promise<void> {
  // SI.POV.GINI = Gini coefficient
  await fetchIndicator('SI.POV.GINI', (iso, val, date) => {
    RateModel.upsertGiniCoefficientRate({
      country_iso: iso,
      rate: val,
      source: 'worldbank',
      effective_date: date,
    });
  }, 'Gini Coefficient Rates');
}

export async function fetchExportsRates(): Promise<void> {
  // NE.EXP.GNFS.ZS = Exports of goods and services (% of GDP)
  await fetchIndicator('NE.EXP.GNFS.ZS', (iso, val, date) => {
    RateModel.upsertExportsRate({
      country_iso: iso,
      rate: val,
      source: 'worldbank',
      effective_date: date,
    });
  }, 'Exports Rates');
}
