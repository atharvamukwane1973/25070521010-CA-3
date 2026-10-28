import { config } from '../config/env.js';

export function handleCorsAndSecurity(req, res) {
  const origin = req.headers.origin;

  // Allow configured client URL or local Vite dev URLs
  const allowedOrigins = [
    config.clientUrl,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
  ];

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-CSRF-Token, X-Requested-With'
  );
  res.setHeader('Access-Control-Max-Age', '86400');

  // Modern HTTP Security Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Preflight handling
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return true; // handled
  }

  return false;
}
