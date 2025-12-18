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
          console.log('   Starting interest rates fetch...');
          await fetchInterestRates();
          cache.del(cacheKeys.interestRates);
          console.log('✅ Interest rates updated');
        } catch (error) {
          console.error('❌ Error fetching interest rates:', error);
          console.error('   Continuing with other indicators...');
        }

        try {
          await fetchInflationRates();
          cache.del(cacheKeys.inflationRates);
          console.log('✅ Inflation rates updated');
        } catch (error) {
          console.error('❌ Error fetching inflation rates:', error);
        }

        try {
          await fetchGDPGrowthRates();
          cache.del(cacheKeys.gdpGrowthRates);
          console.log('✅ GDP growth updated');
        } catch (error) {
          console.error('❌ Error fetching GDP growth:', error);
        }

        await fetchUnemploymentRates();
        cache.del(cacheKeys.unemploymentRates);
        console.log('✅ Unemployment rates updated');

        await fetchGovernmentDebtRates();
        cache.del(cacheKeys.governmentDebtRates);
        console.log('✅ Government debt updated');

        await fetchGDPPerCapitaRates();
        cache.del(cacheKeys.gdpPerCapitaRates);
        console.log('✅ GDP per capita updated');

        await fetchTradeBalanceRates();
        cache.del(cacheKeys.tradeBalanceRates);
        console.log('✅ Trade balance updated');

        await fetchCurrentAccountRates();
        cache.del(cacheKeys.currentAccountRates);
        console.log('✅ Current account updated');

        await fetchFDIRates();
        cache.del(cacheKeys.fdiRates);
        console.log('✅ FDI updated');

        await fetchPopulationGrowthRates();
        cache.del(cacheKeys.populationGrowthRates);
        console.log('✅ Population growth updated');

        await fetchLifeExpectancyRates();
        cache.del(cacheKeys.lifeExpectancyRates);
        console.log('✅ Life expectancy updated');

        await fetchGiniCoefficientRates();
        cache.del(cacheKeys.giniCoefficientRates);
        console.log('✅ Gini coefficient updated');

        await fetchExportsRates();
        cache.del(cacheKeys.exportsRates);
        console.log('✅ Exports updated');

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

