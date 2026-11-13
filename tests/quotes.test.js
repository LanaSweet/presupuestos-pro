import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyDocument } from '../src/store.js';
import {
  createQuote,
  newManualLine,
  lineFromService,
  validateLine,
  assertDraft,
  issueBlockers,
  issueQuote,
  duplicateQuote,
  deleteQuote,
  sortedQuotes,
  MESSAGES,
} from '../src/quotes.js';

const TODAY = '2026-11-09';

function docWithProfile(profile = {}) {
  const doc = emptyDocument();
  Object.assign(doc.profile, { name: 'Ana', nif: '12345678Z', onboarded: true }, profile);
  return doc;
}

function readyQuote(doc) {
  const quote = createQuote(doc, TODAY);
  quote.client.name = 'Acme SL';
  quote.client.type = 'business';
  quote.lines.push({ ...newManualLine(), description: 'Diseño', unitPrice: 1500000 });
  return quote;
}

// --- US1: creation and lines ---

test('numbers are assigned per creation year: 2026-001, 2026-002', () => {
  const doc = docWithProfile();
  assert.equal(createQuote(doc, TODAY).number, '2026-001');
  assert.equal(createQuote(doc, TODAY).number, '2026-002');
});

test('new quote: withholding from profile, issueDate today, client type not chosen', () => {
  const doc = docWithProfile({ defaultWithholding: 15 });
  const quote = createQuote(doc, TODAY);
  assert.equal(quote.withholding, 15);
  assert.equal(quote.issueDate, TODAY);
  assert.equal(quote.client.type, null);
  assert.equal(quote.status, 'draft');
});

test('validateLine rejects quantity 0 / negative and negative price, accepts price 0', () => {
  const ok = { ...newManualLine(), description: 'X' };
  assert.deepEqual(validateLine({ ...ok, unitPrice: 0 }), []);
  assert.ok(validateLine({ ...ok, quantity: 0 }).length > 0);
  assert.ok(validateLine({ ...ok, quantity: -100 }).length > 0);
  assert.ok(validateLine({ ...ok, unitPrice: -1 }).length > 0);
  assert.ok(validateLine({ ...ok, description: '  ' }).length > 0);
  assert.ok(validateLine({ ...ok, quantity: null }).length > 0);
});

// --- US2: issuing ---

test('issueBlockers: profile without NIF', () => {
  const doc = docWithProfile({ nif: '' });
  assert.ok(issueBlockers(doc, readyQuote(doc)).includes(MESSAGES.profileMissing));
});

test('issueBlockers: quote without lines', () => {
  const doc = docWithProfile();
  const quote = readyQuote(doc);
  quote.lines = [];
  assert.deepEqual(issueBlockers(doc, quote), [MESSAGES.noLines]);
});

test('issueBlockers: client type not chosen', () => {
  const doc = docWithProfile();
  const quote = readyQuote(doc);
  quote.client.type = null;
  assert.deepEqual(issueBlockers(doc, quote), [MESSAGES.clientType]);
});

test('issueBlockers: none for a complete quote', () => {
  const doc = docWithProfile();
  assert.deepEqual(issueBlockers(doc, readyQuote(doc)), []);
});

test('issueQuote freezes issuer data; later profile changes do not affect it', () => {
  const doc = docWithProfile({ logoId: 'logo-1' });
  const quote = issueQuote(doc, readyQuote(doc));
  assert.equal(quote.status, 'issued');
  assert.equal(quote.issueDate, TODAY);
  doc.profile.name = 'Otro nombre';
  doc.profile.logoId = 'logo-2';
  assert.equal(quote.issuerSnapshot.name, 'Ana');
  assert.equal(quote.issuerSnapshot.logoId, 'logo-1');
});

test('assertDraft throws for an issued quote; issuing twice fails', () => {
  const doc = docWithProfile();
  const quote = issueQuote(doc, readyQuote(doc));
  assert.throws(() => assertDraft(quote));
  assert.throws(() => issueQuote(doc, quote));
});

// --- US4: catalog lines ---

test('lineFromService copies values; later catalog changes do not affect the line', () => {
  const service = { id: 's1', name: 'Sesión de fotos', defaultPrice: 500000 };
  const line = lineFromService(service);
  assert.deepEqual(
    { description: line.description, quantity: line.quantity, unitPrice: line.unitPrice, vatRate: line.vatRate },
    { description: 'Sesión de fotos', quantity: 100, unitPrice: 500000, vatRate: 21 },
  );
  service.name = 'Otra cosa';
  service.defaultPrice = 600000;
  assert.equal(line.description, 'Sesión de fotos');
  assert.equal(line.unitPrice, 500000);
});

// --- US5: numbering, duplicate, delete ---

test('first quote of a new year restarts at 001', () => {
  const doc = docWithProfile();
  doc.counters = { 2026: 14 };
  assert.equal(createQuote(doc, '2027-01-02').number, '2027-001');
});

test('deleted numbers are not reused', () => {
  const doc = docWithProfile();
  createQuote(doc, TODAY);
  createQuote(doc, TODAY);
  const third = createQuote(doc, TODAY);
  assert.equal(third.number, '2026-003');
  deleteQuote(doc, third);
  assert.equal(doc.quotes.length, 2);
  assert.equal(createQuote(doc, TODAY).number, '2026-004');
});

test('issued quotes cannot be deleted', () => {
  const doc = docWithProfile();
  const quote = issueQuote(doc, readyQuote(doc));
  assert.throws(() => deleteQuote(doc, quote));
  assert.equal(doc.quotes.length, 1);
});

test('duplicating an issued quote creates an independent draft', () => {
  const doc = docWithProfile();
  const original = readyQuote(doc);
  original.withholding = 7;
  issueQuote(doc, original);
  const copy = duplicateQuote(doc, original, '2026-11-20');

  assert.equal(copy.status, 'draft');
  assert.equal(copy.number, '2026-002');
  assert.equal(copy.issueDate, '2026-11-20');
  assert.equal(copy.issuerSnapshot, null);
  assert.equal(copy.withholding, 7);
  assert.deepEqual(copy.client, original.client);
  assert.notEqual(copy.lines[0].id, original.lines[0].id);
  assert.equal(copy.lines[0].description, original.lines[0].description);

  copy.client.name = 'Cambio';
  copy.lines[0].description = 'Cambio';
  assert.equal(original.client.name, 'Acme SL');
  assert.equal(original.lines[0].description, 'Diseño');
  assert.equal(original.status, 'issued');
});

test('sortedQuotes orders by number descending across years', () => {
  const doc = docWithProfile();
  createQuote(doc, TODAY);
  createQuote(doc, '2027-01-02');
  createQuote(doc, TODAY);
  assert.deepEqual(sortedQuotes(doc).map((q) => q.number), ['2027-001', '2026-002', '2026-001']);
});
