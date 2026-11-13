// #/perfil — freelancer profile, logo and data-storage notice (FR-001, FR-002, FR-022).
import { h, textField, radioGroup } from '../dom.js';
import { addLogo, pruneLogos } from '../store.js';
import { processLogo } from '../logo.js';

function isIPhone() {
  return /iPhone|iPad/.test(navigator.userAgent);
}

export function render(container, ctx) {
  const profile = ctx.doc.profile;
  const firstUse = !profile.onboarded;

  // undefined = logo unchanged; null = removed; string = new data URL.
  let pendingLogo;
  let defaultWithholding = profile.defaultWithholding;

  const noticeText =
    'Tus datos se guardan solo en este navegador de este dispositivo. No se sincronizan y se pierden si borras ' +
    'los datos del navegador o cambias de dispositivo.' +
    (isIPhone() ? ' En iPhone, Safari puede borrarlos si no usas la app durante unos días.' : '');

  const name = textField({ label: 'Nombre', value: profile.name, required: true });
  const nif = textField({ label: 'NIF', value: profile.nif, required: true });
  const email = textField({ label: 'Email', value: profile.email, type: 'email' });
  const phone = textField({ label: 'Teléfono', value: profile.phone, type: 'tel', inputmode: 'tel' });
  const addressInput = h('textarea', { id: 'profile-address' });
  addressInput.value = profile.address;
  const address = h('div', { class: 'field' }, h('label', { for: 'profile-address' }, 'Dirección'), addressInput);

  // ---------- Logo ----------
  const preview = h('img', { class: 'logo-preview', alt: 'Vista previa del logo' });
  const logoError = h('div', { class: 'error' });
  const removeLogo = h('button', { type: 'button' }, 'Quitar');

  function currentLogo() {
    if (pendingLogo !== undefined) return pendingLogo;
    return profile.logoId ? ctx.doc.logos[profile.logoId] || null : null;
  }

  function refreshLogo() {
    const logo = currentLogo();
    preview.hidden = !logo;
    if (logo) preview.src = logo;
    else preview.removeAttribute('src');
    removeLogo.hidden = !logo;
  }

  const fileInput = h('input', {
    type: 'file',
    accept: 'image/png,image/jpeg',
    id: 'logo-input',
    hidden: true,
    onchange: async (event) => {
      const file = event.target.files[0];
      event.target.value = '';
      if (!file) return;
      logoError.textContent = '';
      try {
        pendingLogo = await processLogo(file);
        refreshLogo();
      } catch (error) {
        logoError.textContent = error.message;
      }
    },
  });
  const uploadButton = h('button', { type: 'button', onclick: () => fileInput.click() }, 'Subir logo');
  removeLogo.addEventListener('click', () => {
    pendingLogo = null;
    refreshLogo();
  });

  const logoField = h(
    'div',
    { class: 'field' },
    h('span', { class: 'label' }, 'Logo (PNG o JPG, hasta 1 MB)'),
    preview,
    h('div', { class: 'actions' }, uploadButton, removeLogo),
    fileInput,
    logoError,
  );
  refreshLogo();

  const withholding = radioGroup({
    label: 'Retención IRPF habitual',
    name: 'default-withholding',
    selected: defaultWithholding,
    options: [
      { value: 0, label: 'No retengo' },
      { value: 15, label: '15 %' },
      { value: 7, label: '7 %' },
    ],
    onChange: (value) => {
      defaultWithholding = value;
    },
  });

  const saved = h('span', { class: 'success', role: 'status' });

  const saveButton = h(
    'button',
    {
      class: 'primary',
      onclick: () => {
        profile.name = name.input.value.trim();
        profile.nif = nif.input.value.trim();
        profile.email = email.input.value.trim();
        profile.phone = phone.input.value.trim();
        profile.address = addressInput.value.trim();
        profile.defaultWithholding = defaultWithholding;
        if (pendingLogo !== undefined) {
          profile.logoId = pendingLogo ? addLogo(ctx.doc, pendingLogo) : null;
        }
        pruneLogos(ctx.doc);
        profile.onboarded = true;

        if (!ctx.save()) return;
        if (firstUse) {
          ctx.navigate('#/presupuestos');
          return;
        }
        pendingLogo = undefined;
        saved.textContent = 'Perfil guardado';
      },
    },
    'Guardar',
  );

  container.append(
    h('h1', {}, 'Mi perfil'),
    h('div', { class: 'notice' }, noticeText),
    h(
      'div',
      { class: 'card' },
      h('p', { class: 'hint' }, 'Los campos con * son obligatorios para descargar un PDF.'),
      name.wrapper,
      nif.wrapper,
      email.wrapper,
      phone.wrapper,
      address,
      logoField,
      withholding.wrapper,
      h('div', { class: 'actions' }, saveButton, saved),
    ),
  );
}
