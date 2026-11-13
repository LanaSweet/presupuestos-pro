// #/catalogo — services with a default price (FR-004, FR-005).
import { h, textField } from '../dom.js';
import { formatPrice, formatPriceNumber, parsePrice } from '../money.js';
import { newId } from '../store.js';

export function render(container, ctx) {
  let editingId = null;

  const name = textField({ label: 'Nombre del servicio', required: true });
  const price = textField({ label: 'Precio por defecto (€)', required: true, inputmode: 'decimal' });
  const submit = h('button', { class: 'primary' }, 'Añadir servicio');
  const cancel = h('button', { hidden: true }, 'Cancelar');
  const list = h('div');

  function resetForm() {
    editingId = null;
    name.input.value = '';
    price.input.value = '';
    name.error.textContent = '';
    price.error.textContent = '';
    submit.textContent = 'Añadir servicio';
    cancel.hidden = true;
  }

  function validate() {
    const serviceName = name.input.value.trim();
    const defaultPrice = parsePrice(price.input.value);
    name.error.textContent = serviceName ? '' : 'Escribe el nombre del servicio';
    if (defaultPrice === null) price.error.textContent = 'Precio no válido (hasta 3 decimales)';
    else if (defaultPrice < 0) price.error.textContent = 'El precio no puede ser negativo';
    else price.error.textContent = '';
    if (!serviceName || defaultPrice === null || defaultPrice < 0) return null;
    return { name: serviceName, defaultPrice };
  }

  submit.addEventListener('click', () => {
    const data = validate();
    if (!data) return;
    if (editingId) {
      const service = ctx.doc.services.find((item) => item.id === editingId);
      Object.assign(service, data);
    } else {
      ctx.doc.services.push({ id: newId(), ...data });
    }
    if (!ctx.save()) return;
    resetForm();
    renderList();
  });
  cancel.addEventListener('click', resetForm);

  function renderList() {
    const services = ctx.doc.services;
    if (services.length === 0) {
      list.replaceChildren(h('p', { class: 'hint' }, 'Todavía no hay servicios en el catálogo.'));
      return;
    }
    const header = h(
      'div',
      { class: 'list-header services', 'aria-hidden': 'true' },
      h('span', {}, 'Servicio'),
      h('span', { style: 'text-align:right' }, 'Precio por defecto'),
      h('span', {}),
    );
    const rows = services.map((service) =>
      h(
        'div',
        { class: 'list-item service-row' },
        h('span', { class: 's-name' }, service.name),
        h('span', { class: 's-price amount' }, formatPrice(service.defaultPrice)),
        h(
          'span',
          { class: 's-actions actions' },
          h(
            'button',
            {
              onclick: () => {
                editingId = service.id;
                name.input.value = service.name;
                price.input.value = formatPriceNumber(service.defaultPrice);
                submit.textContent = 'Guardar';
                cancel.hidden = false;
                name.input.focus();
              },
            },
            'Editar',
          ),
          h(
            'button',
            {
              class: 'danger',
              onclick: () => {
                if (!confirm(`¿Borrar «${service.name}» del catálogo?`)) return;
                ctx.doc.services = ctx.doc.services.filter((item) => item.id !== service.id);
                if (!ctx.save()) return;
                if (editingId === service.id) resetForm();
                renderList();
              },
            },
            'Borrar',
          ),
        ),
      ),
    );
    list.replaceChildren(h('div', { class: 'list' }, header, rows));
  }

  container.append(
    h('h1', {}, 'Catálogo'),
    h('div', { class: 'card' }, name.wrapper, price.wrapper, h('div', { class: 'actions' }, submit, cancel)),
    h('h2', {}, 'Servicios'),
    list,
  );
  renderList();
}
