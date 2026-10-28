import { sendError } from '../utils/response.js';

// In-memory bucket store for IP rate limiting
const ipHits = new Map();

// Periodic cleanup of expired window buckets every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of ipHits.entries()) {
    if (now > record.resetTime) {
      ipHits.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

export function rateLimiter({ max = 300, windowMs = 15 * 60 * 1000, keyPrefix = 'general' } = {}) {
  return function checkRateLimit(req, res) {
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'unknown-ip';

    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();
    let record = ipHits.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      ipHits.set(key, record);
      return true; // allowed
    }

    record.count += 1;

    if (record.count > max) {
      const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      sendError(res, 'Too many requests. Please try again later.', 429, {
        retryAfter: retryAfterSec,
      });
      return false; // blocked
    }

    return true; // allowed
  };
}

export const authRateLimiter = rateLimiter({
  max: 30, // 30 attempts per 15 min per IP for auth
  windowMs: 15 * 60 * 1000,
  keyPrefix: 'auth',
});

export const generalRateLimiter = rateLimiter({
  max: 600, // 600 requests per 15 min
  windowMs: 15 * 60 * 1000,
  keyPrefix: 'api',
});
