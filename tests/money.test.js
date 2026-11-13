import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  roundHalfUp,
  parseQuantity,
  parsePrice,
  formatEuros,
  formatPrice,
  formatQuantity,
  formatDate,
  parseDate,
  maskDate,
  addDays,
} from '../src/money.js';

test('roundHalfUp rounds half up', () => {
  assert.equal(roundHalfUp(2355, 10), 236); // 235,5 -> 236
  assert.equal(roundHalfUp(2354, 10), 235); // 235,4 -> 235
  assert.equal(roundHalfUp(235500, 1000), 236);
  assert.equal(roundHalfUp(0, 100), 0);
});

test('parseQuantity accepts comma or dot, up to 2 decimals', () => {
  assert.equal(parseQuantity('1,5'), 150);
  assert.equal(parseQuantity('1.5'), 150);
  assert.equal(parseQuantity('3'), 300);
  assert.equal(parseQuantity('0,25'), 25);
  assert.equal(parseQuantity('-1'), -100);
  assert.equal(parseQuantity('abc'), null);
  assert.equal(parseQuantity('1,234'), null);
  assert.equal(parseQuantity(''), null);
});

test('parsePrice returns thousandths, up to 3 decimals', () => {
  assert.equal(parsePrice('0,785'), 785);
  assert.equal(parsePrice('1.500'), 1500000);
  assert.equal(parsePrice('1500,00'), 1500000);
  assert.equal(parsePrice('1.500,50'), 1500500);
  assert.equal(parsePrice('500'), 500000);
  assert.equal(parsePrice('0'), 0);
  assert.equal(parsePrice('0,7855'), null);
  assert.equal(parsePrice('abc'), null);
});

test('formatEuros uses Spanish grouping, also for 4-digit numbers', () => {
  assert.equal(formatEuros(150000), '1.500,00 €');
  assert.equal(formatEuros(236), '2,36 €');
  assert.equal(formatEuros(-30000), '−300,00 €');
  assert.equal(formatEuros(212000), '2.120,00 €');
  assert.equal(formatEuros(0), '0,00 €');
  assert.equal(formatEuros(123456789), '1.234.567,89 €');
});

test('formatPrice shows 3 decimals only when needed', () => {
  assert.equal(formatPrice(1500000), '1.500,00 €');
  assert.equal(formatPrice(785), '0,785 €');
});

test('formatQuantity trims trailing decimals', () => {
  assert.equal(formatQuantity(150), '1,5');
  assert.equal(formatQuantity(100), '1');
  assert.equal(formatQuantity(125), '1,25');
});

test('dates', () => {
  assert.equal(formatDate('2026-11-12'), '12/11/2026');
  assert.equal(addDays('2026-11-12', 30), '2026-12-12');
  assert.equal(addDays('2026-12-15', 30), '2027-01-14');
  assert.equal(parseDate('12/11/2026'), '2026-11-12');
  assert.equal(parseDate('31/02/2026'), null);
  assert.equal(parseDate('29/02/2027'), null);
  assert.equal(parseDate('29/02/2028'), '2028-02-29');
  assert.equal(parseDate('12/11/26'), null);
  assert.equal(maskDate('1211'), '12/11');
  assert.equal(maskDate('12112026'), '12/11/2026');
  assert.equal(maskDate('12/11/2026x9'), '12/11/2026');
  assert.equal(maskDate('12'), '12');
});
