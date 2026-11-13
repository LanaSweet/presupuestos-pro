// Reads and writes the whole app document in localStorage (contracts/storage.md).

export const STORAGE_KEY = 'presupuestospro:v1';

export class StorageFullError extends Error {
  constructor() {
    super('No queda espacio en este navegador');
    this.name = 'StorageFullError';
  }
}

export function emptyDocument() {
  return {
    schemaVersion: 1,
    profile: {
      name: '',
      nif: '',
      email: '',
      phone: '',
      address: '',
      logoId: null,
      defaultWithholding: 0,
      onboarded: false,
    },
    logos: {},
    services: [],
    counters: {},
    quotes: [],
  };
}

/** Unique id. crypto.randomUUID only exists in secure contexts (HTTPS/localhost). */
export function newId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

/**
 * Returns { doc, corrupted }. A corrupted document is never overwritten here:
 * the caller decides (FR-029).
 */
export function load(storage = globalThis.localStorage) {
  const raw = storage.getItem(STORAGE_KEY);
  if (raw === null) return { doc: emptyDocument(), corrupted: false };
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || parsed.schemaVersion !== 1) {
      return { doc: emptyDocument(), corrupted: true };
    }
    const base = emptyDocument();
    return {
      doc: {
        ...base,
        ...parsed,
        profile: { ...base.profile, ...parsed.profile },
      },
      corrupted: false,
    };
  } catch {
    return { doc: emptyDocument(), corrupted: true };
  }
}

/** Writes the whole document. Throws StorageFullError when the quota is exceeded (FR-028). */
export function save(doc, storage = globalThis.localStorage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(doc));
  } catch (error) {
    if (isQuotaError(error)) throw new StorageFullError();
    throw error;
  }
}

function isQuotaError(error) {
  return (
    error &&
    (error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error.code === 22 ||
      error.code === 1014)
  );
}

/** Stores a logo once and returns its id (research R2). */
export function addLogo(doc, dataUrl) {
  const id = newId();
  doc.logos[id] = dataUrl;
  return id;
}

/** Deletes logos not used by the profile nor by any issued quote snapshot. */
export function pruneLogos(doc) {
  const used = new Set();
  if (doc.profile.logoId) used.add(doc.profile.logoId);
  for (const quote of doc.quotes) {
    if (quote.issuerSnapshot && quote.issuerSnapshot.logoId) used.add(quote.issuerSnapshot.logoId);
  }
  for (const id of Object.keys(doc.logos)) {
    if (!used.has(id)) delete doc.logos[id];
  }
}
