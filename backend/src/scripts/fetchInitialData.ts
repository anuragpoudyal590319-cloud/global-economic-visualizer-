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

  // Fetch Government Debt
  console.log('🏛️ Fetching Government Debt rates...');
  try {
    const { fetchGovernmentDebtRates } = await import('../services/worldBankService');
    await fetchGovernmentDebtRates();
    console.log('✅ Government Debt rates fetched\n');
  } catch (error) {
    console.error('❌ Error fetching Government Debt rates:', error);
  }

  // Fetch GDP Per Capita
  console.log('💰 Fetching GDP Per Capita rates...');
  try {
    const { fetchGDPPerCapitaRates } = await import('../services/worldBankService');
    await fetchGDPPerCapitaRates();
    console.log('✅ GDP Per Capita rates fetched\n');
  } catch (error) {
    console.error('❌ Error fetching GDP Per Capita rates:', error);
  }

  // Fetch Trade Balance
  console.log('📦 Fetching Trade Balance rates...');
  try {
    const { fetchTradeBalanceRates } = await import('../services/worldBankService');
    await fetchTradeBalanceRates();
    console.log('✅ Trade Balance rates fetched\n');
  } catch (error) {
    console.error('❌ Error fetching Trade Balance rates:', error);
  }

  // Fetch Current Account
  console.log('💳 Fetching Current Account rates...');
  try {
    const { fetchCurrentAccountRates } = await import('../services/worldBankService');
    await fetchCurrentAccountRates();
    console.log('✅ Current Account rates fetched\n');
  } catch (error) {
    console.error('❌ Error fetching Current Account rates:', error);
  }

  // Fetch FDI
  console.log('🌍 Fetching FDI rates...');
  try {
    const { fetchFDIRates } = await import('../services/worldBankService');
    await fetchFDIRates();
    console.log('✅ FDI rates fetched\n');
  } catch (error) {
    console.error('❌ Error fetching FDI rates:', error);
  }

  // Fetch Population Growth
  console.log('👥 Fetching Population Growth rates...');
  try {
    const { fetchPopulationGrowthRates } = await import('../services/worldBankService');
    await fetchPopulationGrowthRates();
    console.log('✅ Population Growth rates fetched\n');
  } catch (error) {
    console.error('❌ Error fetching Population Growth rates:', error);
  }

  // Fetch Life Expectancy
  console.log('❤️ Fetching Life Expectancy rates...');
  try {
    const { fetchLifeExpectancyRates } = await import('../services/worldBankService');
    await fetchLifeExpectancyRates();
    console.log('✅ Life Expectancy rates fetched\n');
  } catch (error) {
    console.error('❌ Error fetching Life Expectancy rates:', error);
  }

  // Fetch Gini Coefficient
  console.log('📊 Fetching Gini Coefficient rates...');
  try {
    const { fetchGiniCoefficientRates } = await import('../services/worldBankService');
    await fetchGiniCoefficientRates();
    console.log('✅ Gini Coefficient rates fetched\n');
  } catch (error) {
    console.error('❌ Error fetching Gini Coefficient rates:', error);
  }

  // Fetch Exports
  console.log('📦 Fetching Exports rates...');
  try {
    const { fetchExportsRates } = await import('../services/worldBankService');
    await fetchExportsRates();
    console.log('✅ Exports rates fetched\n');
  } catch (error) {
    console.error('❌ Error fetching Exports rates:', error);
  }

  // Summary
  const exchangeCount = (db as any).data.exchange_rates?.length || 0;
  const interestCount = (db as any).data.interest_rates?.length || 0;
  const inflationCount = (db as any).data.inflation_rates?.length || 0;
  const gdpCount = (db as any).data.gdp_growth_rates?.length || 0;
  const unemploymentCount = (db as any).data.unemployment_rates?.length || 0;
  const governmentDebtCount = (db as any).data.government_debt_rates?.length || 0;
  const gdpPerCapitaCount = (db as any).data.gdp_per_capita_rates?.length || 0;
  const tradeBalanceCount = (db as any).data.trade_balance_rates?.length || 0;
  const currentAccountCount = (db as any).data.current_account_rates?.length || 0;
  const fdiCount = (db as any).data.fdi_rates?.length || 0;
  const populationGrowthCount = (db as any).data.population_growth_rates?.length || 0;
  const lifeExpectancyCount = (db as any).data.life_expectancy_rates?.length || 0;
  const giniCoefficientCount = (db as any).data.gini_coefficient_rates?.length || 0;
  const exportsCount = (db as any).data.exports_rates?.length || 0;

  console.log('📊 Data Summary:');
  console.log(`   Countries: ${countries.length}`);
  console.log(`   Exchange Rates: ${exchangeCount}`);
  console.log(`   Interest Rates: ${interestCount}`);
  console.log(`   Inflation Rates: ${inflationCount}`);
  console.log(`   GDP Growth Rates: ${gdpCount}`);
  console.log(`   Unemployment Rates: ${unemploymentCount}`);
  console.log(`   Government Debt Rates: ${governmentDebtCount}`);
  console.log(`   GDP Per Capita Rates: ${gdpPerCapitaCount}`);
  console.log(`   Trade Balance Rates: ${tradeBalanceCount}`);
  console.log(`   Current Account Rates: ${currentAccountCount}`);
  console.log(`   FDI Rates: ${fdiCount}`);
  console.log(`   Population Growth Rates: ${populationGrowthCount}`);
  console.log(`   Life Expectancy Rates: ${lifeExpectancyCount}`);
  console.log(`   Gini Coefficient Rates: ${giniCoefficientCount}`);
  console.log(`   Exports Rates: ${exportsCount}`);
  console.log('\n✅ Initial data fetch complete!');
  console.log('🌐 Refresh your browser to see the data on the map!');

  process.exit(0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

