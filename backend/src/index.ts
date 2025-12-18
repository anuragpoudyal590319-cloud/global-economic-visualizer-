import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database';
import { seedCountries } from './services/countrySeedService';
import routes from './routes';
import { apiLimiter } from './middleware/rateLimiter';
import './services/scheduler'; // Initialize cron jobs

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Trust proxy (required for Railway and other hosting platforms)
// This allows express-rate-limit to correctly identify client IPs
app.set('trust proxy', true);

// Middleware
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json());

// Apply general rate limiting to all API routes
app.use('/api', apiLimiter);

// Initialize database
initializeDatabase();

// Seed countries if database is empty
import { db } from './config/database';
const countries = db.prepare('SELECT * FROM countries').all() as any[];
if (countries.length === 0) {
  console.log('Database is empty, seeding countries...');
  seedCountries();
}

// Routes
app.use('/api', routes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
});

