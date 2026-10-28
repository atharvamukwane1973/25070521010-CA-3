import { config } from '../config/env.js';

/**
 * Standard JSON response helper for pure node:http
 */
export function sendJson(res, statusCode, payload, extraHeaders = {}) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    ...extraHeaders,
  });
  res.end(body);
}

export function sendSuccess(res, data = null, message = 'Success', statusCode = 200, extraHeaders = {}) {
  return sendJson(
    res,
    statusCode,
    {
      success: true,
      message,
      data,
    },
    extraHeaders
  );
}

export function sendError(res, message = 'Internal Server Error', statusCode = 500, details = null) {
  const payload = {
    success: false,
    error: message,
  };

  if (details !== null && details !== undefined) {
    payload.details = details;
  }

  return sendJson(res, statusCode, payload);
}

/**
 * Parse incoming HTTP Cookie header
 */
export function parseCookies(req) {
  const list = {};
  const rc = req.headers.cookie;

  if (rc) {
    rc.split(';').forEach((cookie) => {
      const parts = cookie.split('=');
      const key = parts.shift().trim();
      const value = decodeURIComponent(parts.join('='));
      list[key] = value;
    });
  }

  return list;
}

/**
 * Set an HTTP-Only session cookie
 */
export function setSessionCookie(res, token, days = config.sessionTtlDays) {
  const maxAgeSeconds = days * 24 * 60 * 60;
  const isProd = config.nodeEnv === 'production';
  const sameSite = isProd ? 'None' : 'Lax';
  const secure = isProd ? '; Secure' : '';

  const cookie = `${config.sessionCookieName}=${encodeURIComponent(
    token
  )}; Max-Age=${maxAgeSeconds}; Path=/; HttpOnly; SameSite=${sameSite}${secure}`;

  const currentCookies = res.getHeader('Set-Cookie') || [];
  const cookieList = Array.isArray(currentCookies) ? currentCookies : [currentCookies];
  res.setHeader('Set-Cookie', [...cookieList, cookie]);
}

/**
 * Clear the HTTP-Only session cookie
 */
export function clearSessionCookie(res) {
  const isProd = config.nodeEnv === 'production';
  const sameSite = isProd ? 'None' : 'Lax';
  const secure = isProd ? '; Secure' : '';

  const cookie = `${config.sessionCookieName}=; Max-Age=0; Path=/; HttpOnly; SameSite=${sameSite}${secure}`;
  const currentCookies = res.getHeader('Set-Cookie') || [];
  const cookieList = Array.isArray(currentCookies) ? currentCookies : [currentCookies];
  res.setHeader('Set-Cookie', [...cookieList, cookie]);
}
