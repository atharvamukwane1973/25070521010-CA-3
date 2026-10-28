/**
 * Centralized API Service for Vaultly
 * Built using native fetch, automatic CSRF token inclusion, and credentials handling.
 */

let inMemoryCsrfToken = null;

export function setCsrfToken(token) {
  inMemoryCsrfToken = token;
}

export function getCsrfToken() {
  return inMemoryCsrfToken;
}

async function request(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  // Attach CSRF token on state-changing requests
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && inMemoryCsrfToken) {
    headers['X-CSRF-Token'] = inMemoryCsrfToken;
  }

  const fetchOptions = {
    ...options,
    method,
    headers,
    credentials: 'include', // sends HTTP-only session cookie
  };

  if (options.body && typeof options.body === 'object') {
    fetchOptions.body = JSON.stringify(options.body);
  }

  let response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (netErr) {
    throw new Error('Unable to connect to Vaultly server. Please check your network or server status.');
  }

  let data;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.details = data?.details;
    throw err;
  }

  // Update CSRF token if returned in payload
  if (data?.data?.csrfToken) {
    setCsrfToken(data.data.csrfToken);
  }

  return data;
}

export const api = {
  // Authentication
  auth: {
    register: (name, email, password) =>
      request('/api/auth/register', { method: 'POST', body: { name, email, password } }),
    login: (email, password) =>
      request('/api/auth/login', { method: 'POST', body: { email, password } }),
    me: () => request('/api/auth/me'),
    logout: () => request('/api/auth/logout', { method: 'POST' }),
    changePassword: (currentPassword, newPassword) =>
      request('/api/auth/change-password', {
        method: 'POST',
        body: { currentPassword, newPassword },
      }),
    forgotPassword: (email) =>
      request('/api/auth/forgot-password', { method: 'POST', body: { email } }),
    resetPassword: (token, newPassword) =>
      request('/api/auth/reset-password', { method: 'POST', body: { token, newPassword } }),
    getGoogleAuthUrl: () => request('/api/auth/google/url'),
    googleCallback: (code, state) =>
      request('/api/auth/google/callback', { method: 'POST', body: { code, state } }),
  },

  // Dashboard
  dashboard: {
    getSummary: () => request('/api/dashboard/summary'),
  },

  // Transactions
  transactions: {
    list: (params = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') query.append(k, v);
      });
      const qs = query.toString();
      return request(`/api/transactions${qs ? `?${qs}` : ''}`);
    },
    get: (id) => request(`/api/transactions/${id}`),
    create: (data) => request('/api/transactions', { method: 'POST', body: data }),
    update: (id, data) => request(`/api/transactions/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/api/transactions/${id}`, { method: 'DELETE' }),
    exportCsvUrl: () => '/api/transactions/export/csv',
  },

  // Accounts
  accounts: {
    list: () => request('/api/accounts'),
    create: (data) => request('/api/accounts', { method: 'POST', body: data }),
    update: (id, data) => request(`/api/accounts/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/api/accounts/${id}`, { method: 'DELETE' }),
  },

  // Categories
  categories: {
    list: () => request('/api/categories'),
    create: (data) => request('/api/categories', { method: 'POST', body: data }),
    update: (id, data) => request(`/api/categories/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/api/categories/${id}`, { method: 'DELETE' }),
  },

  // Budgets
  budgets: {
    list: (month) => request(`/api/budgets${month ? `?month=${month}` : ''}`),
    upsert: (data) => request('/api/budgets', { method: 'POST', body: data }),
    delete: (id) => request(`/api/budgets/${id}`, { method: 'DELETE' }),
  },

  // Savings Goals
  goals: {
    list: () => request('/api/goals'),
    create: (data) => request('/api/goals', { method: 'POST', body: data }),
    contribute: (id, amount) =>
      request(`/api/goals/${id}/contribute`, { method: 'POST', body: { amount } }),
    update: (id, data) => request(`/api/goals/${id}`, { method: 'PUT', body: data }),
    delete: (id) => request(`/api/goals/${id}`, { method: 'DELETE' }),
  },

  // Recurring
  recurring: {
    list: () => request('/api/recurring'),
    create: (data) => request('/api/recurring', { method: 'POST', body: data }),
    execute: (id) => request(`/api/recurring/${id}/execute`, { method: 'POST' }),
    delete: (id) => request(`/api/recurring/${id}`, { method: 'DELETE' }),
  },

  // Analytics & Reports
  reports: {
    getAnalytics: (startDate, endDate) => {
      const q = new URLSearchParams();
      if (startDate) q.append('startDate', startDate);
      if (endDate) q.append('endDate', endDate);
      const qs = q.toString();
      return request(`/api/reports/analytics${qs ? `?${qs}` : ''}`);
    },
  },

  // Notifications
  notifications: {
    list: () => request('/api/notifications'),
  },
};
