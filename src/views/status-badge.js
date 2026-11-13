// Shared quote status label (FR-115): same text, dot and border style in list, editor and home.
import { h } from '../dom.js';

const LABELS = { draft: 'Borrador', issued: 'Emitido' };

export function statusBadge(status) {
  return h('span', { class: `status status--${status}` }, '● ', LABELS[status]);
}
