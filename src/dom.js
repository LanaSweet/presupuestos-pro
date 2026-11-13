// Tiny DOM helper so views stay readable without a framework.

/**
 * h('div', { class: 'card', onclick: fn }, 'text', otherNode)
 * Attributes starting with "on" become event listeners; false/null attributes are skipped.
 */
export function h(tag, attrs = {}, ...children) {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs || {})) {
    if (value === false || value === null || value === undefined) continue;
    if (key.startsWith('on') && typeof value === 'function') {
      element.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'value') {
      element.value = value;
    } else if (key === 'checked') {
      element.checked = Boolean(value);
    } else if (value === true) {
      element.setAttribute(key, '');
    } else {
      element.setAttribute(key, String(value));
    }
  }
  append(element, children);
  return element;
}

function append(parent, children) {
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    if (Array.isArray(child)) append(parent, child);
    else parent.append(child instanceof Node ? child : String(child));
  }
}

/** Text field wrapped in a labelled .field block. Returns { wrapper, input, error }. */
export function textField({ label, value = '', required = false, type = 'text', inputmode, placeholder, disabled, onInput }) {
  const id = 'f-' + Math.random().toString(36).slice(2, 9);
  const input = h('input', {
    id,
    type,
    value,
    inputmode,
    placeholder,
    disabled,
    oninput: onInput ? (event) => onInput(event.target.value, event) : null,
  });
  const error = h('div', { class: 'error' });
  const wrapper = h('div', { class: 'field' }, h('label', { for: id }, label + (required ? ' *' : '')), input, error);
  return { wrapper, input, error };
}

/** Radio group. options: [{ value, label }]. Returns { wrapper, inputs }. */
export function radioGroup({ label, name, options, selected, disabled, onChange }) {
  const inputs = [];
  const choices = options.map((option) => {
    const input = h('input', {
      type: 'radio',
      name,
      value: String(option.value),
      checked: selected !== null && selected !== undefined && String(selected) === String(option.value),
      disabled,
      onchange: () => onChange && onChange(option.value),
    });
    inputs.push(input);
    return h('label', {}, input, option.label);
  });
  const wrapper = h('div', { class: 'field', role: 'radiogroup' }, h('span', { class: 'label' }, label), h('div', { class: 'choices' }, choices));
  return { wrapper, inputs };
}
