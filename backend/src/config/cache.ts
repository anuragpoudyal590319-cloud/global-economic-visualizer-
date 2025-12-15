import NodeCache from 'node-cache';

const cacheTTL = parseInt(process.env.CACHE_TTL || '3600', 10);

export const cache = new NodeCache({
  stdTTL: cacheTTL, // Time to live in seconds (default 1 hour)
  checkperiod: 600, // Check for expired keys every 10 minutes
  useClones: false, // Better performance
});

// Cache key generators
export const cacheKeys = {
  countries: 'countries:all',
  interestRates: 'rates:interest',
  inflationRates: 'rates:inflation',
  exchangeRates: 'rates:exchange',
};

