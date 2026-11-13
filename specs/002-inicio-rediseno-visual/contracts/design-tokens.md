# Contract: tokens de diseño

Única fuente: el `:root` de `styles.css` (FR-111). Ningún otro archivo escribe colores, tamaños de
letra ni separaciones en bruto: los componentes CSS usan `var(--…)` y `pdf.js` lee los colores con
`getComputedStyle`. Los tokens no se redefinen en `@media`.

## Color

| Token | Valor | Uso |
|---|---|---|
| `--color-primary` | `#1f3a5f` | Acción principal, enlace activo, filetes y total del PDF |
| `--color-primary-hover` | `#152a45` | Botón primario al pasar el ratón o al pulsarlo (blanco encima: 14,49:1) |
| `--color-primary-soft` | `#e3ebf6` | Fondos suaves (etiqueta Emitido, banda del total) |
| `--color-on-primary` | `#ffffff` | Texto sobre el color principal |
| `--color-text` | `#1b2430` | Texto normal y títulos |
| `--color-muted` | `#5a6472` | Texto secundario, cabeceras de tabla |
| `--color-border-strong` | `#8a94a3` | Bordes de campos de formulario (≥ 3:1) |
| `--color-border` | `#d9dee5` | Separadores y bordes decorativos |
| `--color-bg` | `#f6f7f9` | Fondo de página y cabeceras de tabla |
| `--color-surface` | `#ffffff` | Tarjetas, tablas, formularios |
| `--color-danger` / `--color-danger-soft` | `#a1271f` / `#fbe9e7` | Errores, botón de borrar |
| `--color-warning` / `--color-warning-soft` | `#6b4a00` / `#fdf3dc` | Avisos (datos solo en este navegador) |
| `--color-success` / `--color-success-soft` | `#1e6b3a` / `#e5f3ea` | Confirmaciones («Guardado») |
| `--status-draft` / `--status-draft-soft` | `#475467` / `#eef1f5` | Etiqueta Borrador |
| `--status-issued` / `--status-issued-soft` | `#1f3a5f` / `#e3ebf6` | Etiqueta Emitido |
| `--status-sent` / `--status-sent-soft` | `#1d4f91` / `#e6effa` | Reservado, sin uso (FR-104) |
| `--status-accepted` / `--status-accepted-soft` | `#1e6b3a` / `#e5f3ea` | Reservado, sin uso |
| `--status-rejected` / `--status-rejected-soft` | `#a1271f` / `#fbe9e7` | Reservado, sin uso |
| `--status-expired` / `--status-expired-soft` | `#8a5a00` / `#fdf3dc` | Reservado, sin uso |

Los contrastes están medidos en [research.md § R4](../research.md).

## Tipografía

`--font-sans: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`. En el PDF se usa Helvetica.

| Nivel | Token | App | PDF | Peso | Uso |
|---|---|---|---|---|---|
| Título de página | `--text-xl` | 1.5rem (24 px) | 20 pt | 700 | Un `h1` por pantalla; «PRESUPUESTO» |
| Título de sección | `--text-lg` | 1.125rem (18 px) | 12 pt | 600 | `h2` de tarjeta; títulos «De» / «Para» |
| Texto normal | `--text-md` | 1rem (16 px) | 10 pt | 400 | Cuerpo, campos (mínimo 16 px por iOS) |
| Texto secundario | `--text-sm` | 0.875rem (14 px) | 9 pt | 400/600 | Ayudas, cabeceras de tabla, etiquetas de estado |
| Total | `--text-total` | 1.375rem (22 px) | 14 pt | 700 | Total final (pantalla de edición y PDF) |

Altura de línea: `--leading: 1.5` (texto) y `1.2` (títulos). Las cifras de importes usan
`tabular-nums`.

## Espaciado y forma

| Token | Valor |
|---|---|
| `--space-1` … `--space-6` | 4, 8, 12, 16, 24, 32 px |
| `--radius-sm` / `--radius` | 4 px (campos, etiquetas) / 8 px (tarjetas) |
| `--touch` | 44 px (zona táctil mínima) |
| `--header-height` | 56 px |
| `--content-max` | 960 px |

Reglas: entre tarjetas `--space-4`; dentro de una tarjeta `--space-4`; entre campos `--space-3`;
entre la etiqueta y su campo `--space-1`; el título de página tiene debajo `--space-5`.

## Componentes (clases)

- **Botones**:
  - `.primary`: fondo del color principal, una sola acción principal por pantalla.
  - Por defecto (secundario): fondo de superficie con borde fuerte.
  - `.danger`: texto y borde de error.
  - Todos los botones miden al menos 44 px.
- **Campos**: etiqueta encima en `--text-sm` 600; los obligatorios llevan « *»; la ayuda en
  `.hint`; el error en `.error` bajo el campo, y el campo con error queda con el borde en
  `--color-danger`.
- **Etiqueta de estado** (`.status`, `.status--draft`, `.status--issued`): punto «●», texto en
  `--text-sm` 600, radio `--radius-sm`. Borrador lleva borde discontinuo y Emitido borde continuo.
- **Totales** (`.summary`): filas en `--text-md`, y el total en `--text-total` con borde superior
  del color principal.
- **Mensajes**: `#message` usa `--color-danger-soft` y `.notice` usa `--color-warning-soft`, los dos
  con su texto oscuro.
