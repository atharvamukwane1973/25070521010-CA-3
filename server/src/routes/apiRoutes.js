import { Router } from './router.js';
import { authController } from '../controllers/authController.js';
import { accountController } from '../controllers/accountController.js';
import { categoryController } from '../controllers/categoryController.js';
import { transactionController } from '../controllers/transactionController.js';
import { budgetController } from '../controllers/budgetController.js';
import { goalController } from '../controllers/goalController.js';
import { recurringController } from '../controllers/recurringController.js';
import { dashboardController } from '../controllers/dashboardController.js';
import { reportController } from '../controllers/reportController.js';
import { notificationController } from '../controllers/notificationController.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';
import { validateCsrf } from '../middleware/csrfMiddleware.js';
import { authRateLimiter, generalRateLimiter } from '../middleware/rateLimitMiddleware.js';
import { sendSuccess } from '../utils/response.js';

export function createApiRouter() {
  const router = new Router();

  // Health check
  router.get('/api/health', (req, res) => {
    sendSuccess(res, {
      status: 'healthy',
      app: 'Vaultly — Personal Finance Tracker',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: 'MongoDB (Community / Compass ready)',
    });
  });

  // Authentication routes
  router.post('/api/auth/register', authRateLimiter, authController.register);
  router.post('/api/auth/login', authRateLimiter, authController.login);
  router.get('/api/auth/me', optionalAuth, authController.me);
  router.post('/api/auth/logout', requireAuth, authController.logout);
  router.post('/api/auth/change-password', requireAuth, validateCsrf, authController.changePassword);
  router.post('/api/auth/forgot-password', authRateLimiter, authController.forgotPassword);
  router.post('/api/auth/reset-password', authRateLimiter, authController.resetPassword);

  // Google OAuth
  router.get('/api/auth/google/url', authController.googleAuthUrl);
  router.post('/api/auth/google/callback', authController.googleCallback);

  // Dashboard summary
  router.get('/api/dashboard/summary', generalRateLimiter, requireAuth, dashboardController.getSummary);

  // Transactions
  router.get('/api/transactions', generalRateLimiter, requireAuth, transactionController.list);
  router.get('/api/transactions/export/csv', generalRateLimiter, requireAuth, transactionController.exportCsv);
  router.get('/api/transactions/:id', generalRateLimiter, requireAuth, transactionController.getById);
  router.post('/api/transactions', generalRateLimiter, requireAuth, validateCsrf, transactionController.create);
  router.put('/api/transactions/:id', generalRateLimiter, requireAuth, validateCsrf, transactionController.update);
  router.delete('/api/transactions/:id', generalRateLimiter, requireAuth, validateCsrf, transactionController.delete);

  // Accounts
  router.get('/api/accounts', generalRateLimiter, requireAuth, accountController.list);
  router.post('/api/accounts', generalRateLimiter, requireAuth, validateCsrf, accountController.create);
  router.put('/api/accounts/:id', generalRateLimiter, requireAuth, validateCsrf, accountController.update);
  router.delete('/api/accounts/:id', generalRateLimiter, requireAuth, validateCsrf, accountController.delete);

  // Categories
  router.get('/api/categories', generalRateLimiter, requireAuth, categoryController.list);
  router.post('/api/categories', generalRateLimiter, requireAuth, validateCsrf, categoryController.create);
  router.put('/api/categories/:id', generalRateLimiter, requireAuth, validateCsrf, categoryController.update);
  router.delete('/api/categories/:id', generalRateLimiter, requireAuth, validateCsrf, categoryController.delete);

  // Budgets
  router.get('/api/budgets', generalRateLimiter, requireAuth, budgetController.list);
  router.post('/api/budgets', generalRateLimiter, requireAuth, validateCsrf, budgetController.upsert);
  router.delete('/api/budgets/:id', generalRateLimiter, requireAuth, validateCsrf, budgetController.delete);

  // Savings Goals
  router.get('/api/goals', generalRateLimiter, requireAuth, goalController.list);
  router.post('/api/goals', generalRateLimiter, requireAuth, validateCsrf, goalController.create);
  router.post('/api/goals/:id/contribute', generalRateLimiter, requireAuth, validateCsrf, goalController.contribute);
  router.put('/api/goals/:id', generalRateLimiter, requireAuth, validateCsrf, goalController.update);
  router.delete('/api/goals/:id', generalRateLimiter, requireAuth, validateCsrf, goalController.delete);

  // Recurring Transactions
  router.get('/api/recurring', generalRateLimiter, requireAuth, recurringController.list);
  router.post('/api/recurring', generalRateLimiter, requireAuth, validateCsrf, recurringController.create);
  router.post('/api/recurring/:id/execute', generalRateLimiter, requireAuth, validateCsrf, recurringController.execute);
  router.delete('/api/recurring/:id', generalRateLimiter, requireAuth, validateCsrf, recurringController.delete);

  // Reports & Analytics
  router.get('/api/reports/analytics', generalRateLimiter, requireAuth, reportController.getAnalytics);

  // Notifications
  router.get('/api/notifications', generalRateLimiter, requireAuth, notificationController.list);

  return router;
}
