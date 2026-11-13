// Pure money/date helpers. Units (research R4): quantity in hundredths,
// unit price in thousandths of a euro, amounts in cents. Never floats.

const MINUS = '−'; // "−"

/** Integer division rounding half away from zero (half-up for non-negatives). */
export function roundHalfUp(numerator, denominator) {
  const sign = numerator < 0 ? -1 : 1;
  const abs = Math.abs(numerator);
  const quotient = Math.floor(abs / denominator);
  const remainder = abs - quotient * denominator;
  return sign * (remainder * 2 >= denominator ? quotient + 1 : quotient);
}

/**
 * Parses a Spanish-style decimal ("1.500,25", "1500,25", "1500.25", "-3")
 * into an integer scaled by 10^maxDecimals. Returns null when invalid or when
 * it has more decimals than allowed.
 */
function parseScaled(text, maxDecimals) {
  if (text === null || text === undefined) return null;
  let value = String(text).trim().replace(/\s/g, '').replace(MINUS, '-');
  if (value === '') return null;

  let negative = false;
  if (value.startsWith('-')) {
    negative = true;
    value = value.slice(1);
  }

  if (value.includes(',')) {
    // Comma is the decimal separator; dots are thousands separators.
    if (!/^\d{1,3}(\.\d{3})*,\d*$|^\d+,\d*$/.test(value)) return null;
    value = value.replace(/\./g, '').replace(',', '.');
  } else if (/^\d{1,3}(\.\d{3})+$/.test(value)) {
    // "1.500" -> thousands separator.
    value = value.replace(/\./g, '');
  }

  if (!/^\d+(\.\d*)?$/.test(value)) return null;
  const [intPart, decPart = ''] = value.split('.');
  if (decPart.length > maxDecimals) return null;

  const scaled = Number(intPart) * 10 ** maxDecimals + Number(decPart.padEnd(maxDecimals, '0') || 0);
  if (!Number.isSafeInteger(scaled)) return null;
  return negative ? -scaled : scaled;
}

/** "1,5" -> 150 (hundredths). Up to 2 decimals. */
export function parseQuantity(text) {
  return parseScaled(text, 2);
}

/** "0,785" -> 785, "1.500" -> 1500000 (thousandths of a euro). Up to 3 decimals. */
export function parsePrice(text) {
  return parseScaled(text, 3);
}

function groupThousands(intString) {
  return intString.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** Formats an integer scaled by 10^scale with `decimals` digits, Spanish style. */
function formatScaled(value, scale, decimals) {
  const negative = value < 0;
  const abs = Math.abs(value);
  const divisor = 10 ** scale;
  const intPart = Math.floor(abs / divisor);
  const decPart = String(abs % divisor).padStart(scale, '0').slice(0, decimals);
  const text = groupThousands(String(intPart)) + (decimals > 0 ? ',' + decPart : '');
  return (negative ? MINUS : '') + text;
}

/** 150000 -> "1.500,00 €"; -30000 -> "−300,00 €". */
export function formatEuros(cents) {
  return formatScaled(cents, 2, 2) + ' €';
}

/** Price in thousandths: 2 decimals, or 3 when the third is not zero. */
export function formatPrice(thousandths) {
  return formatPriceNumber(thousandths) + ' €';
}

/** Same as formatPrice but without the euro sign (for editable inputs). */
export function formatPriceNumber(thousandths) {
  const decimals = Math.abs(thousandths) % 10 === 0 ? 2 : 3;
  return formatScaled(thousandths, 3, decimals);
}

/** 150 -> "1,5"; 100 -> "1"; 125 -> "1,25". */
export function formatQuantity(hundredths) {
  const negative = hundredths < 0;
  const abs = Math.abs(hundredths);
  const intPart = Math.floor(abs / 100);
  const decPart = String(abs % 100).padStart(2, '0').replace(/0+$/, '');
  return (negative ? MINUS : '') + groupThousands(String(intPart)) + (decPart ? ',' + decPart : '');
}

/** "2026-11-12" -> "12/11/2026". */
export function formatDate(iso) {
  if (!iso) return '';
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}

/** "12/11/2026" -> "2026-11-12"; null if malformed or the date does not exist. */
export function parseDate(text) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(text || '').trim());
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (month < 1 || month > 12 || day < 1) return null;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day > daysInMonth) return null;
  return `${match[3]}-${match[2]}-${match[1]}`;
}

/** Keeps up to 8 digits and inserts slashes: "1211" -> "12/11", "12112026" -> "12/11/2026". */
export function maskDate(text) {
  const digits = String(text || '').replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** addDays("2026-11-12", 30) -> "2026-12-12". */
export function addDays(iso, days) {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

/** Local calendar date as ISO "YYYY-MM-DD". */
export function todayIso(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
