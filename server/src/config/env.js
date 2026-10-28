import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/personal_finance_tracker',
  dbName: process.env.DB_NAME || 'personal_finance_tracker',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  sessionCookieName: process.env.SESSION_COOKIE_NAME || 'vaultly_session',
  sessionSecret: process.env.SESSION_SECRET || 'vaultly_dev_secret_key_25070521010_secure',
  sessionTtlDays: 14,
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback',
    isConfigured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  },
};
