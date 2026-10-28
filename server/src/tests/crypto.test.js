import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hashPassword,
  verifyPassword,
  generateRandomToken,
  hashToken,
} from '../utils/crypto.js';

test('Password Hashing & Verification (scrypt)', async (t) => {
  await t.test('hashes password using scrypt with random salt', async () => {
    const plain = 'CollegeProjectPassword2026!';
    const result1 = await hashPassword(plain);
    const result2 = await hashPassword(plain);

    assert.ok(result1.hash, 'Hash should exist');
    assert.ok(result1.salt, 'Salt should exist');
    assert.notEqual(result1.salt, result2.salt, 'Salts must be randomly generated and unique');
    assert.notEqual(result1.hash, result2.hash, 'Different salts must yield different hashes');
  });

  await t.test('verifies correct password against hash and salt', async () => {
    const plain = 'SuperSecret123$';
    const { hash, salt } = await hashPassword(plain);

    const isValid = await verifyPassword(plain, hash, salt);
    assert.equal(isValid, true, 'Verification should succeed with correct password');
  });

  await t.test('rejects incorrect password', async () => {
    const plain = 'SuperSecret123$';
    const { hash, salt } = await hashPassword(plain);

    const isValid = await verifyPassword('WrongPassword123$', hash, salt);
    assert.equal(isValid, false, 'Verification must reject invalid password');
  });

  await t.test('rejects password shorter than 8 characters', async () => {
    await assert.rejects(
      async () => {
        await hashPassword('short');
      },
      /at least 8 characters/
    );
  });
});

test('Session Token Generation & SHA-256 Hashing', async (t) => {
  await t.test('generates cryptographically secure hex tokens', () => {
    const token1 = generateRandomToken(32);
    const token2 = generateRandomToken(32);

    assert.equal(typeof token1, 'string');
    assert.equal(token1.length, 64, '32 bytes hex should be 64 characters');
    assert.notEqual(token1, token2, 'Consecutive tokens must be distinct');
  });

  await t.test('hashes token deterministically with SHA-256', () => {
    const token = 'sample-test-token-value';
    const hash1 = hashToken(token);
    const hash2 = hashToken(token);

    assert.equal(hash1, hash2, 'SHA-256 hash must be deterministic');
    assert.equal(hash1.length, 64, 'SHA-256 hex output should be 64 characters');
  });
});
