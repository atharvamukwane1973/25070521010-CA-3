import crypto from 'node:crypto';

const SCRYPT_PARAMS = {
  N: 16384,
  r: 8,
  p: 1,
  keyLen: 64,
};

/**
 * Hash a plain password using Node.js crypto.scrypt with a unique random salt
 */
export async function hashPassword(plainPassword) {
  if (typeof plainPassword !== 'string' || plainPassword.length < 8) {
    throw new Error('Password must be a string of at least 8 characters');
  }

  const salt = crypto.randomBytes(16).toString('hex');

  return new Promise((resolve, reject) => {
    crypto.scrypt(
      plainPassword,
      salt,
      SCRYPT_PARAMS.keyLen,
      { N: SCRYPT_PARAMS.N, r: SCRYPT_PARAMS.r, p: SCRYPT_PARAMS.p },
      (err, derivedKey) => {
        if (err) return reject(err);
        resolve({
          hash: derivedKey.toString('hex'),
          salt,
        });
      }
    );
  });
}

/**
 * Verify a password using timing-safe comparison
 */
export async function verifyPassword(plainPassword, storedHash, storedSalt) {
  if (!plainPassword || !storedHash || !storedSalt) {
    return false;
  }

  return new Promise((resolve) => {
    crypto.scrypt(
      plainPassword,
      storedSalt,
      SCRYPT_PARAMS.keyLen,
      { N: SCRYPT_PARAMS.N, r: SCRYPT_PARAMS.r, p: SCRYPT_PARAMS.p },
      (err, derivedKey) => {
        if (err) return resolve(false);

        const keyBuffer = derivedKey;
        const hashBuffer = Buffer.from(storedHash, 'hex');

        if (keyBuffer.length !== hashBuffer.length) {
          return resolve(false);
        }

        try {
          const match = crypto.timingSafeEqual(keyBuffer, hashBuffer);
          resolve(match);
        } catch {
          resolve(false);
        }
      }
    );
  });
}

/**
 * Generate cryptographically secure random token (hex)
 */
export function generateRandomToken(byteLength = 32) {
  return crypto.randomBytes(byteLength).toString('hex');
}

/**
 * Compute SHA-256 hash of a token
 */
export function hashToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}
