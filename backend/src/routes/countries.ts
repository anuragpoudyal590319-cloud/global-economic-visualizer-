import { Router } from 'express';
import { CountryModel } from '../models/Country';
import { cache, cacheKeys } from '../config/cache';

const router = Router();

router.get('/', (req, res) => {
  try {
    // Check cache first
    const cached = cache.get(cacheKeys.countries);
    if (cached) {
      return res.json(cached);
    }

    // Fetch from database
    const countries = CountryModel.getAll();
    
    // Cache the result
    cache.set(cacheKeys.countries, countries);
    
    res.json(countries);
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
});

export default router;

