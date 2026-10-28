import { ObjectId } from 'mongodb';
import { getDb } from '../config/db.js';
import { config } from '../config/env.js';
import { hashToken } from '../utils/crypto.js';
import { parseCookies, sendError } from '../utils/response.js';

export async function authenticateSession(req) {
  const cookies = parseCookies(req);
  let sessionToken = cookies[config.sessionCookieName];

  // Allow Bearer token in Authorization header for API flexibility
  if (!sessionToken && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
      sessionToken = parts[1];
    }
  }

  if (!sessionToken) {
    return null;
  }

  const tokenHash = hashToken(sessionToken);
  const db = getDb();

  const session = await db.collection('sessions').findOne({
    tokenHash,
    expiresAt: { $gt: new Date() },
  });

  if (!session) {
    return null;
  }

  const user = await db.collection('users').findOne(
    { _id: new ObjectId(session.userId) },
    {
      projection: {
        passwordHash: 0,
        passwordSalt: 0,
      },
    }
  );

  if (!user) {
    return null;
  }

  return { user, session };
}

/**
 * Enforces authenticated session; returns false and sends 401 if missing/invalid
 */
export async function requireAuth(req, res) {
  try {
    const auth = await authenticateSession(req);
    if (!auth) {
      sendError(res, 'Authentication required. Please sign in.', 401);
      return false;
    }

    req.user = auth.user;
    req.session = auth.session;
    return true;
  } catch (err) {
    console.error('[AuthMiddleware] Error:', err);
    sendError(res, 'Authentication verification error', 500);
    return false;
  }
}

/**
 * Optional authentication (populates req.user if session present, but never blocks)
 */
export async function optionalAuth(req) {
  try {
    const auth = await authenticateSession(req);
    if (auth) {
      req.user = auth.user;
      req.session = auth.session;
    }
  } catch {
    // ignore
  }
}
