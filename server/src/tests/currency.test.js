import test from 'node:test';
import assert from 'node:assert/strict';
import { toPaise, toRupees, formatINR } from '../utils/currency.js';

test('Monetary Integer Arithmetic (Paise & INR)', async (t) => {
  await t.test('converts decimal rupees to integer paise accurately', () => {
    assert.equal(toPaise(100), 10000);
    assert.equal(toPaise('1250.50'), 125050);
    assert.equal(toPaise(0.99), 99);
    assert.equal(toPaise('0'), 0);
  });

  await t.test('handles comma-separated rupee input', () => {
    assert.equal(toPaise('1,25,000.75'), 12500075);
    assert.equal(toPaise('10,00,000'), 100000000);
  });

  await t.test('rejects negative amounts', () => {
    assert.throws(() => toPaise(-50), /cannot be negative/);
  });

  await t.test('rejects invalid inputs', () => {
    assert.throws(() => toPaise('not-a-number'), /Invalid monetary amount/);
    assert.throws(() => toPaise(''), /Amount is required/);
  });

  await t.test('converts integer paise back to rupees', () => {
    assert.equal(toRupees(125050), 1250.5);
    assert.equal(toRupees(99), 0.99);
    assert.equal(toRupees(0), 0);
  });

  await t.test('formats INR with Indian numbering system (Lakhs and Crores)', () => {
    assert.equal(formatINR(10000000, true), '₹1,00,000.00'); // 1 Lakh
    assert.equal(formatINR(10000000, false), '₹1,00,000');
    assert.equal(formatINR(1000000000, false), '₹1,00,00,000'); // 1 Crore
    assert.equal(formatINR(50000, false), '₹500');
    assert.equal(formatINR(-250000, false), '-₹2,500');
  });
});
