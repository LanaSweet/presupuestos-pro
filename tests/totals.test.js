import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeTotals, lineAmount } from '../src/totals.js';

function quote({ type = 'business', withholding = 15, lines }) {
  return { client: { type }, withholding, lines };
}

const web = (vatRate = 21) => ({ quantity: 100, unitPrice: 1500000, vatRate });
const photos = (vatRate = 21) => ({ quantity: 100, unitPrice: 500000, vatRate });

test('reference example: 15 % withholding -> 2.120,00 €', () => {
  const totals = computeTotals(quote({ lines: [web(), photos()] }));
  assert.equal(totals.base, 200000);
  assert.deepEqual(totals.vatByRate, [{ rate: 21, amount: 42000 }]);
  assert.equal(totals.withholdingAmount, 30000);
  assert.equal(totals.total, 212000);
});

test('7 % withholding -> 2.280,00 €', () => {
  assert.equal(computeTotals(quote({ withholding: 7, lines: [web(), photos()] })).total, 228000);
});

test('no withholding -> 2.420,00 €', () => {
  assert.equal(computeTotals(quote({ withholding: 0, lines: [web(), photos()] })).total, 242000);
});

test('individual client never has withholding -> 2.420,00 €', () => {
  const totals = computeTotals(quote({ type: 'individual', withholding: 15, lines: [web(), photos()] }));
  assert.equal(totals.withholdingRate, 0);
  assert.equal(totals.withholdingAmount, 0);
  assert.equal(totals.total, 242000);
});

test('client type not chosen yet -> no withholding', () => {
  const totals = computeTotals(quote({ type: null, withholding: 15, lines: [web(), photos()] }));
  assert.equal(totals.withholdingAmount, 0);
  assert.equal(totals.total, 242000);
});

test('mixed VAT 21 % + 10 % -> 2.065,00 €', () => {
  const totals = computeTotals(quote({ lines: [web(21), photos(10)] }));
  assert.deepEqual(totals.vatByRate, [
    { rate: 21, amount: 31500 },
    { rate: 10, amount: 5000 },
  ]);
  assert.equal(totals.total, 206500);
});

test('line 3 × 0,785 € -> 2,36 €', () => {
  assert.equal(lineAmount({ quantity: 300, unitPrice: 785, vatRate: 21 }), 236);
});

test('empty quote -> all zero', () => {
  const totals = computeTotals(quote({ lines: [] }));
  assert.equal(totals.base, 0);
  assert.deepEqual(totals.vatByRate, []);
  assert.equal(totals.total, 0);
});

test('invalid line values count as 0', () => {
  const totals = computeTotals(quote({ lines: [web(), { quantity: null, unitPrice: 500000, vatRate: 21 }] }));
  assert.equal(totals.base, 150000);
});
