import http from 'node:http';
import { connectToDatabase, closeDatabase } from './config/db.js';
import { config } from './config/env.js';
import { handleCorsAndSecurity } from './middleware/corsMiddleware.js';
import { createApiRouter } from './routes/apiRoutes.js';
import { sendError } from './utils/response.js';

const apiRouter = createApiRouter();

const server = http.createServer(async (req, res) => {
  try {
    // 1. CORS Preflight & Security Headers
    const isOptionsHandled = handleCorsAndSecurity(req, res);
    if (isOptionsHandled) {
      return;
    }

    // 2. Dispatch to API Router
    await apiRouter.handle(req, res);
  } catch (err) {
    console.error('[Server] Critical Unhandled Request Error:', err);
    if (!res.writableEnded) {
      sendError(res, 'Internal Server Error', 500, err.message);
    }
  }
});

async function startServer() {
  try {
    // Connect to persistent MongoDB Community / Atlas deployment
    await connectToDatabase();

    server.listen(config.port, () => {
      console.log('='.repeat(65));
      console.log(`  VAULTLY — Personal Finance Tracker | Backend`);
      console.log(`  Architecture : Pure Node.js (node:http) — No Express`);
      console.log(`  Server URL   : http://localhost:${config.port}`);
      console.log(`  Client Origin: ${config.clientUrl}`);
      console.log(`  Database     : ${config.dbName} (Ready for Compass)`);
      console.log(`  Environment  : ${config.nodeEnv}`);
      console.log('='.repeat(65));
    });
  } catch (err) {
    console.error('[Server] Failed to initialize server:', err);
    process.exit(1);
  }
}

// Graceful shutdown handling
const shutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);
  server.close(async () => {
    await closeDatabase();
    console.log('[Server] Process terminated cleanly.');
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();

export { server };
