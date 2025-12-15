import { Router } from 'express';
import countriesRouter from './countries';
import ratesRouter from './rates';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

router.use('/countries', countriesRouter);
router.use('/rates', ratesRouter);

export default router;

