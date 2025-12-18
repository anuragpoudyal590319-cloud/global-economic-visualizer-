/**
 * Startup data check - automatically fetches data if database is empty
 * This ensures data is populated on first deployment without manual intervention
 */

import { db } from '../config/database';
import { fetchExchangeRates } from './exchangeRateService';
import { 
  fetchInterestRates, 
  fetchInflationRates,
  fetchGDPGrowthRates,
  fetchUnemploymentRates,
  fetchGovernmentDebtRates,
  fetchGDPPerCapitaRates,
  fetchTradeBalanceRates,
  fetchCurrentAccountRates,
  fetchFDIRates,
  fetchPopulationGrowthRates,
  fetchLifeExpectancyRates,
  fetchGiniCoefficientRates,
  fetchExportsRates
} from './worldBankService';
import { cache, cacheKeys } from '../config/cache';

/**
 * Check if we have sufficient data, and fetch if missing
 * This runs on server startup to ensure data is available
 */
export async function checkAndFetchDataOnStartup(): Promise<void> {
  try {
    const data = (db as any).data;
    
    // Check if we have any economic data
    const hasExchangeRates = data.exchange_rates && data.exchange_rates.length > 0;
    const hasInterestRates = data.interest_rates && data.interest_rates.length > 0;
    const hasInflationRates = data.inflation_rates && data.inflation_rates.length > 0;
    
    // If we have at least exchange rates and one other indicator, we're good
    const hasData = hasExchangeRates && (hasInterestRates || hasInflationRates);
    
    if (hasData) {
      console.log('✅ Database has data, skipping initial fetch');
      console.log(`   Exchange rates: ${data.exchange_rates?.length || 0} records`);
      console.log(`   Interest rates: ${data.interest_rates?.length || 0} records`);
      console.log(`   Inflation rates: ${data.inflation_rates?.length || 0} records`);
      return;
    }
    
    console.log('📊 Database is empty or missing data, starting initial fetch...');
    console.log('   This will take 10-15 minutes. The server will continue serving requests.');
    
    // Run in background (don't block server startup)
    setImmediate(async () => {
      try {
        await fetchAllData();
        console.log('✅ Initial data fetch completed successfully!');
      } catch (error) {
        console.error('❌ Error during initial data fetch:', error);
        console.error('   Data will be fetched by scheduled jobs or manual trigger');
      }
    });
  } catch (error) {
    console.error('Error checking startup data:', error);
  }
}

/**
 * Fetch all economic indicators
 */
async function fetchAllData(): Promise<void> {
  // Fetch exchange rates (fastest)
  console.log('💱 [Startup] Fetching exchange rates...');
  try {
    await fetchExchangeRates();
    cache.del(cacheKeys.exchangeRates);
    console.log('✅ [Startup] Exchange rates updated');
  } catch (error) {
    console.error('❌ [Startup] Error fetching exchange rates:', error);
  }

  // Fetch all World Bank indicators sequentially
  console.log('📈 [Startup] Fetching World Bank indicators...');
  console.log('   This will take 10-15 minutes due to World Bank API rate limits.');
  
  const indicators = [
    { name: 'Interest Rates', fetch: fetchInterestRates, cacheKey: cacheKeys.interestRates },
    { name: 'Inflation Rates', fetch: fetchInflationRates, cacheKey: cacheKeys.inflationRates },
    { name: 'GDP Growth', fetch: fetchGDPGrowthRates, cacheKey: cacheKeys.gdpGrowthRates },
    { name: 'Unemployment', fetch: fetchUnemploymentRates, cacheKey: cacheKeys.unemploymentRates },
    { name: 'Government Debt', fetch: fetchGovernmentDebtRates, cacheKey: cacheKeys.governmentDebtRates },
    { name: 'GDP Per Capita', fetch: fetchGDPPerCapitaRates, cacheKey: cacheKeys.gdpPerCapitaRates },
    { name: 'Trade Balance', fetch: fetchTradeBalanceRates, cacheKey: cacheKeys.tradeBalanceRates },
    { name: 'Current Account', fetch: fetchCurrentAccountRates, cacheKey: cacheKeys.currentAccountRates },
    { name: 'FDI', fetch: fetchFDIRates, cacheKey: cacheKeys.fdiRates },
    { name: 'Population Growth', fetch: fetchPopulationGrowthRates, cacheKey: cacheKeys.populationGrowthRates },
    { name: 'Life Expectancy', fetch: fetchLifeExpectancyRates, cacheKey: cacheKeys.lifeExpectancyRates },
    { name: 'Gini Coefficient', fetch: fetchGiniCoefficientRates, cacheKey: cacheKeys.giniCoefficientRates },
    { name: 'Exports', fetch: fetchExportsRates, cacheKey: cacheKeys.exportsRates },
  ];

  for (let i = 0; i < indicators.length; i++) {
    const { name, fetch, cacheKey } = indicators[i];
    try {
      console.log(`   [${i + 1}/${indicators.length}] Fetching ${name}...`);
      const startTime = Date.now();
      await fetch();
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      cache.del(cacheKey);
      console.log(`✅ [${i + 1}/${indicators.length}] ${name} updated (took ${duration}s)`);
    } catch (error: any) {
      console.error(`❌ [${i + 1}/${indicators.length}] Error fetching ${name}:`, error?.message || error);
      // Continue with other indicators even if one fails
    }
  }

  console.log('✅ [Startup] All data fetch complete!');
}

