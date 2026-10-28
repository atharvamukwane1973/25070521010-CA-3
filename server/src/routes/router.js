import { URL } from 'node:url';
import { sendError } from '../utils/response.js';

const MAX_BODY_SIZE = 1024 * 1024; // 1 MB

export class Router {
  constructor() {
    this.routes = [];
  }

  add(method, pattern, ...handlers) {
    // Convert pattern like "/api/transactions/:id" into regex and extract param names
    const paramNames = [];
    const regexPattern = pattern.replace(/:([a-zA-Z0-9_]+)/g, (_, paramName) => {
      paramNames.push(paramName);
      return '([^/]+)';
    });

    const regex = new RegExp(`^${regexPattern}$`);
    this.routes.push({
      method: method.toUpperCase(),
      pattern,
      regex,
      paramNames,
      handlers,
    });
  }

  get(pattern, ...handlers) {
    this.add('GET', pattern, ...handlers);
  }

  post(pattern, ...handlers) {
    this.add('POST', pattern, ...handlers);
  }

  put(pattern, ...handlers) {
    this.add('PUT', pattern, ...handlers);
  }

  patch(pattern, ...handlers) {
    this.add('PATCH', pattern, ...handlers);
  }

  delete(pattern, ...handlers) {
    this.add('DELETE', pattern, ...handlers);
  }

  async handle(req, res) {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;

    // Attach parsed query parameters
    req.query = Object.fromEntries(parsedUrl.searchParams.entries());
    req.params = {};
    req.body = {};

    // Find matching route
    const match = this.routes.find((route) => {
      if (route.method !== req.method && route.method !== 'ALL') {
        return false;
      }
      const execResult = route.regex.exec(pathname);
      if (!execResult) return false;

      // Extract route parameters
      const params = {};
      route.paramNames.forEach((name, index) => {
        params[name] = decodeURIComponent(execResult[index + 1]);
      });
      req.params = params;
      return true;
    });

    if (!match) {
      return sendError(res, `Route not found: ${req.method} ${pathname}`, 404);
    }

    // Parse request body for methods that carry payloads
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      const parsed = await this._parseBody(req, res);
      if (!parsed) return; // Error already sent (e.g. 413 or 400)
    }

    // Execute handlers / middlewares in sequence
    try {
      for (const handler of match.handlers) {
        let proceed = false;
        // Handler can either return boolean (false to stop) or resolve
        const result = await handler(req, res);
        if (result === false) {
          return; // Middleware stopped request processing
        }
      }
    } catch (err) {
      console.error(`[Router] Unhandled error in ${req.method} ${pathname}:`, err);
      if (!res.writableEnded) {
        sendError(res, 'Internal Server Error', 500, err.message);
      }
    }
  }

  _parseBody(req, res) {
    return new Promise((resolve) => {
      let data = '';
      let size = 0;

      req.on('data', (chunk) => {
        size += chunk.length;
        if (size > MAX_BODY_SIZE) {
          sendError(res, 'Payload Too Large (Max 1MB allowed)', 413);
          req.destroy();
          resolve(false);
          return;
        }
        data += chunk;
      });

      req.on('end', () => {
        if (!data.trim()) {
          req.body = {};
          return resolve(true);
        }

        const contentType = req.headers['content-type'] || '';
        if (contentType.includes('application/json')) {
          try {
            req.body = JSON.parse(data);
            resolve(true);
          } catch (jsonErr) {
            sendError(res, 'Malformed JSON payload', 400, jsonErr.message);
            resolve(false);
          }
        } else {
          // Fallback or raw body
          req.body = { raw: data };
          resolve(true);
        }
      });

      req.on('error', (err) => {
        sendError(res, 'Request stream error', 400, err.message);
        resolve(false);
      });
    });
  }
}
