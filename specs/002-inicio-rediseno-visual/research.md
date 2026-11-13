# Research: Página de inicio, navegación común y rediseño visual

Se parte del stack y las decisiones de [specs/001-presupuestos-pdf/research.md](../001-presupuestos-pdf/research.md),
que siguen vigentes. Aquí solo se recogen las decisiones nuevas.

## R1. Qué archivos se pueden tocar

- **Decision**: solo la capa de presentación: `index.html`, `styles.css`, `src/app.js`,
  `src/views/*` y `src/pdf.js`. Quedan fuera `money.js`, `totals.js`, `quotes.js`, `store.js`,
  `logo.js`, `tests/`, `vendor/` y `package.json`.
- **Rationale**: la petición limita los cambios a `public/` y a la plantilla del PDF, pero el
  proyecto no tiene carpeta `public/`: sirve la raíz tal cual (plan de la 001, «Source Code»).
  Lo que esa restricción busca es no tocar la lógica, los datos ni las pruebas. `app.js` entra
  porque las rutas y la navegación son presentación. Las vistas pueden *llamar* a `createQuote` y
  `sortedQuotes`, pero no se modifican.
- **Alternatives considered**: crear `public/` y mover allí los archivos servidos. Se descarta
  porque es un cambio de estructura sin valor para el usuario y rompe `npm start` y el quickstart
  de la 001.

## R2. Rutas y página de inicio

- **Decision**: la ruta vacía (`/` sin hash, `#` o `#/`) pasa a ser **inicio** (`home.js`). Una
  ruta desconocida redirige a `#/` (FR-106). Las rutas `#/presupuestos`, `#/presupuestos/<id>`,
  `#/catalogo` y `#/perfil` no cambian. La redirección del primer uso al perfil (FR-002) se hace
  antes que la del inicio, como hoy.
- **Rationale**: un cambio mínimo en `parseRoute()` y `render()`. Los marcadores guardados de las
  secciones siguen funcionando (caso límite de la spec).
- **Recuentos**: `home.js` recorre `ctx.doc.quotes` y cuenta por `status` (`draft` → Borrador,
  `issued` → Emitido). Como cada `hashchange` vuelve a pintar la vista, los recuentos están siempre
  al día (US1-AS6) sin estado extra.
- **«Nuevo presupuesto»**: reutiliza exactamente el manejador de la lista (`createQuote` +
  `ctx.save()` + navegar al editor).
- **Alternatives considered**: un `inicio.html` separado. Se descarta porque duplicaría la cabecera
  y la carga de módulos, y rompería el modelo de una sola página.

## R3. Paleta en un único lugar, compartida con el PDF

- **Decision**: todos los tokens (colores, tipografía, espaciado, radios) se definen como variables
  CSS en el `:root` de `styles.css`, y solo ahí. `pdf.js` lee al generar el PDF los colores que
  necesita con `getComputedStyle(document.documentElement)` y los pasa a RGB. Los tamaños del PDF
  salen de la misma escala, convertida a puntos con una tabla fija en
  [contracts/design-tokens.md](contracts/design-tokens.md).
- **Rationale**: una sola fuente de verdad sin herramientas ni pasos de compilación (principio I).
  El valor es el mismo en todos los dispositivos porque los tokens nunca se redefinen en `@media`
  ni hay modo oscuro, así que el PDF sigue siendo idéntico (FR-026).
- **Alternatives considered**:
  - Un módulo `theme.js` que inyecte las variables en el DOM. Esconde la paleta fuera del CSS y
    añade un paso más al arrancar.
  - Duplicar los valores en `pdf.js`. Incumple FR-111.

## R4. Paleta y contraste

- **Decision**: color principal azul marino sobrio, una escala de grises y un color por estado y por
  tipo de mensaje (valores en [contracts/design-tokens.md](contracts/design-tokens.md)). Contraste
  medido con la fórmula de las WCAG 2.1:

