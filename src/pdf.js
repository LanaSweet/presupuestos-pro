// Builds the quote PDF with jsPDF (A4 portrait, Helvetica). Same output on every device (FR-026).
// Layout: specs/002-inicio-rediseno-visual/contracts/pdf.md. Texts are the ones of spec 001 (FR-120).
import { computeTotals, lineAmount } from './totals.js';
import { addDays, formatDate, formatEuros, formatPrice, formatQuantity } from './money.js';

const PAGE_HEIGHT = 297;
const MARGIN = 18;
const RIGHT = 210 - MARGIN;
const LINE = 5;

// Type scale in pt (contracts/design-tokens.md § Tipografía).
const SIZE = { xl: 20, lg: 12, md: 10, sm: 9, total: 14 };

// Spacing between wrapped description lines: 10 pt × 1.2 leading, in mm.
const LINE_HEIGHT_FACTOR = 1.2;
const WRAPPED_LINE = (SIZE.md * LINE_HEIGHT_FACTOR * 25.4) / 72;

// Table columns: description (left aligned) and numeric columns (right edge).
const COL = { description: MARGIN + 2, descriptionWidth: 88, quantity: 126, price: 154, vat: 170, amount: RIGHT - 2 };

// Totals block, right aligned (~75 mm).
const TOTALS_X = RIGHT - 75;

/** Only used when no theme is passed (e.g. outside the browser). The real palette lives in styles.css. */
const NEUTRAL_THEME = {
  primary: [0, 0, 0],
  primarySoft: [238, 238, 238],
  text: [0, 0, 0],
  muted: [90, 90, 90],
  border: [210, 210, 210],
  bg: [238, 238, 238],
};

const THEME_TOKENS = {
  primary: '--color-primary',
  primarySoft: '--color-primary-soft',
  text: '--color-text',
  muted: '--color-muted',
  border: '--color-border',
  bg: '--color-bg',
};

