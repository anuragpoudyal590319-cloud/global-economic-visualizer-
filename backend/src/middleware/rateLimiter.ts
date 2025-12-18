import rateLimit from 'express-rate-limit';

// General API rate limiter - 100 requests per 15 minutes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// AI analysis rate limiter - 5 requests per hour (more restrictive)
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 AI analysis requests per hour
  message: {
    error: 'Too many AI analysis requests. Please try again in an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for data fetching endpoints - 200 requests per 15 minutes
export const dataLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Higher limit for data endpoints (they're cached)
  message: {
    error: 'Too many data requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

