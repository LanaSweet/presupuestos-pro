// Entry point: loads data, hash routing and shared context for the views.
import * as store from './store.js';
import { todayIso } from './money.js';
import { h } from './dom.js';
import * as homeView from './views/home.js';
import * as profileView from './views/profile.js';
import * as catalogView from './views/catalog.js';
import * as quoteListView from './views/quote-list.js';
import * as quoteEditorView from './views/quote-editor.js';

const appElement = document.getElementById('app');
const messageElement = document.getElementById('message');
const headerElement = document.querySelector('.app-header');
const navElement = document.querySelector('.main-nav');
const menuToggle = document.querySelector('.menu-toggle');

const ctx = {
  doc: null,
  today: () => todayIso(),
  navigate(hash) {
    if (location.hash === hash) render();
    else location.hash = hash;
  },
  showMessage(text, ...extra) {
    messageElement.replaceChildren(text, ...extra);
  },
  clearMessage() {
    messageElement.replaceChildren();
  },
  /** Persists ctx.doc. On a full storage, reloads the saved data and returns false (FR-028). */
  save() {
    try {
      store.save(ctx.doc);
      return true;
    } catch (error) {
      if (error instanceof store.StorageFullError) {
        ctx.doc = store.load().doc;
        ctx.showMessage('No queda espacio en este navegador. El último cambio no se ha guardado.');
        render();
        return false;
      }
      throw error;
    }
  },
};

function parseRoute() {
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  return { name: parts[0] || 'inicio', id: parts[1] ? decodeURIComponent(parts[1]) : null };
}

// ---------- Mobile menu (FR-109): toggle, close on navigation, Escape or outside tap ----------

function setMenuOpen(open) {
  headerElement.classList.toggle('is-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
}

function isMenuOpen() {
  return headerElement.classList.contains('is-open');
}

menuToggle.addEventListener('click', () => setMenuOpen(!isMenuOpen()));

// Choosing the current section fires no hashchange: close the menu here too.
navElement.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenuOpen(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && isMenuOpen()) {
    setMenuOpen(false);
    menuToggle.focus();
  }
});

document.addEventListener('click', (event) => {
  if (isMenuOpen() && !headerElement.contains(event.target)) setMenuOpen(false);
});

/** Hides the navigation while the corrupted-data notice is shown (FR-110). */
function setNavigationHidden(hidden) {
  navElement.hidden = hidden;
  menuToggle.hidden = hidden;
}

function render() {
  let route = parseRoute();
  if (!ctx.doc.profile.onboarded && route.name !== 'perfil') {
    location.replace('#/perfil');
    route = { name: 'perfil', id: null };
  }

  // The quote editor (#/presupuestos/<id>) marks Presupuestos too (FR-108).
  for (const link of navElement.querySelectorAll('a')) {
    if (link.dataset.route === route.name) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }

  appElement.replaceChildren();
  switch (route.name) {
    case 'inicio':
      homeView.render(appElement, ctx);
      break;
    case 'perfil':
      profileView.render(appElement, ctx);
      break;
    case 'catalogo':
      catalogView.render(appElement, ctx);
      break;
    case 'presupuestos':
      if (route.id) quoteEditorView.render(appElement, ctx, route.id);
      else quoteListView.render(appElement, ctx);
      break;
    default:
      ctx.navigate('#/');
  }
  window.scrollTo(0, 0);
}

/** Data could not be read: never overwrite it without explicit confirmation (FR-029). */
function renderCorrupted() {
  setNavigationHidden(true);
  const reset = h(
    'button',
    {
      class: 'danger',
      onclick: () => {
        if (!confirm('Se borrarán todos tus datos. ¿Continuar?')) return;
        ctx.doc = store.emptyDocument();
        if (!ctx.save()) return;
        ctx.clearMessage();
        setNavigationHidden(false);
        start();
      },
    },
    'Empezar de cero',
  );
  ctx.showMessage('No se han podido leer tus datos guardados.', h('div', { class: 'actions' }, reset));
}

function start() {
  window.addEventListener('hashchange', () => {
    setMenuOpen(false);
    ctx.clearMessage();
    render();
  });
  render();
}

const loaded = store.load();
ctx.doc = loaded.doc;
if (loaded.corrupted) renderCorrupted();
else start();