function hexToRgb(value) {
  const match = /^#([0-9a-f]{6})$/i.exec(String(value).trim());
  if (!match) return null;
  const n = parseInt(match[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Reads the PDF colors from the design tokens in :root (single source, FR-111). */
export function readPdfTheme(root = document.documentElement) {
  const style = getComputedStyle(root);
  const theme = {};
  for (const [key, token] of Object.entries(THEME_TOKENS)) {
    theme[key] = hexToRgb(style.getPropertyValue(token)) || NEUTRAL_THEME[key];
  }
  return theme;
}

/** Helvetica uses WinAnsi encoding, which has no "−" (U+2212): use a plain hyphen. */
function pdfText(value) {
  return String(value ?? '').replace(/−/g, '-');
}

function splitLines(text) {
  return pdfText(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function buildQuotePdf(quote, issuer, logoDataUrl, jsPDF = globalThis.window?.jspdf?.jsPDF, theme = NEUTRAL_THEME) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const totals = computeTotals(quote);
  const font = (style, size, color) => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
  };

  // ---------- Header, left: logo (or name) + issuer data ----------
  let y = MARGIN;
  if (logoDataUrl) {
    const props = doc.getImageProperties(logoDataUrl);
    const scale = Math.min(60 / props.width, 20 / props.height);
    const width = props.width * scale;
    const height = props.height * scale;
    doc.addImage(logoDataUrl, props.fileType, MARGIN, y, width, height);
    y += height + 6;
    font('bold', SIZE.md + 1, theme.text);
    doc.text(pdfText(issuer.name), MARGIN, y);
    y += LINE + 1;
  } else {
    // Same height as the logo area, so the header has no gap (US4-AS5).
    font('bold', SIZE.xl, theme.primary);
    doc.text(pdfText(issuer.name), MARGIN, y + 7);
    y += 14;
  }

  font('normal', SIZE.md, theme.muted);
  const issuerLines = [`NIF: ${issuer.nif}`, issuer.email, issuer.phone, ...splitLines(issuer.address)].filter(Boolean);
  for (const line of issuerLines) {
    doc.text(pdfText(line), MARGIN, y);
    y += LINE;
  }

  // ---------- Header, right: title block ----------
  font('bold', SIZE.xl, theme.primary);
  doc.text('PRESUPUESTO', RIGHT, MARGIN + 7, { align: 'right' });
  font('bold', SIZE.md, theme.text);
  doc.text(`Nº ${quote.number}`, RIGHT, MARGIN + 14, { align: 'right' });
  font('normal', SIZE.md, theme.muted);
  doc.text(`Fecha de emisión: ${formatDate(quote.issueDate)}`, RIGHT, MARGIN + 20, { align: 'right' });
  doc.text(`Válido hasta: ${formatDate(addDays(quote.issueDate, 30))}`, RIGHT, MARGIN + 26, { align: 'right' });

  // ---------- Rule in the primary color ----------
  y = Math.max(y, MARGIN + 30) + 2;
  doc.setDrawColor(...theme.primary);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, y, RIGHT, y);

  // ---------- Client ----------
  y += 10;
  font('bold', SIZE.lg, theme.primary);
  doc.text('Cliente', MARGIN, y);
  y += LINE + 1;
  font('normal', SIZE.md, theme.text);
  const clientLines = [quote.client.name, quote.client.taxId && `NIF/CIF: ${quote.client.taxId}`, ...splitLines(quote.client.address)].filter(
    Boolean,
  );
  for (const line of clientLines) {
    doc.text(pdfText(line), MARGIN, y);
    y += LINE;
  }

  // ---------- Lines table ----------
  y += 7;
  const drawTableHeader = () => {
    doc.setFillColor(...theme.bg);
    doc.rect(MARGIN, y - 5.5, RIGHT - MARGIN, 8.5, 'F');
    font('bold', SIZE.sm, theme.muted);
    doc.text('Descripción', COL.description, y);
    doc.text('Cantidad', COL.quantity, y, { align: 'right' });
    doc.text('Precio unitario', COL.price, y, { align: 'right' });
    doc.text('IVA', COL.vat, y, { align: 'right' });
    doc.text('Importe', COL.amount, y, { align: 'right' });
    font('normal', SIZE.md, theme.text);
    doc.setDrawColor(...theme.border);
    doc.setLineWidth(0.2);
    y += 9;
  };
  drawTableHeader();

  for (const line of quote.lines) {
    const descriptionLines = doc.splitTextToSize(pdfText(line.description), COL.descriptionWidth);
    const rowHeight = LINE + (descriptionLines.length - 1) * WRAPPED_LINE + 2;
    if (y + rowHeight > PAGE_HEIGHT - MARGIN) {
      doc.addPage();
      y = MARGIN + 6;
      drawTableHeader();
    }
    doc.text(descriptionLines, COL.description, y, { lineHeightFactor: LINE_HEIGHT_FACTOR });
    doc.text(pdfText(formatQuantity(line.quantity)), COL.quantity, y, { align: 'right' });
    doc.text(pdfText(formatPrice(line.unitPrice)), COL.price, y, { align: 'right' });
    doc.text(`${line.vatRate} %`, COL.vat, y, { align: 'right' });
    doc.text(pdfText(formatEuros(lineAmount(line))), COL.amount, y, { align: 'right' });
    y += rowHeight - 2;
    doc.line(MARGIN, y - 1.5, RIGHT, y - 1.5);
    y += 4;
  }

  // ---------- Totals (never split across pages) ----------
  const summaryRows = [['Base imponible', totals.base]];
  for (const vat of totals.vatByRate) summaryRows.push([`IVA (${vat.rate} %)`, vat.amount]);
  if (totals.withholdingAmount > 0) {
    summaryRows.push([`Retención IRPF (-${totals.withholdingRate} %)`, -totals.withholdingAmount]);
  }

  // 4 mm gap + one 6 mm row per item + the 12 mm total band.
  const summaryHeight = 4 + summaryRows.length * 6 + 12;
  if (y + summaryHeight > PAGE_HEIGHT - MARGIN) {
    doc.addPage();
    y = MARGIN + 6;
  }
  y += 4;
  font('normal', SIZE.md, theme.text);
  for (const [label, amount] of summaryRows) {
    doc.text(pdfText(label), TOTALS_X, y);
    doc.text(pdfText(formatEuros(amount)), COL.amount, y, { align: 'right' });
    y += 6;
  }

  // Total: tinted band + rule in the primary color; prominent by size and weight too (FR-121).
  const bandTop = y - 2;
  doc.setFillColor(...theme.primarySoft);
  doc.rect(TOTALS_X - 3, bandTop, RIGHT - TOTALS_X + 3, 11, 'F');
  doc.setDrawColor(...theme.primary);
  doc.setLineWidth(0.5);
  doc.line(TOTALS_X - 3, bandTop, RIGHT, bandTop);
  y = bandTop + 7.5;
  font('bold', SIZE.total, theme.primary);
  doc.text('Total', TOTALS_X, y);
  doc.text(pdfText(formatEuros(totals.total)), COL.amount, y, { align: 'right' });

  return doc;
}

/** Downloads (Android/desktop) or opens in the system viewer (iPhone) — FR-025. */
export function downloadQuotePdf(quote, issuer, logoDataUrl) {
  buildQuotePdf(quote, issuer, logoDataUrl, undefined, readPdfTheme()).save(`Presupuesto-${quote.number}.pdf`);
}
