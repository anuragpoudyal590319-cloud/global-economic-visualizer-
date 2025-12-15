import cron from 'node-cron';
import { fetchExchangeRates } from './exchangeRateService';
import { fetchInterestRates, fetchInflationRates } from './worldBankService';
import { cache, cacheKeys } from '../config/cache';

// Daily at 2 AM UTC - Exchange rates
cron.schedule('0 2 * * *', async () => {
  console.log('Running scheduled exchange rates update...');
  try {
    await fetchExchangeRates();
    // Invalidate cache
    cache.del(cacheKeys.exchangeRates);
    console.log('Exchange rates updated successfully');
  } catch (error) {
    console.error('Error in scheduled exchange rates update:', error);
  }
});

// Weekly on Monday at 3 AM UTC - Interest rates
cron.schedule('0 3 * * 1', async () => {
  console.log('Running scheduled interest rates update...');
  try {
    await fetchInterestRates();
    // Invalidate cache
    cache.del(cacheKeys.interestRates);
    console.log('Interest rates updated successfully');
  } catch (error) {
    console.error('Error in scheduled interest rates update:', error);
  }
});

// Monthly on 1st at 4 AM UTC - Inflation rates
cron.schedule('0 4 1 * *', async () => {
  console.log('Running scheduled inflation rates update...');
  try {
    await fetchInflationRates();
    // Invalidate cache
    cache.del(cacheKeys.inflationRates);
    console.log('Inflation rates updated successfully');
  } catch (error) {
    console.error('Error in scheduled inflation rates update:', error);
  }
});

console.log('Scheduler initialized');

