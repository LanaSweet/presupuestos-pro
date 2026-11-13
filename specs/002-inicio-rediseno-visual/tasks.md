---

description: "Task list for 002-inicio-rediseno-visual"
---

# Tasks: Página de inicio, navegación común y rediseño visual

**Input**: Design documents from `specs/002-inicio-rediseno-visual/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/ui.md](contracts/ui.md), [contracts/design-tokens.md](contracts/design-tokens.md), [contracts/pdf.md](contracts/pdf.md), [quickstart.md](quickstart.md)

**Tests**: la spec no pide pruebas nuevas. La no regresión se apoya en las pruebas existentes de la
001 (`node --test tests/`), que MUST seguir en verde **sin modificarlas** (SC-104), y en la
validación manual de [quickstart.md](quickstart.md).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Proyecto estático único en la raíz (plan de la 001). **Solo se pueden tocar** `index.html`,
`styles.css`, `src/app.js`, `src/views/*` y `src/pdf.js`. **No se tocan** `src/money.js`,
`src/totals.js`, `src/quotes.js`, `src/store.js`, `src/logo.js`, `tests/`, `vendor/` ni
`package.json` ([research.md § R1](research.md)).

---

## Phase 1: Setup (línea base de no regresión)

**Purpose**: dejar una referencia para demostrar que la lógica, los datos y el contenido del PDF no
cambian.

- [X] T001 Ejecutar `node --test tests/` y anotar el resultado (todas en verde) en specs/002-inicio-rediseno-visual/baseline.md
- [X] T002 Calcular `sha256sum` de src/money.js, src/totals.js, src/quotes.js, src/store.js, src/logo.js, tests/*.js, vendor/jspdf.umd.min.js y package.json, y guardarlos en specs/002-inicio-rediseno-visual/baseline.md
- [X] T003 Generar con la versión actual el PDF del ejemplo de referencia de la 001 (sección «Reglas de negocio» de specs/001-presupuestos-pdf/spec.md), anotar en specs/002-inicio-rediseno-visual/baseline.md todos sus textos e importes y guardar el archivo como specs/002-inicio-rediseno-visual/baseline-Presupuesto.pdf

---

## Phase 2: Foundational (bloquea todas las historias)

**Purpose**: los tokens de diseño y la etiqueta de estado común, que usan todas las historias.

**⚠️ CRITICAL**: no se empieza ninguna historia hasta terminar esta fase.

- [X] T004 Sustituir el bloque `:root` de styles.css por todos los tokens de [contracts/design-tokens.md](contracts/design-tokens.md): color (`--color-primary` `#1f3a5f`, `--color-primary-hover` `#152a45`, `--color-primary-soft` `#e3ebf6`, `--color-on-primary` `#ffffff`, `--color-text` `#1b2430`, `--color-muted` `#5a6472`, `--color-border-strong` `#8a94a3`, `--color-border` `#d9dee5`, `--color-bg` `#f6f7f9`, `--color-surface` `#ffffff`, danger/warning/success con sus `-soft`, y `--status-draft|issued|sent|accepted|rejected|expired` con sus `-soft`), tipografía (`--font-sans`, `--text-xl|lg|md|sm|total`, `--leading`), espaciado (`--space-1`…`--space-6` = 4/8/12/16/24/32 px), `--radius-sm` 4 px, `--radius` 8 px, `--touch` 44 px, `--header-height` 56 px y `--content-max` 960 px. Los tokens MUST NOT redefinirse en ningún `@media` (FR-111, FR-026)
- [X] T005 Reescribir las reglas base de styles.css (`body`, `h1`, `h2`, `main`, `.card`, `.hint`, cifras con `font-variant-numeric: tabular-nums`) para que usen solo `var(--…)`, sin colores, tamaños de letra ni separaciones en bruto. Mantener el mínimo de 16 px en `input`, `select` y `textarea` y el comportamiento de `[hidden]` (FR-112, FR-113)
- [X] T006 [P] Crear src/views/status-badge.js, que exporte `statusBadge(status)`: `'draft'` → `<span class="status status--draft">● Borrador</span>` y `'issued'` → `<span class="status status--issued">● Emitido</span>`, usando `h` de src/dom.js (FR-115, [research.md § R5](research.md))
- [X] T007 Añadir a styles.css el componente `.status`: `--text-sm` 600, radio `--radius-sm`, relleno `--space-1` `--space-2`. `.status--draft` con color `--status-draft`, fondo `--status-draft-soft` y borde de 1 px **discontinuo**; `.status--issued` con color `--status-issued`, fondo `--status-issued-soft` y borde de 1 px **continuo**. Eliminar las reglas `.badge` y `.badge.issued`

**Checkpoint**: tokens y etiqueta listos; la app sigue funcionando con los estilos base.

---

## Phase 3: User Story 1 - Ver de un vistazo la actividad al abrir la app (Priority: P1) 🎯 MVP

**Goal**: la dirección principal abre una página de inicio con «Nuevo presupuesto», el resumen por
estado y accesos a las tres secciones.

**Independent Test**: con el perfil configurado y presupuestos en ambos estados, abrir
`http://localhost:3000/` y comprobar los recuentos, el botón y los accesos ([quickstart.md](quickstart.md) pasos 1 a 6).

- [X] T008 [US1] Crear src/views/home.js con `render(container, ctx)`, según [contracts/ui.md § Inicio](contracts/ui.md):
  - (1) Cabecera `.page-header` con `h1` «Inicio» y botón `.primary` «Nuevo presupuesto». Su manejador es idéntico al de src/views/quote-list.js: `createQuote(ctx.doc, ctx.today())`, y si `ctx.save()` devuelve true, `ctx.navigate('#/presupuestos/' + encodeURIComponent(quote.id))` (FR-105).
  - (2) Tarjeta con `h2` «Tus presupuestos» y tres cifras: Borrador (nº de `ctx.doc.quotes` con `status === 'draft'`, con `statusBadge('draft')`), Emitido (nº con `status === 'issued'`, con `statusBadge('issued')`) y Total (`ctx.doc.quotes.length`) (FR-103, FR-104, [data-model.md](data-model.md)).
  - (3) Si no hay presupuestos, el texto «Todavía no tienes presupuestos. Crea el primero con «Nuevo presupuesto».» (FR-105).
  - (4) Tres tarjetas enlace: Presupuestos (`#/presupuestos`, «Consulta, edita y descarga tus presupuestos»), Catálogo (`#/catalogo`, «Gestiona tus servicios y sus precios») y Mi perfil (`#/perfil`, «Tus datos y tu logo para el PDF») (FR-102).
  - No modificar src/quotes.js.
- [X] T009 [US1] En src/app.js, importar `./views/home.js`:
  - En `parseRoute()`, la ruta vacía pasa a ser `'inicio'` (antes `'presupuestos'`).
  - En `render()`, añadir `case 'inicio': homeView.render(appElement, ctx)`, y el `default` pasa a `ctx.navigate('#/')` (FR-101, FR-106).
  - Mantener la redirección del primer uso al perfil *antes* del `switch`, sin cambios (FR-002). Tras guardar el perfil la primera vez se sigue yendo a `#/presupuestos` (no tocar src/views/profile.js para eso).
- [X] T010 [P] [US1] Añadir a styles.css los estilos del inicio, mobile-first:
  - `.page-header`: título y acción en línea, que se apilan en estrechos.
  - `.stats`: tres cifras en `--text-xl` 700 con su etiqueta debajo.
  - `.home-links`: tarjetas enlace con título en `--text-lg` y ayuda en `.hint`, con una zona de toque de 44 px como mínimo.
  - En `@media (min-width: 768px)`, `.stats` y `.home-links` pasan a 3 columnas.
  - Sin desplazamiento horizontal a 360 px (FR-118).

**Checkpoint**: inicio funcional e independiente (se puede llegar a él escribiendo `/` aunque la
navegación todavía no tenga «Inicio»).

---

## Phase 4: User Story 2 - Moverse entre secciones desde cualquier pantalla (Priority: P1)

**Goal**: la misma cabecera en todas las pantallas, con Inicio, Presupuestos, Catálogo y Mi perfil.
En el escritorio es una barra y en el móvil un menú ☰.

**Independent Test**: recorrer las 5 pantallas a 360 px y en el escritorio y comprobar la cabecera,
la sección marcada y el menú ([quickstart.md](quickstart.md) pasos 7, 8 y 17).

- [X] T011 [US2] En index.html, sustituir `<nav class="main-nav">` por la cabecera `<header class="app-header">`, que contiene:
  - El enlace de marca `<a class="brand" href="#/">PresupuestosPro</a>`.
  - El botón `<button class="menu-toggle" type="button" aria-label="Menú" aria-expanded="false" aria-controls="main-nav">☰</button>`.
  - La navegación `<nav id="main-nav" class="main-nav">` con los enlaces, en este orden: `#/` (`data-route="inicio"`, «Inicio»), `#/presupuestos` («Presupuestos»), `#/catalogo` («Catálogo») y `#/perfil` («Mi perfil»).
  - Mantener `#message` y `<main id="app">` (FR-107).
- [X] T012 [US2] En src/app.js:
  - (1) Al marcar el enlace activo, poner `aria-current="page"` en el enlace de la ruta actual y quitarlo de los demás. La ruta `presupuestos` con id sigue marcando Presupuestos (FR-108).
  - (2) Manejar `.menu-toggle`: un clic alterna la clase `is-open` en `.app-header` y actualiza `aria-expanded`.
  - (3) Cerrar el menú (quitar `is-open` y poner `aria-expanded="false"`) en cada `hashchange`, al pulsar Escape con el menú abierto (devolviendo el foco a `.menu-toggle`) y con un clic o toque fuera de `.app-header` (FR-109).
  - (4) En `renderCorrupted()`, ocultar `.main-nav` y `.menu-toggle` con `hidden`, y volver a mostrarlos tras «Empezar de cero» (FR-110).
- [X] T013 [P] [US2] Reescribir en styles.css la sección de navegación:
  - Eliminar la barra inferior fija y el `padding-bottom` del `body`.
  - `.app-header` arriba y pegada (`position: sticky; top: 0`), de alto `--header-height`, con fondo `--color-surface` y borde inferior `--color-border`.
  - **< 768 px**:
    - `.main-nav` oculta salvo con `.app-header.is-open`.
    - Abierta, es un panel bajo la cabecera con un enlace por fila de 44 px de alto como mínimo.
    - `.menu-toggle` visible, de 44 × 44 px.
  - **≥ 768 px**: `.menu-toggle` oculto y `.main-nav` en línea a la derecha de `.brand`.
  - El enlace con `[aria-current="page"]` lleva color `--color-primary` y subrayado de 2 px.
  - Sin desplazamiento horizontal a 360 px (FR-109, [research.md § R6](research.md)).

**Checkpoint**: US1 y US2 juntas = MVP (inicio con navegación común).

---

## Phase 5: User Story 3 - Una app con imagen profesional y coherente (Priority: P2)

**Goal**: aplicar el sistema visual a todas las pantallas, con jerarquía clara, total destacado y
estados distinguibles.

**Independent Test**: recorrer las 5 pantallas con la lista de SC-105, a 360 px y en el escritorio,
y probar los estados en escala de grises ([quickstart.md](quickstart.md) pasos 9 a 11).

- [X] T014 [US3] Reescribir en styles.css los componentes de formulario y botones con tokens ([contracts/design-tokens.md § Componentes](contracts/design-tokens.md)):
  - `.field`: separación `--space-3`; etiqueta en `--text-sm` 600 con `--space-1` hasta el campo.
  - Campos con borde `--color-border-strong`, radio `--radius-sm` y alto mínimo `--touch`; el campo con error (`.field:has(.error:not(:empty)) :is(input, select, textarea)`; el mensaje `.error` va después del campo en `textField` de src/dom.js) con borde `--color-danger`.
  - `button` secundario: superficie con borde fuerte. `.primary`: `--color-primary` / `--color-on-primary`. `.danger`: `--color-danger`.
  - `:focus-visible`: contorno de 2 px `--color-primary` con desplazamiento de 2 px.
  - `:hover`/`:active` del primario con `--color-primary-hover`; los secundarios con fondo `--color-primary-soft`.
  - `:disabled` y `.readonly`: fondo `--color-bg` y texto `--color-muted` (FR-117).
- [X] T015 [US3] Reescribir en styles.css los mensajes, las listas y las tablas con tokens:
  - `#message`: `--color-danger-soft` y `--color-danger`.
  - `.notice`: `--color-warning-soft` y `--color-warning`.
  - Confirmación «Guardado»: `--color-success`.
  - `.list`, `.list-header` y `.list-item`: cabeceras en `--text-sm` 600 `--color-muted` sobre `--color-bg`, filetes `--color-border` y fila al pasar el ratón en `--color-primary-soft`.
  - Mantener tarjetas en móvil y tabla desde 768 px, con las mismas columnas.
  - Importes alineados a la derecha con `tabular-nums` (FR-111, FR-114).
- [X] T016 [US3] Reescribir en styles.css el editor de presupuestos:
  - `.line` y `.lines-header` con tokens, tarjetas en móvil y fila de tabla desde 768 px, con las mismas columnas.
  - `.summary`: filas en `--text-md`.
  - `.summary .total td`: `--text-total` 700 con borde superior de 2 px `--color-primary`, como la cifra más grande de la pantalla.
  - `.editor-header` sustituido por `.page-header` (FR-114).
- [X] T017 [P] [US3] En src/views/quote-list.js:
  - Usar `statusBadge(quote.status)` de ./status-badge.js en lugar del `span.badge` en línea.
  - Cambiar la clase `editor-header` del encabezado por `page-header`.
  - Sin cambiar el orden, los datos ni el comportamiento.
- [X] T018 [P] [US3] En src/views/quote-editor.js:
  - Usar `statusBadge(quote.status)` en lugar del `span.badge` de la cabecera.
  - Cambiar `editor-header` por `page-header`.
  - Añadir `h2` «Resumen» al principio de la tarjeta `.summary`.
  - Sin tocar cálculos, validaciones, bloqueos, la confirmación de emisión ni las llamadas a src/quotes.js (FR-123).
- [X] T019 [P] [US3] En src/views/catalog.js, añadir `h2` «Servicios» encima de la lista de servicios y revisar que el resto use solo clases del sistema (`.card`, `.field`, `.actions`, `.primary`, `.danger`). Sin cambios de comportamiento (FR-114).
- [X] T020 [P] [US3] En src/views/profile.js, revisar que el aviso use `.notice`, el texto «Guardado» lleve la clase de confirmación de T015 y los botones usen `.primary` / secundario. Sin cambios de textos ni de comportamiento (FR-117).
- [X] T021 [US3] Buscar en styles.css colores en hexadecimal o `rgb()`, tamaños de letra o márgenes en bruto fuera de `:root`, y sustituirlos por tokens. Solo se admiten 0, 1 px y 2 px en bordes y contornos (FR-111 a FR-113).

**Checkpoint**: todas las pantallas con el sistema visual; US1 y US2 siguen funcionando.

---

## Phase 6: User Story 4 - Un PDF con la misma imagen profesional (Priority: P2)

**Goal**: plantilla del PDF con la paleta de la app y la composición de [contracts/pdf.md](contracts/pdf.md), con el mismo contenido.

**Independent Test**: descargar el PDF del ejemplo de referencia y compararlo con
`baseline-Presupuesto.pdf` (T003): mismos textos e importes, diseño nuevo ([quickstart.md](quickstart.md) pasos 12 a 16).

- [X] T022 [US4] En src/pdf.js, añadir `readPdfTheme()`:
  - Lee con `getComputedStyle(document.documentElement)` los tokens `--color-primary`, `--color-primary-soft`, `--color-text`, `--color-muted`, `--color-border` y `--color-bg`.
  - Convierte cada `#rrggbb` en `[r, g, b]`.
  - Añadir a `buildQuotePdf` un 5.º parámetro `theme`. Si falta, se usa negro y grises neutros, sin copiar la paleta ([research.md § R3](research.md)).
  - `downloadQuotePdf` llama a `buildQuotePdf(quote, issuer, logoDataUrl, undefined, readPdfTheme())`.
  - No cambiar el nombre del archivo ni `save()` (FR-025).
- [X] T023 [US4] En src/pdf.js, rehacer la cabecera según [contracts/pdf.md § Composición](contracts/pdf.md):
  - Margen de 18 mm.
  - Logo a la izquierda, como máximo 60 × 20 mm y sin deformar. Sin logo, el nombre a 20 pt en negrita y color principal.
  - A la derecha, «PRESUPUESTO» a 20 pt en negrita y color principal, y debajo «Nº», «Fecha de emisión» y «Válido hasta» a 10 pt (etiqueta en `muted`, valor en `text`).
  - Filete de 0,6 mm del color principal a todo el ancho.
  - Mismos textos y formatos que ahora (FR-119, FR-120).
- [X] T024 [US4] En src/pdf.js, rehacer el bloque de las partes según [contracts/pdf.md](contracts/pdf.md) § 3:
  - Datos del emisor en la cabecera, bajo el logo o el nombre.
  - Bajo el filete, «Cliente» (12 pt en negrita y color principal) con nombre, `NIF/CIF: …` y dirección a 10 pt.
  - Sin títulos nuevos: los textos MUST coincidir con [baseline.md](baseline.md).
  - Mismos datos y origen que ahora (`issuer` = `issuerSnapshot` si está emitido) (FR-120, FR-122).
- [X] T025 [US4] En src/pdf.js, rehacer la tabla de líneas:
  - Cabecera con fondo `bg` y texto de 9 pt en negrita y `muted`.
  - Filas de 10 pt con filetes de 0,2 mm en `border`.
  - Las mismas columnas y textos, con las numéricas alineadas a la derecha.
  - La descripción se ajusta con `splitTextToSize`.
  - La cabecera se repite al saltar de página (US4-AS3).
- [X] T026 [US4] En src/pdf.js, rehacer los totales: bloque alineado a la derecha de ≈ 75 mm, filas de 10 pt, y el total a 14 pt en negrita sobre una banda `primary-soft` con filete superior del color principal. Mantener el cálculo de altura para que el bloque no se parta entre páginas y los mismos textos (`Base imponible`, `IVA (x %)`, `Retención IRPF (-x %)` y `Total`) (FR-119, FR-121).

**Checkpoint**: el PDF rediseñado tiene el mismo contenido que la referencia.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T027 Ejecutar `node --test tests/` y confirmar que todo sigue en verde sin haber modificado ninguna prueba (SC-104)
- [X] T028 Recalcular los `sha256sum` de T002 y confirmar que coinciden con specs/002-inicio-rediseno-visual/baseline.md (FR-123)
- [X] T029 Revisar en src/ y index.html que todos los textos nuevos están en español de España: «Inicio», «Menú», «Tus presupuestos», «Nuevo presupuesto», «Resumen», «Servicios» y los textos de ayuda del inicio (FR-124)
- [ ] T030 Recorrer los 21 pasos de [quickstart.md](quickstart.md) § 2, incluido el paso 18 (quickstart de la 001), y anotar el resultado en specs/002-inicio-rediseno-visual/baseline.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias. Debe hacerse **antes** de tocar código, para que la referencia sea la versión anterior.
- **Foundational (Phase 2)**: depende de Setup y bloquea todas las historias.
- **US1 (Phase 3)** y **US2 (Phase 4)**: dependen de Foundational. Las dos tocan src/app.js (T009 y T012), así que T012 va después de T009.
- **US3 (Phase 5)**: depende de Foundational. Es independiente de US1 y US2, salvo que T016 renombra `.editor-header` a `.page-header`, la clase que también usa T008.
- **US4 (Phase 6)**: depende solo de T004 (tokens). Es independiente de US1, US2 y US3, porque toca solo src/pdf.js.
- **Polish (Phase 7)**: al final.

### User Story Dependencies

- **US1 (P1)**: tras Foundational. No depende de otras historias.
- **US2 (P1)**: tras Foundational. Puede añadir el enlace Inicio aunque US1 no esté (`#/` cae en `default` hasta T009). Comparte src/app.js con US1.
- **US3 (P2)**: tras Foundational. Comparte styles.css con US1 y US2 (tareas en secuencia dentro del archivo).
- **US4 (P2)**: tras T004. Totalmente independiente.

### Within Each User Story

- styles.css es un solo archivo: sus tareas (T004, T005, T007, T010, T013, T014, T015, T016 y T021) no se paralelizan entre sí. Las [P] lo son solo frente a tareas de **otros** archivos.
- src/pdf.js: T022 → T023 → T024 → T025 → T026, en secuencia.

### Parallel Opportunities

- T006 (status-badge.js) en paralelo con T005 y T007 (styles.css).
- T010 (styles.css) en paralelo con T008 (home.js).
- T013 (styles.css) en paralelo con T011 (index.html) y T012 (app.js).
- T017, T018, T019 y T020 (cuatro vistas distintas), entre sí y con T014–T016.
- Toda la fase US4 (src/pdf.js) en paralelo con US1, US2 y US3.

---

## Parallel Example: User Story 3

```bash
# Las cuatro vistas a la vez (archivos distintos):
Task: "T017 [US3] statusBadge y page-header en src/views/quote-list.js"
Task: "T018 [US3] statusBadge, page-header y h2 Resumen en src/views/quote-editor.js"
Task: "T019 [US3] h2 Servicios en src/views/catalog.js"
Task: "T020 [US3] Clases del sistema en src/views/profile.js"

# Mientras tanto, en otra línea de trabajo, el PDF:
Task: "T022–T026 [US4] Plantilla en src/pdf.js"
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Phase 1 (línea base) y Phase 2 (tokens y etiqueta).
2. Phase 3 (US1): inicio en `/`. **Validar** con los pasos 1 a 6 del quickstart.
3. Phase 4 (US2): cabecera común y menú ☰. **Validar** con los pasos 7, 8 y 17.
4. Las dos son P1: juntas son el primer entregable.

### Incremental Delivery

1. MVP (US1 + US2).
2. US3: rediseño de pantallas (pasos 9 a 11).
3. US4: PDF (pasos 12 a 16). Puede ir antes que US3 o en paralelo.
4. Polish: no regresión (T027 a T030).

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Cualquier cambio fuera de los archivos permitidos es un fallo de alcance (FR-123): se revierte, no se justifica.
- No se añaden textos al PDF (ni «Página X de Y» ni bloque de condiciones): FR-120.
