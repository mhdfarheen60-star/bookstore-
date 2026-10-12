import rateLimit from 'express-rate-limit';

// A standard JSON 429 so the API client surfaces a readable message.
const handler = (req, res) => {
  res.status(429).json({
    success: false,
    message: 'Too many requests. Please wait a moment and try again.',
  });
};

// Keep limits generous outside production so local development and the seed/test
// flows are not tripped up by repeated sign-ins.
const isDev = process.env.NODE_ENV !== 'production';

// Tight limit on credential endpoints to slow down brute-force attempts.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 500 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

// Generous limit for the rest of the API, mainly to blunt scraping.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 5000 : 600,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

// The dashboard runs several aggregation pipelines, so keep it calmer.
export const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isDev ? 600 : 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

export default apiLimiter;
