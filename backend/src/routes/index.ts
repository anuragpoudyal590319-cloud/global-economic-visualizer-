import { Router } from 'express';
import countriesRouter from './countries';
import ratesRouter from './rates';
import { aiRequestQueue } from '../utils/requestQueue';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    queue: aiRequestQueue.getStatus()
  });
});

// Manual data fetch trigger endpoint
router.post('/fetch-data', async (req, res) => {
  try {
    // Run data fetching in background (don't block response)
    setImmediate(async () => {
      try {
        console.log('🚀 Manual data fetch triggered via API...');
        
        const { fetchExchangeRates } = await import('../services/exchangeRateService');
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
        } = await import('../services/worldBankService');
        const { cache, cacheKeys } = await import('../config/cache');

        // Fetch exchange rates (fastest)
        console.log('💱 Fetching exchange rates...');
        await fetchExchangeRates();
        cache.del(cacheKeys.exchangeRates);
        console.log('✅ Exchange rates updated');

        // Fetch all World Bank indicators sequentially
        console.log('📈 Fetching World Bank indicators...');
        console.log('   This will take 10-15 minutes due to World Bank API rate limits.');
        console.log('   Progress will be logged as each indicator completes.');
        
        try {
          console.log('   [1/13] Starting interest rates fetch...');
          const startTime = Date.now();
          await fetchInterestRates();
          const duration = ((Date.now() - startTime) / 1000).toFixed(1);
          cache.del(cacheKeys.interestRates);
          console.log(`✅ [1/13] Interest rates updated (took ${duration}s)`);
        } catch (error: any) {
          console.error('❌ [1/13] Error fetching interest rates:', error?.message || error);
          console.error('   Error details:', error);
          console.error('   Continuing with other indicators...');
        }

        try {
          console.log('   [2/13] Starting inflation rates fetch...');
          const startTime = Date.now();
          await fetchInflationRates();
          const duration = ((Date.now() - startTime) / 1000).toFixed(1);
          cache.del(cacheKeys.inflationRates);
          console.log(`✅ [2/13] Inflation rates updated (took ${duration}s)`);
        } catch (error: any) {
          console.error('❌ [2/13] Error fetching inflation rates:', error?.message || error);
        }

        try {
          console.log('   [3/13] Starting GDP growth fetch...');
          const startTime = Date.now();
          await fetchGDPGrowthRates();
          const duration = ((Date.now() - startTime) / 1000).toFixed(1);
          cache.del(cacheKeys.gdpGrowthRates);
          console.log(`✅ [3/13] GDP growth updated (took ${duration}s)`);
        } catch (error: any) {
          console.error('❌ [3/13] Error fetching GDP growth:', error?.message || error);
        }

        try {
          console.log('   [4/13] Starting unemployment rates fetch...');
          const startTime = Date.now();
          await fetchUnemploymentRates();
          const duration = ((Date.now() - startTime) / 1000).toFixed(1);
          cache.del(cacheKeys.unemploymentRates);
          console.log(`✅ [4/13] Unemployment rates updated (took ${duration}s)`);
        } catch (error: any) {
          console.error('❌ [4/13] Error fetching unemployment rates:', error?.message || error);
        }

        try {
          console.log('   [5/13] Starting government debt fetch...');
          const startTime = Date.now();
          await fetchGovernmentDebtRates();
          const duration = ((Date.now() - startTime) / 1000).toFixed(1);
          cache.del(cacheKeys.governmentDebtRates);
          console.log(`✅ [5/13] Government debt updated (took ${duration}s)`);
        } catch (error: any) {
          console.error('❌ [5/13] Error fetching government debt:', error?.message || error);
        }

        try {
          console.log('   [6/13] Starting GDP per capita fetch...');
          const startTime = Date.now();
          await fetchGDPPerCapitaRates();
          const duration = ((Date.now() - startTime) / 1000).toFixed(1);
          cache.del(cacheKeys.gdpPerCapitaRates);
          console.log(`✅ [6/13] GDP per capita updated (took ${duration}s)`);
        } catch (error: any) {
          console.error('❌ [6/13] Error fetching GDP per capita:', error?.message || error);
        }

        try {
          console.log('   [7/13] Starting trade balance fetch...');
          const startTime = Date.now();
          await fetchTradeBalanceRates();
          const duration = ((Date.now() - startTime) / 1000).toFixed(1);
          cache.del(cacheKeys.tradeBalanceRates);
          console.log(`✅ [7/13] Trade balance updated (took ${duration}s)`);
        } catch (error: any) {
          console.error('❌ [7/13] Error fetching trade balance:', error?.message || error);
        }

        try {
          console.log('   [8/13] Starting current account fetch...');
          const startTime = Date.now();
          await fetchCurrentAccountRates();
          const duration = ((Date.now() - startTime) / 1000).toFixed(1);
          cache.del(cacheKeys.currentAccountRates);
          console.log(`✅ [8/13] Current account updated (took ${duration}s)`);
        } catch (error: any) {
          console.error('❌ [8/13] Error fetching current account:', error?.message || error);
        }

        try {
          console.log('   [9/13] Starting FDI fetch...');
          const startTime = Date.now();
          await fetchFDIRates();
          const duration = ((Date.now() - startTime) / 1000).toFixed(1);
          cache.del(cacheKeys.fdiRates);
          console.log(`✅ [9/13] FDI updated (took ${duration}s)`);
        } catch (error: any) {
          console.error('❌ [9/13] Error fetching FDI:', error?.message || error);
        }

        try {
          console.log('   [10/13] Starting population growth fetch...');
          const startTime = Date.now();
          await fetchPopulationGrowthRates();
          const duration = ((Date.now() - startTime) / 1000).toFixed(1);
          cache.del(cacheKeys.populationGrowthRates);
          console.log(`✅ [10/13] Population growth updated (took ${duration}s)`);
        } catch (error: any) {
          console.error('❌ [10/13] Error fetching population growth:', error?.message || error);
        }

        try {
          console.log('   [11/13] Starting life expectancy fetch...');
          const startTime = Date.now();
          await fetchLifeExpectancyRates();
          const duration = ((Date.now() - startTime) / 1000).toFixed(1);
          cache.del(cacheKeys.lifeExpectancyRates);
          console.log(`✅ [11/13] Life expectancy updated (took ${duration}s)`);
        } catch (error: any) {
          console.error('❌ [11/13] Error fetching life expectancy:', error?.message || error);
        }

        try {
          console.log('   [12/13] Starting Gini coefficient fetch...');
          const startTime = Date.now();
          await fetchGiniCoefficientRates();
          const duration = ((Date.now() - startTime) / 1000).toFixed(1);
          cache.del(cacheKeys.giniCoefficientRates);
          console.log(`✅ [12/13] Gini coefficient updated (took ${duration}s)`);
        } catch (error: any) {
          console.error('❌ [12/13] Error fetching Gini coefficient:', error?.message || error);
        }

        try {
          console.log('   [13/13] Starting exports fetch...');
          const startTime = Date.now();
          await fetchExportsRates();
          const duration = ((Date.now() - startTime) / 1000).toFixed(1);
          cache.del(cacheKeys.exportsRates);
          console.log(`✅ [13/13] Exports updated (took ${duration}s)`);
        } catch (error: any) {
          console.error('❌ [13/13] Error fetching exports:', error?.message || error);
        }

        console.log('✅ All data fetch complete!');
      } catch (error) {
        console.error('❌ Error during data fetch:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      }
    });

    res.json({ 
      message: 'Data fetch started in background. This may take 10-15 minutes.',
      status: 'processing'
    });
  } catch (error: any) {
    console.error('Error triggering data fetch:', error);
    res.status(500).json({ error: error.message || 'Failed to trigger data fetch' });
  }
});

router.use('/countries', countriesRouter);
router.use('/rates', ratesRouter);

export default router;

