import cron from 'node-cron';
import { fetchExchangeRates } from './exchangeRateService';
import { fetchInterestRates, fetchInflationRates } from './worldBankService';
import { cache, cacheKeys } from '../config/cache';
import { acquireLock, releaseLock } from '../utils/schedulerLock';

// Exchange rates: Every 6 hours (they change frequently)
// World Bank recommends: Exchange rates should be updated multiple times per day
cron.schedule('0 */6 * * *', async () => {
  if (!(await acquireLock())) {
    console.log('Exchange rates update already running on another instance');
    return;
  }

  console.log('Running scheduled exchange rates update...');
  try {
    await fetchExchangeRates();
    // Invalidate cache
    cache.del(cacheKeys.exchangeRates);
    console.log('Exchange rates updated successfully');
  } catch (error) {
    console.error('Error in scheduled exchange rates update:', error);
  } finally {
    releaseLock();
  }
});

// World Bank data: Updated monthly (they typically update quarterly, but we check monthly)
// All World Bank indicators updated on the 1st of each month at 3 AM UTC
// This follows World Bank's update schedule (data typically released quarterly)
cron.schedule('0 3 1 * *', async () => {
  if (!(await acquireLock())) {
    console.log('World Bank data update already running on another instance');
    return;
  }

  console.log('Running scheduled World Bank data update (all indicators)...');
  try {
    const { 
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
    } = await import('./worldBankService');

    // Run fetches sequentially to respect API rate limits
    await fetchInterestRates();
    cache.del(cacheKeys.interestRates);
    console.log('Interest rates updated');

    await fetchInflationRates();
    cache.del(cacheKeys.inflationRates);
    console.log('Inflation rates updated');

    await fetchGDPGrowthRates();
    cache.del(cacheKeys.gdpGrowthRates);
    console.log('GDP growth updated');

    await fetchUnemploymentRates();
    cache.del(cacheKeys.unemploymentRates);
    console.log('Unemployment rates updated');

    await fetchGovernmentDebtRates();
    cache.del(cacheKeys.governmentDebtRates);
    console.log('Government debt updated');

    await fetchGDPPerCapitaRates();
    cache.del(cacheKeys.gdpPerCapitaRates);
    console.log('GDP per capita updated');

    await fetchTradeBalanceRates();
    cache.del(cacheKeys.tradeBalanceRates);
    console.log('Trade balance updated');

    await fetchCurrentAccountRates();
    cache.del(cacheKeys.currentAccountRates);
    console.log('Current account updated');

    await fetchFDIRates();
    cache.del(cacheKeys.fdiRates);
    console.log('FDI updated');

    await fetchPopulationGrowthRates();
    cache.del(cacheKeys.populationGrowthRates);
    console.log('Population growth updated');

    await fetchLifeExpectancyRates();
    cache.del(cacheKeys.lifeExpectancyRates);
    console.log('Life expectancy updated');

    await fetchGiniCoefficientRates();
    cache.del(cacheKeys.giniCoefficientRates);
    console.log('Gini coefficient updated');

    await fetchExportsRates();
    cache.del(cacheKeys.exportsRates);
    console.log('Exports updated');

    console.log('All World Bank indicators updated successfully');
  } catch (error) {
    console.error('Error in scheduled World Bank update:', error);
  } finally {
    releaseLock();
  }
});

console.log('Scheduler initialized');

