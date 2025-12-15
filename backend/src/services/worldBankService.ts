import axios from 'axios';
import { RateModel } from '../models/Rate';
import { CountryModel } from '../models/Country';

const WORLD_BANK_API_URL = process.env.WORLD_BANK_API_URL || 'https://api.worldbank.org/v2';

// World Bank country code mapping (ISO-3166-1 alpha-2 to World Bank codes)
// Most are the same, but some differ
const WB_COUNTRY_CODE_MAP: Record<string, string> = {
  // Add special mappings if needed
  // Most countries use same code
};

function getWorldBankCountryCode(isoCode: string): string {
  return WB_COUNTRY_CODE_MAP[isoCode] || isoCode;
}

export async function fetchInterestRates(): Promise<void> {
  try {
    console.log('Fetching interest rates from World Bank...');
    
    const countries = CountryModel.getAll();
    let successCount = 0;
    let errorCount = 0;

    // World Bank API: Interest rate indicator
    // FR.INR.RINR = Real interest rate
    // We'll use a batch approach - fetch for multiple countries
    const batchSize = 10;
    
    for (let i = 0; i < countries.length; i += batchSize) {
      const batch = countries.slice(i, i + batchSize);
      
      for (const country of batch) {
        try {
          const wbCode = getWorldBankCountryCode(country.iso_code);
          const url = `${WORLD_BANK_API_URL}/country/${wbCode}/indicator/FR.INR.RINR?format=json&per_page=1`;
          
          const response = await axios.get(url);
          const data = response.data;

          if (data && data[1] && data[1].length > 0) {
            const latest = data[1][0];
            const rate = parseFloat(latest.value);

            if (!isNaN(rate)) {
              RateModel.upsertInterestRate({
                country_iso: country.iso_code,
                rate: rate,
                source: 'worldbank',
                effective_date: latest.date || null,
              });
              successCount++;
            }
          }

          // Rate limiting: small delay between requests
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          errorCount++;
          console.warn(`Failed to fetch interest rate for ${country.iso_code}:`, error);
        }
      }
    }

    console.log(`Interest rates: ${successCount} successful, ${errorCount} errors`);
  } catch (error) {
    console.error('Error fetching interest rates:', error);
    throw error;
  }
}

export async function fetchInflationRates(): Promise<void> {
  try {
    console.log('Fetching inflation rates from World Bank...');
    
    const countries = CountryModel.getAll();
    let successCount = 0;
    let errorCount = 0;

    // World Bank API: Inflation indicator
    // FP.CPI.TOTL.ZG = Inflation, consumer prices (annual %)
    const batchSize = 10;
    
    for (let i = 0; i < countries.length; i += batchSize) {
      const batch = countries.slice(i, i + batchSize);
      
      for (const country of batch) {
        try {
          const wbCode = getWorldBankCountryCode(country.iso_code);
          const url = `${WORLD_BANK_API_URL}/country/${wbCode}/indicator/FP.CPI.TOTL.ZG?format=json&per_page=1`;
          
          const response = await axios.get(url);
          const data = response.data;

          if (data && data[1] && data[1].length > 0) {
            const latest = data[1][0];
            const rate = parseFloat(latest.value);

            if (!isNaN(rate)) {
              RateModel.upsertInflationRate({
                country_iso: country.iso_code,
                rate: rate,
                period: 'yearly',
                source: 'worldbank',
                effective_date: latest.date || null,
              });
              successCount++;
            }
          }

          // Rate limiting: small delay between requests
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          errorCount++;
          console.warn(`Failed to fetch inflation rate for ${country.iso_code}:`, error);
        }
      }
    }

    console.log(`Inflation rates: ${successCount} successful, ${errorCount} errors`);
  } catch (error) {
    console.error('Error fetching inflation rates:', error);
    throw error;
  }
}

