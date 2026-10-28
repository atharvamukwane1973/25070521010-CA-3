import { sendError } from '../utils/response.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Validates CSRF token on state-changing requests when a session is active.
 */
export function validateCsrf(req, res) {
  if (SAFE_METHODS.has(req.method)) {
    return true;
  }

  // If the route has an active session, enforce CSRF token header
  if (req.session && req.session.csrfToken) {
    const headerToken = req.headers['x-csrf-token'];
    if (!headerToken || headerToken !== req.session.csrfToken) {
      sendError(res, 'Invalid or missing CSRF token', 403);
      return false;
    }
  }

  return true;
}
