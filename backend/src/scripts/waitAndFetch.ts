import axios from 'axios';

const WORLD_BANK_API_URL = 'https://api.worldbank.org/v2';
const CHECK_INTERVAL = 30000; // Check every 30 seconds
const MAX_ATTEMPTS = 120; // Try for up to 1 hour (120 * 30s)

async function checkWorldBankAPI(): Promise<boolean> {
  try {
    const response = await axios.get(
      `${WORLD_BANK_API_URL}/country/US/indicator/NY.GDP.MKTP.KD.ZG?format=json&per_page=1`,
      { timeout: 5000 }
    );
    
    if (response.status === 200 && Array.isArray(response.data) && response.data.length > 1) {
      return true;
    }
    return false;
  } catch (error: any) {
    if (error.response?.status === 502 || error.code === 'ECONNREFUSED') {
      return false;
    }
    // Other errors might be OK (like 404 for specific country)
    return true;
  }
}

async function waitForAPI() {
  console.log('⏳ Waiting for World Bank API to recover...');
  console.log(`   Checking every ${CHECK_INTERVAL / 1000} seconds (max ${MAX_ATTEMPTS} attempts)\n`);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const isUp = await checkWorldBankAPI();
    
    if (isUp) {
      console.log(`✅ World Bank API is back online! (attempt ${attempt})\n`);
      return true;
    }
    
    if (attempt % 4 === 0) {
      // Log every 2 minutes
      const minutes = (attempt * CHECK_INTERVAL) / 60000;
      console.log(`   Still waiting... (${minutes.toFixed(1)} minutes elapsed, attempt ${attempt}/${MAX_ATTEMPTS})`);
    }
    
    await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
  }
  
  console.log('❌ World Bank API did not recover within the timeout period.');
  return false;
}

async function main() {
  const apiRecovered = await waitForAPI();
  
  if (apiRecovered) {
    console.log('🚀 Starting data fetch...\n');
    // Import and run the fetch script
    const { exec } = require('child_process');
    exec('npm run fetch-data', { cwd: process.cwd() }, (error: any, stdout: string, stderr: string) => {
      if (error) {
        console.error('Error running fetch-data:', error);
        process.exit(1);
      }
      console.log(stdout);
      if (stderr) console.error(stderr);
    });
  } else {
    console.log('\n💡 You can manually run: npm run fetch-data');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