| Par | Ratio | Mínimo |
|---|---|---|
| Texto / fondo de página | 14,60 | 4,5 |
| Texto secundario / superficie | 6,00 | 4,5 |
| Blanco / color principal (botón primario) | 11,48 | 4,5 |
| Blanco / color principal al pasar el ratón | 14,49 | 4,5 |
| Contorno de foco (principal) / fondo de página | 10,71 | 3 (componente) |
| Etiqueta Borrador | 6,79 | 4,5 |
| Etiqueta Emitido | 9,56 | 4,5 |
| Etiquetas reservadas (Enviado, Aceptado, Rechazado, Caducado) | 7,01 / 5,70 / 6,34 / 5,37 | 4,5 |
| Error / superficie | 7,43 | 4,5 |
| Borde de campo / superficie | 3,07 | 3 (componente) |

- **Rationale**: cumple FR-116 con margen y se lee bien impreso en escala de grises.
- **Alternatives considered**: un color principal azul brillante (el actual `#1f5eff`). Se descarta
  porque resulta menos sobrio y queda muy claro al pasarlo a gris.

## R5. Estados distinguibles sin depender del color

- **Decision**: una etiqueta común (`status-badge.js`) con el texto del estado y una forma distinta:
  **Borrador** con borde discontinuo y fondo gris claro, **Emitido** con borde continuo y fondo del
  color principal suave, más un punto «●» delante. La misma etiqueta se usa en la lista, la edición
  y el resumen del inicio.
- **Rationale**: FR-115 y SC-106. En escala de grises, el texto y el tipo de borde bastan para
  distinguirlos.
- **Alternatives considered**: iconos SVG. Añaden recursos y no aportan más que el texto.

## R6. Navegación común (menú ☰ en el móvil)

- **Decision**: una cabecera fija arriba (`<header class="app-header">`) con la marca
  «PresupuestosPro», un `<button>` ☰ (`aria-label="Menú"`, `aria-expanded`, `aria-controls`) y la
  `<nav>` con los enlaces en este orden: Inicio, Presupuestos, Catálogo, Mi perfil.
  - **Por debajo de 768 px**: la `nav` está plegada; el botón la abre como panel bajo la cabecera,
    y se cierra al elegir un enlace (en cada `hashchange`) o al volver a tocar el botón.
  - **Desde 768 px**: el botón se oculta y los enlaces van en línea.
  - Se marca la sección actual con `aria-current="page"` y un subrayado, además del color.
  - Con datos dañados se oculta toda la cabecera de navegación, como hoy (FR-110).
- **Rationale**: es lo que se decidió en la sesión de aclaraciones. Desaparece la barra inferior
  fija, y con ella el `padding-bottom` del `body`.
- **Alternatives considered**: `<details>`/`<summary>` sin JavaScript. Se descarta porque no se
  cierra solo al navegar con hash y su semántica para lectores de pantalla es peor.

## R7. Tipografía

- **Decision**: en la app, la pila de fuentes del sistema sin remates que ya se usa (`system-ui`,
  `-apple-system`, `Segoe UI`, `Roboto`, `sans-serif`). En el PDF, Helvetica (fuente estándar,
  sin incrustar). La escala tiene 5 niveles (ver contrato) y en el PDF se aplica en puntos.
  - Las cifras de importes usan `font-variant-numeric: tabular-nums` para que se alineen en las
    tablas.
- **Rationale**: aclaración de FR-119 (opción B). No se añaden fuentes externas (supuesto de la
  spec y FR-023 de la 001).

## R8. Plantilla del PDF

- **Decision**: se mantiene el mismo contenido y orden (contrato de la 001, «PDF»), y se cambia
  solo la composición: banda superior con marca y bloque «PRESUPUESTO», filete del color principal,
  dos bloques «De» / «Para», tabla con cabecera en gris claro y filetes finos, y bloque de totales
  con el total sobre una banda tintada. El detalle está en [contracts/pdf.md](contracts/pdf.md).
  - **Saltos de página**: se mantienen la cabecera de tabla repetida y el bloque de totales
    indivisible.
  - **«Condiciones/validez»** (FR-119) se cubre con la fecha «Válido hasta», que ya existe; no se
    añade texto nuevo (FR-120).
- **Rationale**: FR-119 a FR-122. Para comparar con el PDF anterior basta con los mismos textos e
  importes.
- **Alternatives considered**: añadir «Página X de Y». Se descarta porque es contenido nuevo, que
  FR-120 no permite.
