// #/presupuestos/<id> — edit a draft, download the PDF, duplicate or delete (contracts/ui.md).
import { h, textField, radioGroup } from '../dom.js';
import {
  addDays,
  formatDate,
  formatEuros,
  formatPriceNumber,
  formatQuantity,
  maskDate,
  parseDate,
  parsePrice,
  parseQuantity,
} from '../money.js';
import { computeTotals, lineAmount, VAT_RATES } from '../totals.js';
import {
  MESSAGES,
  deleteQuote,
  duplicateQuote,
  issueBlockers,
  issueQuote,
  lineFromService,
  newManualLine,
  validateLine,
} from '../quotes.js';
import { downloadQuotePdf } from '../pdf.js';
import { statusBadge } from './status-badge.js';

/** Lines whose errors are visible (edited by the user or after a download attempt). */
const touchedLines = new Set();
/** Blockers from the last download attempt, shown once after re-rendering. */
const pendingBlockers = new Map();

export function render(container, ctx, id) {
  const quote = ctx.doc.quotes.find((item) => item.id === id);
  if (!quote) {
    container.append(
      h('div', { class: 'card' }, h('p', {}, 'Este presupuesto no existe.'), h('a', { class: 'button', href: '#/presupuestos' }, 'Volver a la lista')),
    );
    return;
  }

  const isDraft = quote.status === 'draft';
  const rerender = () => {
    container.replaceChildren();
    render(container, ctx, id);
  };

  const summaryBody = h('tbody');
  const blockersList = h('ul', { class: 'blockers' });

  function updateSummary() {
    const totals = computeTotals(quote);
    const rows = [h('tr', {}, h('td', {}, 'Base imponible'), h('td', {}, formatEuros(totals.base)))];
    for (const vat of totals.vatByRate) {
      rows.push(h('tr', {}, h('td', {}, `IVA (${vat.rate} %)`), h('td', {}, formatEuros(vat.amount))));
    }
    if (totals.withholdingAmount > 0) {
      rows.push(
        h('tr', {}, h('td', {}, `Retención IRPF (−${totals.withholdingRate} %)`), h('td', {}, formatEuros(-totals.withholdingAmount))),
      );
    }
    rows.push(h('tr', { class: 'total' }, h('td', {}, 'Total'), h('td', {}, formatEuros(totals.total))));
    summaryBody.replaceChildren(...rows);
  }

  // ---------- Header ----------
  const validUntil = h('span', {}, formatDate(addDays(quote.issueDate, 30)));
  let dateBlock;
  if (isDraft) {
    const dateField = textField({
      label: 'Fecha de emisión',
      value: formatDate(quote.issueDate),
      inputmode: 'numeric',
      placeholder: 'DD/MM/AAAA',
      onInput: (value, event) => {
        const masked = maskDate(value);
        event.target.value = masked;
        if (masked.length < 10) {
          dateField.error.textContent = '';
          return;
        }
        const iso = parseDate(masked);
        if (!iso) {
          dateField.error.textContent = 'Fecha no válida';
          return;
        }
        dateField.error.textContent = '';
        quote.issueDate = iso;
        validUntil.textContent = formatDate(addDays(iso, 30));
        ctx.save();
      },
    });
    dateField.input.addEventListener('blur', () => {
      if (!parseDate(dateField.input.value)) dateField.error.textContent = 'Fecha no válida';
    });
    dateBlock = dateField.wrapper;
  } else {
    dateBlock = h('p', {}, h('strong', {}, 'Fecha de emisión: '), formatDate(quote.issueDate));
  }

  const header = h(
    'div',
    { class: 'card' },
    h(
      'div',
      { class: 'page-header' },
      h('h1', {}, `Presupuesto ${quote.number}`),
      statusBadge(quote.status),
    ),
    dateBlock,
    h('p', {}, h('strong', {}, 'Válido hasta: '), validUntil),
  );

  // ---------- Client ----------
  const clientName = textField({
    label: 'Nombre del cliente',
    value: quote.client.name,
    required: true,
    disabled: !isDraft,
    onInput: (value) => {
      quote.client.name = value;
      ctx.save();
    },
  });
  const clientTaxId = textField({
    label: 'NIF/CIF',
    value: quote.client.taxId,
    disabled: !isDraft,
    onInput: (value) => {
      quote.client.taxId = value;
      ctx.save();
    },
  });
  const addressId = 'client-address';
  const clientAddress = h(
    'div',
    { class: 'field' },
    h('label', { for: addressId }, 'Dirección'),
    h('textarea', {
      id: addressId,
      disabled: !isDraft,
      oninput: (event) => {
        quote.client.address = event.target.value;
        ctx.save();
      },
    }),
  );
  clientAddress.querySelector('textarea').value = quote.client.address;

  const clientType = radioGroup({
    label: 'Tipo de cliente *',
    name: 'client-type',
    selected: quote.client.type,
    disabled: !isDraft,
    options: [
      { value: 'business', label: 'Empresa/autónomo' },
      { value: 'individual', label: 'Particular' },
    ],
    onChange: (value) => {
      quote.client.type = value;
      ctx.save();
      rerender();
    },
  });

  // ---------- Withholding ----------
  const isBusiness = quote.client.type === 'business';
  const withholding = radioGroup({
    label: 'Retención IRPF',
    name: 'withholding',
    selected: quote.withholding,
    disabled: !isDraft || !isBusiness,
    options: [
      { value: 0, label: 'No' },
      { value: 15, label: '15 %' },
      { value: 7, label: '7 %' },
    ],
    onChange: (value) => {
      quote.withholding = value;
      ctx.save();
      updateSummary();
    },
  });
  let withholdingHint = null;
  if (quote.client.type === 'individual') withholdingHint = 'A particulares no se aplica retención';
  else if (quote.client.type === null) withholdingHint = 'Elige el tipo de cliente para aplicar la retención';

  const clientCard = h(
    'div',
    { class: isDraft ? 'card' : 'card readonly' },
    h('h2', {}, 'Cliente'),
    clientName.wrapper,
    clientTaxId.wrapper,
    clientAddress,
    clientType.wrapper,
    withholding.wrapper,
    withholdingHint && h('p', { class: 'hint' }, withholdingHint),
  );

  // ---------- Lines ----------
  function buildLine(line) {
    const amount = h('span', { class: 'line-amount' }, formatEuros(lineAmount(line)));
    const errors = h('div', { class: 'line-errors error' });

    function refresh() {
      amount.textContent = formatEuros(lineAmount(line));
      errors.textContent = touchedLines.has(line.id) ? validateLine(line).join('. ') : '';
      updateSummary();
    }

    function onEdit(apply) {
      return (value) => {
        apply(value);
        touchedLines.add(line.id);
        ctx.save();
        refresh();
      };
    }

    const description = textField({
      label: 'Descripción',
      value: line.description,
      disabled: !isDraft,
      onInput: onEdit((value) => {
        line.description = value;
      }),
    });
    description.wrapper.classList.add('f-description');

    const quantity = textField({
      label: 'Cantidad',
      value: Number.isInteger(line.quantity) ? formatQuantity(line.quantity) : '',
      inputmode: 'decimal',
      disabled: !isDraft,
      onInput: onEdit((value) => {
        line.quantity = parseQuantity(value);
      }),
    });

    const price = textField({
      label: 'Precio unitario (€)',
      value: Number.isInteger(line.unitPrice) ? formatPriceNumber(line.unitPrice) : '',
      inputmode: 'decimal',
      disabled: !isDraft,
      onInput: onEdit((value) => {
        line.unitPrice = parsePrice(value);
      }),
    });

    const vatId = `vat-${line.id}`;
    const vatSelect = h(
      'select',
      {
        id: vatId,
        disabled: !isDraft,
        onchange: (event) => {
          line.vatRate = Number(event.target.value);
          ctx.save();
          refresh();
        },
      },
      VAT_RATES.map((rate) => h('option', { value: String(rate) }, `${rate} %`)),
    );
    vatSelect.value = String(line.vatRate);
    const vat = h('div', { class: 'field' }, h('label', { for: vatId }, 'IVA'), vatSelect);

    const removeButton =
      isDraft &&
      h(
        'button',
        {
          class: 'danger',
          'aria-label': 'Borrar línea',
          title: 'Borrar línea',
          onclick: () => {
            quote.lines = quote.lines.filter((item) => item.id !== line.id);
            touchedLines.delete(line.id);
            ctx.save();
            rerender();
          },
        },
        '✕',
      );

    refresh();
    return h(
      'div',
      { class: 'line line-row' },
      h('div', { class: 'line-fields' }, description.wrapper, quantity.wrapper, price.wrapper, vat),
      h('div', { class: 'line-footer' }, amount, removeButton),
      errors,
    );
  }

  const linesHeader = h(
    'div',
    { class: 'lines-header', 'aria-hidden': 'true' },
    h('span', {}, 'Descripción'),
    h('span', {}, 'Cantidad'),
    h('span', {}, 'Precio unitario'),
    h('span', {}, 'IVA'),
    h('span', { style: 'text-align:right' }, 'Importe'),
    h('span', {}),
  );

  let addLineActions = null;
  if (isDraft) {
    const addManual = h(
      'button',
      {
        onclick: () => {
          quote.lines.push(newManualLine());
          ctx.save();
          rerender();
        },
      },
      'Añadir línea manual',
    );

    let fromCatalog;
    if (ctx.doc.services.length === 0) {
      fromCatalog = h('a', { class: 'button', href: '#/catalogo' }, 'Añade servicios al catálogo');
    } else {
      fromCatalog = h(
        'select',
        {
          'aria-label': 'Añadir del catálogo',
          onchange: (event) => {
            const service = ctx.doc.services.find((item) => item.id === event.target.value);
            if (!service) return;
            quote.lines.push(lineFromService(service));
            ctx.save();
            rerender();
          },
        },
        h('option', { value: '' }, 'Añadir del catálogo…'),
        ctx.doc.services.map((service) => h('option', { value: service.id }, service.name)),
      );
      fromCatalog.style.minHeight = 'var(--touch)';
    }
    addLineActions = h('div', { class: 'actions' }, fromCatalog, addManual);
  }

  const linesCard = h(
    'div',
    { class: isDraft ? 'card' : 'card readonly' },
    h('h2', {}, 'Líneas'),
    quote.lines.length > 0 && linesHeader,
    quote.lines.map(buildLine),
    quote.lines.length === 0 && h('p', { class: 'hint' }, 'Este presupuesto todavía no tiene líneas.'),
    addLineActions,
  );

  // ---------- Summary & actions ----------
  function showBlockers(blockers) {
    blockersList.replaceChildren(
      ...blockers.map((text) =>
        text === MESSAGES.profileMissing ? h('li', {}, text, ' — ', h('a', { href: '#/perfil' }, 'Ir a Mi perfil')) : h('li', {}, text),
      ),
    );
  }

  function onDownload() {
    if (isDraft) {
      const blockers = issueBlockers(ctx.doc, quote);
      if (blockers.length > 0) {
        quote.lines.forEach((line) => touchedLines.add(line.id));
        pendingBlockers.set(id, blockers);
        rerender();
        return;
      }
      if (!confirm('Al descargar, el presupuesto quedará emitido y ya no podrás modificarlo. ¿Continuar?')) return;
      issueQuote(ctx.doc, quote);
      if (!ctx.save()) return;
    }

    const issuer = quote.issuerSnapshot;
    const logo = issuer.logoId ? ctx.doc.logos[issuer.logoId] || null : null;
    try {
      downloadQuotePdf(quote, issuer, logo);
    } catch (error) {
      ctx.showMessage(`No se ha podido generar el PDF: ${error.message}`);
    }
    if (isDraft) rerender();
  }

  const actions = h(
    'div',
    { class: 'actions' },
    h('button', { class: 'primary', onclick: onDownload }, 'Descargar PDF'),
    h(
      'button',
      {
        onclick: () => {
          const copy = duplicateQuote(ctx.doc, quote, ctx.today());
          if (ctx.save()) ctx.navigate(`#/presupuestos/${encodeURIComponent(copy.id)}`);
        },
      },
      'Duplicar',
    ),
    isDraft &&
      h(
        'button',
        {
          class: 'danger',
          onclick: () => {
            if (!confirm('¿Borrar este presupuesto?')) return;
            deleteQuote(ctx.doc, quote);
            if (ctx.save()) ctx.navigate('#/presupuestos');
          },
        },
        'Borrar',
      ),
  );

  const summary = h('div', { class: 'card summary' }, h('h2', {}, 'Resumen'), h('table', {}, summaryBody), blockersList, actions);

  updateSummary();
  showBlockers(pendingBlockers.get(id) || []);
  pendingBlockers.delete(id);
  container.append(header, clientCard, linesCard, summary);
}
