import test from 'node:test';
import assert from 'node:assert/strict';
import { connectToDatabase, closeDatabase, getDb } from '../config/db.js';
import { authController } from '../controllers/authController.js';
import { accountController } from '../controllers/accountController.js';
import { transactionController } from '../controllers/transactionController.js';

// Mock Response Helper
function createMockRes() {
  const headers = {};
  const res = {
    statusCode: 200,
    headers,
    setHeader(k, v) {
      headers[k.toLowerCase()] = v;
    },
    getHeader(k) {
      return headers[k.toLowerCase()];
    },
    writeHead(code, extraHeaders = {}) {
      res.statusCode = code;
      Object.assign(headers, extraHeaders);
    },
    end(data) {
      res.body = data ? JSON.parse(data) : null;
    },
  };
  return res;
}

test('Authentication & Data Isolation Suite', async (t) => {
  let db;

  t.before(async () => {
    db = await connectToDatabase();
  });

  t.after(async () => {
    // Clean up test users
    await db.collection('users').deleteMany({ emailNormalized: { $regex: /@vaultlytest\.local$/ } });
    await db.collection('accounts').deleteMany({ name: { $regex: /Test Account/ } });
    await db.collection('transactions').deleteMany({ description: { $regex: /Test Tx/ } });
    await closeDatabase();
  });

  const testUserA = {
    name: 'Aarav Sharma',
    email: `aarav_${Date.now()}@vaultlytest.local`,
    password: 'SecurePassword123!',
  };

  const testUserB = {
    name: 'Diya Patel',
    email: `diya_${Date.now()}@vaultlytest.local`,
    password: 'DifferentPassword456!',
  };

  let userAId, userBId;
  let userASessionData, userBSessionData;

  await t.test('Registration succeeds with scrypt password hashing', async () => {
    const req = { body: testUserA };
    const res = createMockRes();

    await authController.register(req, res);

    assert.equal(res.statusCode, 201, 'Should return HTTP 201 Created');
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, testUserA.email);

    userAId = res.body.data.user.id;
    userASessionData = res.body.data;

    // Verify stored user in MongoDB has NO plain password, only scrypt hash and salt
    const storedUser = await db.collection('users').findOne({ emailNormalized: testUserA.email.toLowerCase() });
    assert.ok(storedUser.passwordHash, 'passwordHash must be present');
    assert.ok(storedUser.passwordSalt, 'passwordSalt must be present');
    assert.equal(storedUser.password, undefined, 'Plain password MUST NEVER be stored');
  });

  await t.test('Duplicate registration is rejected with HTTP 409', async () => {
    const req = { body: testUserA };
    const res = createMockRes();

    await authController.register(req, res);

    assert.equal(res.statusCode, 409, 'Should return 409 Conflict for existing email');
    assert.equal(res.body.success, false);
  });

  await t.test('Login with valid credentials returns session and CSRF token', async () => {
    const req = {
      body: {
        email: testUserA.email,
        password: testUserA.password,
      },
    };
    const res = createMockRes();

    await authController.login(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.csrfToken, 'CSRF token must be issued');
    assert.ok(res.getHeader('set-cookie'), 'Session cookie must be set');
  });

  await t.test('Login with invalid password fails with HTTP 401', async () => {
    const req = {
      body: {
        email: testUserA.email,
        password: 'CompletelyWrongPassword!',
      },
    };
    const res = createMockRes();

    await authController.login(req, res);

    assert.equal(res.statusCode, 401);
    assert.equal(res.body.success, false);
  });

  await t.test('User B registers and data isolation is strictly enforced', async () => {
    // Register User B
    const reqB = { body: testUserB };
    const resB = createMockRes();
    await authController.register(reqB, resB);
    userBId = resB.body.data.user.id;
    userBSessionData = resB.body.data;

    // Create an account for User A
    const reqAccA = {
      user: { _id: db.collection('users').find({ emailNormalized: testUserA.email.toLowerCase() })._id || (await db.collection('users').findOne({ emailNormalized: testUserA.email.toLowerCase() }))._id },
      body: {
        name: 'Aarav Private Test Account',
        type: 'bank',
        startingBalance: '50000',
      },
    };
    const resAccA = createMockRes();
    await accountController.create(reqAccA, resAccA);
    assert.equal(resAccA.statusCode, 201);
    const userAAccId = resAccA.body.data.id;

    // User B tries to view or delete User A's account -> Must be rejected (404/not found for User B)
    const reqDelB = {
      user: { _id: (await db.collection('users').findOne({ emailNormalized: testUserB.email.toLowerCase() }))._id },
      params: { id: userAAccId },
    };
    const resDelB = createMockRes();
    await accountController.delete(reqDelB, resDelB);

    assert.equal(resDelB.statusCode, 404, 'User B must not be able to delete User A account');
  });
});
