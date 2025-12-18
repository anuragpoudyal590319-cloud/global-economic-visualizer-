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

router.use('/countries', countriesRouter);
router.use('/rates', ratesRouter);

export default router;

