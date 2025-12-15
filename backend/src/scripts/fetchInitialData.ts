import { initializeDatabase } from '../config/database';
import { seedCountries } from '../services/countrySeedService';
import { fetchExchangeRates } from '../services/exchangeRateService';
import { fetchInterestRates, fetchInflationRates } from '../services/worldBankService';
import { db } from '../config/database';

async function main() {
  console.log('🚀 Starting initial data fetch...\n');

  // Initialize database
  console.log('📊 Initializing database...');
  initializeDatabase();

  // Check if countries exist
  const countries = (db as any).data.countries || [];
  if (countries.length === 0) {
    console.log('🌍 Seeding countries...');
    seedCountries();
    console.log('✅ Countries seeded\n');
  } else {
    console.log(`✅ ${countries.length} countries already exist\n`);
  }

  // Fetch exchange rates (fastest - single API call)
  console.log('💱 Fetching exchange rates...');
  try {
    await fetchExchangeRates();
    console.log('✅ Exchange rates fetched\n');
  } catch (error) {
    console.error('❌ Error fetching exchange rates:', error);
  }

  // Fetch interest rates (slower - country by country)
  console.log('📈 Fetching interest rates (this may take 5-10 minutes)...');
  console.log('   (World Bank API has rate limits, so we fetch slowly)');
  try {
    await fetchInterestRates();
    console.log('✅ Interest rates fetched\n');
  } catch (error) {
    console.error('❌ Error fetching interest rates:', error);
  }

  // Fetch inflation rates (slower - country by country)
  console.log('📊 Fetching inflation rates (this may take 5-10 minutes)...');
  console.log('   (World Bank API has rate limits, so we fetch slowly)');
  try {
    await fetchInflationRates();
    console.log('✅ Inflation rates fetched\n');
  } catch (error) {
    console.error('❌ Error fetching inflation rates:', error);
  }

  // Fetch GDP Growth
  console.log('📈 Fetching GDP Growth rates...');
  try {
    const { fetchGDPGrowthRates } = await import('../services/worldBankService');
    await fetchGDPGrowthRates();
    console.log('✅ GDP Growth rates fetched\n');
  } catch (error) {
    console.error('❌ Error fetching GDP Growth rates:', error);
  }

  // Fetch Unemployment
  console.log('📉 Fetching Unemployment rates...');
  try {
    const { fetchUnemploymentRates } = await import('../services/worldBankService');
    await fetchUnemploymentRates();
    console.log('✅ Unemployment rates fetched\n');
  } catch (error) {
    console.error('❌ Error fetching Unemployment rates:', error);
  }

  // Summary
  const exchangeCount = (db as any).data.exchange_rates?.length || 0;
  const interestCount = (db as any).data.interest_rates?.length || 0;
  const inflationCount = (db as any).data.inflation_rates?.length || 0;
  const gdpCount = (db as any).data.gdp_growth_rates?.length || 0;
  const unemploymentCount = (db as any).data.unemployment_rates?.length || 0;

  console.log('📊 Data Summary:');
  console.log(`   Countries: ${countries.length}`);
  console.log(`   Exchange Rates: ${exchangeCount}`);
  console.log(`   Interest Rates: ${interestCount}`);
  console.log(`   Inflation Rates: ${inflationCount}`);
  console.log(`   GDP Growth Rates: ${gdpCount}`);
  console.log(`   Unemployment Rates: ${unemploymentCount}`);
  console.log('\n✅ Initial data fetch complete!');
  console.log('🌐 Refresh your browser to see the data on the map!');

  process.exit(0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

