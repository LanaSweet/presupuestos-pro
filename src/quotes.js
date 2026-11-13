// Pure quote lifecycle: numbering, lines, validation, issuing, duplicating, deleting.
// Receives `today` ("YYYY-MM-DD") instead of reading the clock, so it can be tested.
import { newId } from './store.js';

export const MESSAGES = {
  profileMissing: 'Completa tu nombre y NIF en Mi perfil para descargar el PDF',
  noLines: 'Añade al menos una línea antes de descargar el PDF',
  invalidLines: 'Corrige los errores de las líneas antes de descargar el PDF',
  clientName: 'Escribe el nombre del cliente',
  clientType: 'Indica si el cliente es empresa/autónomo o particular',
};

/** Creates a draft with the next number of the creation year (FR-012) and adds it to doc. */
export function createQuote(doc, today) {
  const year = today.slice(0, 4);
  const next = (doc.counters[year] || 0) + 1;
  doc.counters[year] = next;

  const quote = {
    id: newId(),
    number: `${year}-${String(next).padStart(3, '0')}`,
    status: 'draft',
    createdAt: today,
    issueDate: today,
    client: { name: '', taxId: '', address: '', type: null },
    withholding: doc.profile.defaultWithholding || 0,
    lines: [],
    issuerSnapshot: null,
  };
  doc.quotes.push(quote);
  return quote;
}

export function newManualLine() {
  return { id: newId(), description: '', quantity: 100, unitPrice: 0, vatRate: 21 };
}

/** Copy of the service data; the line keeps no link to the catalog (FR-005, FR-008). */
export function lineFromService(service) {
  return { id: newId(), description: service.name, quantity: 100, unitPrice: service.defaultPrice, vatRate: 21 };
}

/** Returns error messages for a line (FR-007). */
export function validateLine(line) {
  const errors = [];
  if (!line.description || !line.description.trim()) errors.push('Escribe una descripción');
  if (!Number.isInteger(line.quantity)) errors.push('Cantidad no válida (hasta 2 decimales)');
  else if (line.quantity <= 0) errors.push('La cantidad debe ser mayor que 0');
  if (!Number.isInteger(line.unitPrice)) errors.push('Precio no válido (hasta 3 decimales)');
  else if (line.unitPrice < 0) errors.push('El precio no puede ser negativo');
  return errors;
}

export function assertDraft(quote) {
  if (quote.status !== 'draft') throw new Error('Un presupuesto emitido no se puede modificar');
}

/** Reasons that prevent issuing/downloading the PDF (contracts/ui.md § Bloqueos). */
export function issueBlockers(doc, quote) {
  const blockers = [];
  if (!doc.profile.name.trim() || !doc.profile.nif.trim()) blockers.push(MESSAGES.profileMissing);
  if (!quote.client.name.trim()) blockers.push(MESSAGES.clientName);
  if (quote.client.type !== 'business' && quote.client.type !== 'individual') blockers.push(MESSAGES.clientType);
  if (quote.lines.length === 0) blockers.push(MESSAGES.noLines);
  else if (quote.lines.some((line) => validateLine(line).length > 0)) blockers.push(MESSAGES.invalidLines);
  return blockers;
}

/** draft -> issued, freezing the issuer data and logo (FR-013, FR-015b). */
export function issueQuote(doc, quote) {
  assertDraft(quote);
  const { name, nif, email, phone, address, logoId } = doc.profile;
  quote.issuerSnapshot = { name, nif, email, phone, address, logoId };
  quote.status = 'issued';
  return quote;
}

/** New draft with a new number, same client, lines and withholding (FR-016). */
export function duplicateQuote(doc, quote, today) {
  const copy = createQuote(doc, today);
  copy.client = { ...quote.client };
  copy.lines = quote.lines.map((line) => ({ ...line, id: newId() }));
  copy.withholding = quote.withholding;
  return copy;
}

/** Only drafts can be deleted; the counter is never decremented (FR-012, FR-015). */
export function deleteQuote(doc, quote) {
  assertDraft(quote);
  doc.quotes = doc.quotes.filter((item) => item.id !== quote.id);
}

/** Quotes sorted from newest to oldest number (FR-013b). */
export function sortedQuotes(doc) {
  return [...doc.quotes].sort((a, b) => b.number.localeCompare(a.number));
}
