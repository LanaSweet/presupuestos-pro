// #/ — home: new quote action, activity summary by status and links to the sections (FR-101 – FR-105).
import { h } from '../dom.js';
import { createQuote } from '../quotes.js';
import { statusBadge } from './status-badge.js';

const SECTIONS = [
  { href: '#/presupuestos', title: 'Presupuestos', help: 'Consulta, edita y descarga tus presupuestos' },
  { href: '#/catalogo', title: 'Catálogo', help: 'Gestiona tus servicios y sus precios' },
  { href: '#/perfil', title: 'Mi perfil', help: 'Tus datos y tu logo para el PDF' },
];

export function render(container, ctx) {
  // Same behaviour as the button in the quote list (FR-105).
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

  const quotes = ctx.doc.quotes;
  const drafts = quotes.filter((quote) => quote.status === 'draft').length;
  const issued = quotes.filter((quote) => quote.status === 'issued').length;

  const stat = (value, label) => h('div', { class: 'stat' }, h('span', { class: 'stat-value' }, String(value)), label);

  const summary = h(
    'section',
    { class: 'card', 'aria-labelledby': 'home-summary' },
    h('h2', { id: 'home-summary' }, 'Tus presupuestos'),
    h(
      'div',
      { class: 'stats' },
      stat(drafts, statusBadge('draft')),
      stat(issued, statusBadge('issued')),
      stat(quotes.length, h('span', { class: 'stat-label' }, 'Total')),
    ),
    quotes.length === 0 && h('p', { class: 'hint' }, 'Todavía no tienes presupuestos. Crea el primero con «Nuevo presupuesto».'),
  );

  const links = h(
    'nav',
    { class: 'home-links', 'aria-label': 'Secciones' },
    SECTIONS.map((section) =>
      h('a', { class: 'home-link', href: section.href }, h('span', { class: 'home-link-title' }, section.title), h('span', { class: 'hint' }, section.help)),
    ),
  );

  container.append(h('div', { class: 'page-header' }, h('h1', {}, 'Inicio'), newButton), summary, links);
}
