import { MongoClient } from 'mongodb';
import { config } from './env.js';

let client = null;
let db = null;

export async function connectToDatabase() {
  if (db) return db;

  try {
    client = new MongoClient(config.mongoUri, {
      maxPoolSize: 20,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
    });

    await client.connect();
    db = client.db(config.dbName);
    console.log(`[Database] Connected successfully to MongoDB at ${config.mongoUri.split('@').pop()}`);
    console.log(`[Database] Active database: "${config.dbName}" (Inspectable via MongoDB Compass)`);

    await initializeIndexes(db);
    return db;
  } catch (error) {
    console.error('[Database] Connection failed:', error.message);
    throw error;
  }
}

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call connectToDatabase first.');
  }
  return db;
}

export function getClient() {
  return client;
}

export async function closeDatabase() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('[Database] Connection closed.');
  }
}

async function initializeIndexes(database) {
  try {
    const users = database.collection('users');
    await users.createIndex({ emailNormalized: 1 }, { unique: true });

    const sessions = database.collection('sessions');
    await sessions.createIndex({ tokenHash: 1 }, { unique: true });
    await sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // MongoDB TTL auto-cleanup

    const accounts = database.collection('accounts');
    await accounts.createIndex({ ownerId: 1, createdAt: -1 });

    const categories = database.collection('categories');
    await categories.createIndex({ ownerId: 1, name: 1 });

    const transactions = database.collection('transactions');
    await transactions.createIndex({ ownerId: 1, date: -1 });
    await transactions.createIndex({ ownerId: 1, type: 1 });
    await transactions.createIndex({ ownerId: 1, categoryId: 1 });
    await transactions.createIndex({ ownerId: 1, accountId: 1 });

    const budgets = database.collection('budgets');
    await budgets.createIndex({ ownerId: 1, categoryId: 1, month: 1 }, { unique: true });

    const goals = database.collection('savings_goals');
    await goals.createIndex({ ownerId: 1, createdAt: -1 });

    const recurring = database.collection('recurring_transactions');
    await recurring.createIndex({ ownerId: 1, active: 1, nextDueDate: 1 });

    const notifications = database.collection('notifications');
    await notifications.createIndex({ ownerId: 1, createdAt: -1 });

    console.log('[Database] Indexes verified and initialized successfully.');
  } catch (indexError) {
    console.warn('[Database] Index initialization note:', indexError.message);
  }
}
