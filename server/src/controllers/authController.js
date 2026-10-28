import { ObjectId } from 'mongodb';
import { OAuth2Client } from 'google-auth-library';
import { getDb } from '../config/db.js';
import { config } from '../config/env.js';
import {
  generateRandomToken,
  hashPassword,
  hashToken,
  verifyPassword,
} from '../utils/crypto.js';
import {
  clearSessionCookie,
  sendError,
  sendSuccess,
  setSessionCookie,
} from '../utils/response.js';

// Initialize Google OAuth2 client if configured
let googleClient = null;
if (config.google.isConfigured) {
  googleClient = new OAuth2Client(
    config.google.clientId,
    config.google.clientSecret,
    config.google.redirectUri
  );
}

// Temporary in-memory or session store for OAuth state validation
const oauthStates = new Map();

/**
 * Creates default accounts and categories for a newly registered user
 */
export async function seedUserDefaults(db, userId) {
  const defaultAccounts = [
    {
      ownerId: userId,
      name: 'Primary Bank Account',
      type: 'bank',
      balancePaise: 0,
      currency: 'INR',
      color: '#F4D52E',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      ownerId: userId,
      name: 'Cash In Hand',
      type: 'cash',
      balancePaise: 0,
      currency: 'INR',
      color: '#78D8A0',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      ownerId: userId,
      name: 'Digital Wallet',
      type: 'wallet',
      balancePaise: 0,
      currency: 'INR',
      color: '#60A5FA',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await db.collection('accounts').insertMany(defaultAccounts);

  const defaultCategories = [
    // Income categories
    { ownerId: userId, name: 'Salary', type: 'income', icon: 'Briefcase', color: '#78D8A0', isDefault: true },
    { ownerId: userId, name: 'Freelance & Consulting', type: 'income', icon: 'Laptop', color: '#34D399', isDefault: true },
    { ownerId: userId, name: 'Investments & Dividends', type: 'income', icon: 'TrendingUp', color: '#10B981', isDefault: true },
    { ownerId: userId, name: 'Grants & Scholarships', type: 'income', icon: 'Award', color: '#059669', isDefault: true },
    { ownerId: userId, name: 'Other Income', type: 'income', icon: 'PlusCircle', color: '#6EE7B7', isDefault: true },
    // Expense categories
    { ownerId: userId, name: 'Food & Dining', type: 'expense', icon: 'Utensils', color: '#F4D52E', isDefault: true },
    { ownerId: userId, name: 'Groceries', type: 'expense', icon: 'ShoppingBag', color: '#FBBF24', isDefault: true },
    { ownerId: userId, name: 'Housing & Rent', type: 'expense', icon: 'Home', color: '#F87171', isDefault: true },
    { ownerId: userId, name: 'Utilities & Bills', type: 'expense', icon: 'Zap', color: '#FB923C', isDefault: true },
    { ownerId: userId, name: 'Transportation', type: 'expense', icon: 'Car', color: '#A78BFA', isDefault: true },
    { ownerId: userId, name: 'Shopping & Electronics', type: 'expense', icon: 'Tag', color: '#E879F9', isDefault: true },
    { ownerId: userId, name: 'Entertainment & Leisure', type: 'expense', icon: 'Film', color: '#EC4899', isDefault: true },
    { ownerId: userId, name: 'Healthcare & Fitness', type: 'expense', icon: 'Activity', color: '#F43F5E', isDefault: true },
    { ownerId: userId, name: 'Education & Courses', type: 'expense', icon: 'BookOpen', color: '#38BDF8', isDefault: true },
    { ownerId: userId, name: 'General & Miscellaneous', type: 'expense', icon: 'HelpCircle', color: '#94A3B8', isDefault: true },
  ];

  await db.collection('categories').insertMany(
    defaultCategories.map((c) => ({ ...c, createdAt: new Date(), updatedAt: new Date() }))
  );
}

/**
 * Create a new user session and issue HTTP-only cookie
 */
export async function createUserSession(db, res, user) {
  const sessionToken = generateRandomToken(32);
  const tokenHash = hashToken(sessionToken);
  const csrfToken = generateRandomToken(24);

  const expiresAt = new Date(Date.now() + config.sessionTtlDays * 24 * 60 * 60 * 1000);

  await db.collection('sessions').insertOne({
    userId: user._id,
    tokenHash,
    csrfToken,
    createdAt: new Date(),
    expiresAt,
  });

  setSessionCookie(res, sessionToken);

  return {
    csrfToken,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl || null,
      authProvider: user.authProvider || 'local',
      createdAt: user.createdAt,
    },
  };
}

export const authController = {
  // POST /api/auth/register
  async register(req, res) {
    const { name, email, password } = req.body || {};

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return sendError(res, 'Valid name (at least 2 characters) is required', 400);
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return sendError(res, 'A valid email address is required', 400);
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return sendError(res, 'Password must be at least 8 characters long', 400);
    }

    const emailNormalized = email.trim().toLowerCase();
    const db = getDb();

    // Check duplicate
    const existing = await db.collection('users').findOne({ emailNormalized });
    if (existing) {
      return sendError(res, 'An account with this email already exists', 409);
    }

    // Scrypt hashing
    const { hash, salt } = await hashPassword(password);

    const newUser = {
      name: name.trim(),
      email: email.trim(),
      emailNormalized,
      passwordHash: hash,
      passwordSalt: salt,
      authProvider: 'local',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('users').insertOne(newUser);
    newUser._id = result.insertedId;

    // Seed defaults
    await seedUserDefaults(db, newUser._id);

    // Auto-login session
    const sessionData = await createUserSession(db, res, newUser);
    return sendSuccess(res, sessionData, 'Account registered successfully', 201);
  },

  // POST /api/auth/login
  async login(req, res) {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    const emailNormalized = String(email).trim().toLowerCase();
    const db = getDb();

    const user = await db.collection('users').findOne({ emailNormalized });
    if (!user) {
      return sendError(res, 'Invalid email or password', 401);
    }

    if (user.authProvider === 'google' && !user.passwordHash) {
      return sendError(
        res,
        'This account was created with Google Sign-In. Please sign in with Google.',
        400
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash, user.passwordSalt);
    if (!isValid) {
      return sendError(res, 'Invalid email or password', 401);
    }

    // Update last login
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { lastLoginAt: new Date(), updatedAt: new Date() } }
    );

    const sessionData = await createUserSession(db, res, user);
    return sendSuccess(res, sessionData, 'Signed in successfully');
  },

  // GET /api/auth/me
  async me(req, res) {
    if (!req.user || !req.session) {
      return sendError(res, 'Not authenticated', 401);
    }

    return sendSuccess(res, {
      user: {
        id: req.user._id.toString(),
        name: req.user.name,
        email: req.user.email,
        avatarUrl: req.user.avatarUrl || null,
        authProvider: req.user.authProvider || 'local',
        createdAt: req.user.createdAt,
      },
      csrfToken: req.session.csrfToken,
      googleConfigured: config.google.isConfigured,
    });
  },

  // POST /api/auth/logout
  async logout(req, res) {
    if (req.session) {
      const db = getDb();
      await db.collection('sessions').deleteOne({ _id: req.session._id });
    }

    clearSessionCookie(res);
    return sendSuccess(res, null, 'Logged out successfully');
  },

  // POST /api/auth/change-password
  async changePassword(req, res) {
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return sendError(res, 'Current and new password are required', 400);
    }

    if (newPassword.length < 8) {
      return sendError(res, 'New password must be at least 8 characters long', 400);
    }

    const db = getDb();
    const user = await db.collection('users').findOne({ _id: req.user._id });

    if (!user || !user.passwordHash) {
      return sendError(res, 'Password cannot be changed for this account type', 400);
    }

    const isValid = await verifyPassword(currentPassword, user.passwordHash, user.passwordSalt);
    if (!isValid) {
      return sendError(res, 'Current password is incorrect', 400);
    }

    const { hash, salt } = await hashPassword(newPassword);

    await db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: {
          passwordHash: hash,
          passwordSalt: salt,
          updatedAt: new Date(),
        },
      }
    );

    // Invalidate other sessions
    await db.collection('sessions').deleteMany({
      userId: user._id,
      _id: { $ne: req.session._id },
    });

    return sendSuccess(res, null, 'Password updated successfully');
  },

  // POST /api/auth/forgot-password
  async forgotPassword(req, res) {
    const { email } = req.body || {};
    if (!email) {
      return sendError(res, 'Email is required', 400);
    }

    const emailNormalized = String(email).trim().toLowerCase();
    const db = getDb();
    const user = await db.collection('users').findOne({ emailNormalized });

    // Always return safe generic success message to prevent user enumeration
    if (!user) {
      return sendSuccess(
        res,
        { simulated: true },
        'If an account matches that email, password reset instructions have been generated.'
      );
    }

    const resetToken = generateRandomToken(32);
    const resetTokenHash = hashToken(resetToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: {
          resetPasswordTokenHash: resetTokenHash,
          resetPasswordExpiresAt: expiresAt,
        },
      }
    );

    return sendSuccess(
      res,
      {
        token: resetToken, // Returned in dev/college demo context for testing without SMTP
        expiresAt,
      },
      'Password reset token generated. Use it to complete password reset.'
    );
  },

  // POST /api/auth/reset-password
  async resetPassword(req, res) {
    const { token, newPassword } = req.body || {};

    if (!token || !newPassword) {
      return sendError(res, 'Reset token and new password are required', 400);
    }

    if (newPassword.length < 8) {
      return sendError(res, 'New password must be at least 8 characters long', 400);
    }

    const resetTokenHash = hashToken(token);
    const db = getDb();

    const user = await db.collection('users').findOne({
      resetPasswordTokenHash: resetTokenHash,
      resetPasswordExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return sendError(res, 'Invalid or expired password reset token', 400);
    }

    const { hash, salt } = await hashPassword(newPassword);

    await db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: {
          passwordHash: hash,
          passwordSalt: salt,
          updatedAt: new Date(),
        },
        $unset: {
          resetPasswordTokenHash: '',
          resetPasswordExpiresAt: '',
        },
      }
    );

    // Invalidate all existing sessions
    await db.collection('sessions').deleteMany({ userId: user._id });

    return sendSuccess(res, null, 'Password has been reset successfully. Please sign in with your new password.');
  },

  // GET /api/auth/google/url
  async googleAuthUrl(req, res) {
    if (!config.google.isConfigured || !googleClient) {
      return sendSuccess(res, {
        isConfigured: false,
        message:
          'Google OAuth requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in server/.env. Provide genuine credentials to enable Google Sign-In.',
      });
    }

    const state = generateRandomToken(16);
    oauthStates.set(state, { createdAt: Date.now() });

    // Clean old states > 10 min
    const tenMinAgo = Date.now() - 10 * 60 * 1000;
    for (const [s, data] of oauthStates.entries()) {
      if (data.createdAt < tenMinAgo) oauthStates.delete(s);
    }

    const authUrl = googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: ['openid', 'email', 'profile'],
      state,
      prompt: 'consent',
    });

    return sendSuccess(res, {
      isConfigured: true,
      authUrl,
      state,
    });
  },

  // POST /api/auth/google/callback
  async googleCallback(req, res) {
    const { code, state, idToken } = req.body || {};

    if (!config.google.isConfigured || !googleClient) {
      return sendError(
        res,
        'Google OAuth is not configured on this server. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to server/.env.',
        503
      );
    }

    if (state && !oauthStates.has(state)) {
      return sendError(res, 'Invalid or expired OAuth state parameter', 400);
    }
    if (state) oauthStates.delete(state);

    const db = getDb();
    let payload = null;

    try {
      if (idToken) {
        // Direct ID token verification
        const ticket = await googleClient.verifyIdToken({
          idToken,
          audience: config.google.clientId,
        });
        payload = ticket.getPayload();
      } else if (code) {
        // Authorization code exchange
        const { tokens } = await googleClient.getToken(code);
        const ticket = await googleClient.verifyIdToken({
          idToken: tokens.id_token,
          audience: config.google.clientId,
        });
        payload = ticket.getPayload();
      } else {
        return sendError(res, 'Authorization code or ID token required', 400);
      }
    } catch (oauthErr) {
      console.error('[Google OAuth] Verification failed:', oauthErr.message);
      return sendError(res, `Google authentication failed: ${oauthErr.message}`, 401);
    }

    if (!payload || !payload.email || !payload.email_verified) {
      return sendError(res, 'Google account email must be verified', 400);
    }

    const emailNormalized = payload.email.trim().toLowerCase();

    let user = await db.collection('users').findOne({ emailNormalized });

    if (!user) {
      // Create new user via Google
      const newUser = {
        name: payload.name || payload.given_name || 'Google User',
        email: payload.email,
        emailNormalized,
        avatarUrl: payload.picture || null,
        googleId: payload.sub,
        authProvider: 'google',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.collection('users').insertOne(newUser);
      newUser._id = result.insertedId;
      await seedUserDefaults(db, newUser._id);
      user = newUser;
    } else {
      // Link Google ID if not present
      await db.collection('users').updateOne(
        { _id: user._id },
        {
          $set: {
            googleId: payload.sub,
            avatarUrl: payload.picture || user.avatarUrl,
            lastLoginAt: new Date(),
            updatedAt: new Date(),
          },
        }
      );
    }

    const sessionData = await createUserSession(db, res, user);
    return sendSuccess(res, sessionData, 'Google Sign-In successful');
  },
};
