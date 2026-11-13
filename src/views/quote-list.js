// #/presupuestos — list of quotes, newest number first (FR-013b).
import { h } from '../dom.js';
import { formatDate, formatEuros } from '../money.js';
import { computeTotals } from '../totals.js';
import { createQuote, sortedQuotes } from '../quotes.js';
import { statusBadge } from './status-badge.js';

export function render(container, ctx) {
  const newButton = h(
    'button',
    {
      class: 'primary',
      onclick: () => {
        const quote = createQuote(ctx.doc, ctx.today());
        if (ctx.save()) ctx.navigate(`#/presupuestos/${encodeURIComponent(quote.id)}`);
      },
    },
    'Nuevo presupuesto',
  );

  const quotes = sortedQuotes(ctx.doc);
  const header = h('div', { class: 'page-header' }, h('h1', {}, 'Presupuestos'), newButton);

  if (quotes.length === 0) {
    container.append(header, h('div', { class: 'card' }, h('p', {}, 'Todavía no tienes presupuestos.')));
    return;
  }

  const listHeader = h(
    'div',
    { class: 'list-header quotes', 'aria-hidden': 'true' },
    h('span', { class: 'q-number' }, 'Número'),
    h('span', { class: 'q-client' }, 'Cliente'),
    h('span', { class: 'q-date' }, 'Fecha de emisión'),
    h('span', { class: 'q-total', style: 'text-align:right' }, 'Total'),
    h('span', { class: 'q-status' }, 'Estado'),
  );

  const items = quotes.map((quote) => {
    return h(
      'a',
      { class: 'list-item quote-row', href: `#/presupuestos/${encodeURIComponent(quote.id)}` },
      h('span', { class: 'q-number' }, quote.number),
      h('span', { class: 'q-status' }, statusBadge(quote.status)),
      h('span', { class: 'q-client' }, quote.client.name.trim() || 'Sin cliente'),
      h('span', { class: 'q-total amount' }, formatEuros(computeTotals(quote).total)),
      h('span', { class: 'q-date muted' }, formatDate(quote.issueDate)),
    );
  });

  container.append(header, h('div', { class: 'list' }, listHeader, items));
}
