---

description: "Task list for PresupuestosPro v0"
---

# Tasks: PresupuestosPro v0 — presupuestos en PDF para freelancers

**Input**: Design documents from `specs/001-presupuestos-pdf/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/storage.md,
contracts/ui.md, quickstart.md

**Tests**: el plan define pruebas unitarias con `node --test` solo para la lógica pura
(`money`, `totals`, `quotes`). La validación funcional es manual con quickstart.md (constitución,
principio IV). No hay pruebas E2E.

**Organization**: tareas agrupadas por historia de usuario para implementarlas y probarlas de
forma independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede hacer en paralelo (archivo distinto, sin dependencias pendientes)
- **[Story]**: historia de usuario a la que pertenece (US1…US5)

## Convenciones comunes (aplican a todas las tareas)

- Rutas relativas a la raíz del proyecto (`index.html`, `src/`, `tests/`).
- Unidades enteras (research R4): **cantidad en centésimas**, **precio en milésimas de euro**,
  **importes en céntimos**. Nunca floats para dinero.
- Textos de interfaz y PDF en español, escritos directamente en el código (sin sistema de
  traducciones).
- Sin dependencias aparte de jsPDF. Sin peticiones de red.
- La lógica pura (`src/money.js`, `src/totals.js`, `src/quotes.js`) no usa DOM ni
  `localStorage`. Recibe `today` como parámetro en lugar de leer el reloj, para poder probarla.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: esqueleto del proyecto estático

- [X] T001 Crear `package.json` en la raíz con `"name": "presupuestospro"`, `"private": true`,
  `"type": "module"`, scripts `"test": "node --test tests/"` y `"start": "npx serve . -l 3000"`, y
  **sin** `dependencies` ni `devDependencies`. Crear las carpetas vacías `src/views/`, `tests/` y
  `vendor/`
- [X] T002 [P] Descargar jsPDF 2.5.1 desde
  `https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js` y guardarlo como
  `vendor/jspdf.umd.min.js` (la app no lo carga nunca desde una CDN)
- [X] T003 [P] Crear `index.html`:
  - `<html lang="es">`, `<meta charset="utf-8">` y
    `<meta name="viewport" content="width=device-width, initial-scale=1">`;
  - título «PresupuestosPro»;
  - `<nav>` con tres enlaces: «Presupuestos» (`#/presupuestos`), «Catálogo» (`#/catalogo`) y
    «Mi perfil» (`#/perfil`);
  - `<div id="message" role="status">` para avisos y `<main id="app">`;
  - `<script src="vendor/jspdf.umd.min.js">` (clásico) y
    `<script type="module" src="src/app.js">`;
  - enlace a `styles.css`.
- [X] T004 [P] Crear `styles.css` con la base *mobile-first* (research R10):
  - variables de color y espaciado, `box-sizing: border-box`, una columna;
  - `max-width: 100%` en imágenes y campos, para que no haya desplazamiento horizontal a 360 px;
  - botones y zonas táctiles de 44 px como mínimo;
  - `font-size` de 16 px como mínimo en `input`, `select` y `textarea`, para que Safari en iPhone
    no amplíe la pantalla al tocar un campo (FR-024);
  - `<nav>` como barra fija inferior por debajo de 768 px y como barra superior desde
    `@media (min-width: 768px)`;
  - clases utilitarias `.error` (texto rojo bajo el campo) y `.readonly`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: dinero, almacenamiento y rutas, de los que dependen todas las historias

**⚠️ CRITICAL**: ninguna historia puede empezar hasta terminar esta fase

- [X] T005 [P] Implementar `src/money.js` (lógica pura) con:
  - `roundHalfUp(numerator, denominator)`: división entera de no negativos con medio hacia
    arriba (`235.5 → 236`);
  - `parseQuantity(text)`: acepta coma o punto y **hasta 2 decimales**, devuelve centésimas
    (`"1,5" → 150`) o `null` si no es válido;
  - `parsePrice(text)`: **hasta 3 decimales**, devuelve milésimas (`"0,785" → 785`,
    `"1.500" → 1500000`, `"1500,00" → 1500000`) o `null`;
  - `formatEuros(cents)`: `"1.500,00 €"`, negativos como `"−300,00 €"`; formateador propio
    porque `Intl` no agrupa números de 4 cifras (research R5);
  - `formatPrice(milesimas)`: 2 decimales, o 3 si el tercero no es 0;
  - `formatQuantity(centesimas)`: sin decimales sobrantes (`150 → "1,5"`);
  - `formatDate(iso)`: `"2026-11-12" → "12/11/2026"`;
  - `parseDate(text)`: `"12/11/2026" → "2026-11-12"`; devuelve `null` si el formato no es
    DD/MM/AAAA o la fecha no existe (`"31/02/2026"`, `"29/02/2027"`) (FR-020);
  - `maskDate(text)`: deja solo dígitos (máximo 8) e inserta las barras (`"1211" → "12/11"`,
    `"12112026" → "12/11/2026"`);
  - `addDays(iso, n)`: devuelve la fecha ISO resultante.
- [X] T006 [P] Escribir `tests/money.test.js` con `node:test` y `node:assert/strict`, cubriendo:
  - redondeo: `235.5 → 236` y `235.4 → 235`;
  - parseo con coma y punto, y rechazo de valores inválidos (`"abc"`, `"1,234"` en cantidad,
    `"0,7855"` en precio);
  - `formatEuros(150000) === "1.500,00 €"`, `formatEuros(236) === "2,36 €"` y
    `formatEuros(-30000) === "−300,00 €"`;
  - `formatDate` y `addDays("2026-11-12", 30) === "2026-12-12"`;
  - `parseDate("31/02/2026") === null`, `parseDate("29/02/2028") === "2028-02-29"` y
    `maskDate("12112026") === "12/11/2026"`.
- [X] T007 Implementar `src/store.js` según `contracts/storage.md`:
  - `emptyDocument()`: `schemaVersion: 1`, perfil con `onboarded: false` y
    `defaultWithholding: 0`, `logos: {}`, `services: []`, `counters: {}` y `quotes: []`;
  - `load()`: lee la clave `presupuestospro:v1`. Si no existe, devuelve el documento vacío. Si
    el JSON está corrupto, devuelve `{ doc: emptyDocument(), corrupted: true }` sin sobrescribir;
  - `save(doc)`: escribe el documento entero; si salta `QuotaExceededError`, lanza
    `StorageFullError`;
  - `newId()`: usa `crypto.randomUUID()`.
- [X] T008 Implementar `src/app.js`:
  - carga el documento con `store.load()`;
  - si está corrupto, muestra en `#message` «No se han podido leer tus datos guardados» y un
    botón «Empezar de cero». Ese botón pide `confirm("Se borrarán todos tus datos. ¿Continuar?")`
    y solo si se acepta guarda el documento vacío; nunca se sobrescribe sin confirmar (FR-029);
  - router por `hashchange` con las rutas `#/perfil`, `#/catalogo`, `#/presupuestos` y
    `#/presupuestos/<id>`. La ruta por defecto es `#/presupuestos`;
  - con `profile.onboarded === false`, toda ruta redirige a `#/perfil` (FR-002);
  - expone a las vistas un contexto `{ doc, save, navigate, showMessage, today }`. `save`
    captura `StorageFullError`, muestra «No queda espacio en este navegador» y recarga el
    documento con `store.load()` para descartar el cambio no guardado (FR-028);
  - crea `src/views/profile.js`, `src/views/catalog.js`, `src/views/quote-list.js` y
    `src/views/quote-editor.js` como stubs que exportan `render(container, ctx)` con un título.

**Checkpoint**: `npm test` pasa `tests/money.test.js`; la app carga en `npm start` y navega entre
las 4 rutas.

---

## Phase 3: User Story 1 - Crear un presupuesto con los impuestos bien calculados (Priority: P1) 🎯 MVP

**Goal**: crear un presupuesto con cliente y líneas manuales y ver base, IVA por tipo, retención
y total calculados al momento.

**Independent Test**: quickstart pasos 5–9 usando líneas manuales en lugar del catálogo: total
2.120,00 / 2.280,00 / 2.420,00 / 2.065,00 € e importe de línea 2,36 €.

- [X] T009 [P] [US1] Implementar `src/totals.js` (lógica pura):
  - `lineAmount(line)` = `roundHalfUp(quantity × unitPrice, 1000)` en céntimos;
  - `effectiveWithholding(quote)` = `client.type === 'business' ? withholding : 0` (FR-010,
    FR-011, CL3): sin retención si el tipo es particular o está sin marcar (`null`);
  - `computeTotals(quote)` devuelve
    `{ lineAmounts, base, vatByRate: [{ rate, amount }], withholdingRate, withholdingAmount, total }`;
  - `vatByRate`: un elemento por tipo usado, en orden 21, 10, 4, 0, con
    `amount = roundHalfUp(Σ importes del tipo × rate, 100)`;
  - `withholdingAmount = roundHalfUp(base × withholdingRate, 100)`;
  - `total = base + Σ vat − withholdingAmount`;
  - las líneas inválidas (`quantity` o `unitPrice` null) cuentan como 0.
- [X] T010 [P] [US1] Escribir `tests/totals.test.js` con los ejemplos de la spec:
  - 1500 € + 500 € al 21 % con empresa y 15 %: base 200000, IVA 42000, IRPF 30000 y total
    **212000**;
  - con 7 %: total **228000**;
  - con retención 0: total **242000**;
  - con particular y `withholding: 15`: retención 0 y total **242000**;
  - con `client.type: null` y `withholding: 15`: retención 0 y total **242000**;
  - 1500 € al 21 % + 500 € al 10 % con 15 %: IVA 21 % 31500, IVA 10 % 5000 y total **206500**;
  - línea de 3 × 0,785 (`quantity: 300`, `unitPrice: 785`): **236**;
  - presupuesto sin líneas: todo 0 y `vatByRate` vacío.
- [X] T011 [P] [US1] Implementar en `src/quotes.js` (lógica pura):
  - `createQuote(doc, today)`: incrementa `doc.counters[year]` (year = año de `today`, nunca se
    decrementa) y crea `{ id, number: "AAAA-NNN" con NNN a 3 dígitos, status: 'draft',
    createdAt, issueDate: today, client: { name: '', taxId: '', address: '', type: null },
    withholding: doc.profile.defaultWithholding, lines: [], issuerSnapshot: null }`. Lo añade a
    `doc.quotes` y lo devuelve (FR-012, FR-010, FR-019);
  - `newManualLine()`: `{ id, description: '', quantity: 100, unitPrice: 0, vatRate: 21 }`;
  - `validateLine(line)`: devuelve errores en español para descripción vacía, «cantidad > 0» y
    «precio ≥ 0» (FR-007);
  - `assertDraft(quote)`: lanza un error si `status !== 'draft'`.
- [X] T012 [US1] Escribir `tests/quotes.test.js` (primera parte), cubriendo:
  - el primer `createQuote` con `today` 2026-11-09 da `2026-001` y el segundo `2026-002`;
  - el presupuesto nuevo toma `withholding` del perfil;
  - `issueDate === today`;
  - `client.type === null` (sin marcar, FR-006);
  - `validateLine` rechaza cantidad 0, cantidad negativa y precio negativo, y acepta precio 0.
- [X] T013 [US1] Implementar `src/views/quote-list.js` (FR-013b):
  - botón «Nuevo presupuesto», que llama a `createQuote`, guarda y navega a
    `#/presupuestos/<id>`;
  - lista ordenada por `number` descendente con número, cliente (o «Sin cliente»),
    `formatDate(issueDate)`, `formatEuros(total)` y estado «Borrador» / «Emitido». Cada elemento
    enlaza al presupuesto;
  - con 768 px o más se muestra como `<table>`; por debajo, como tarjetas;
  - lista vacía: «Todavía no tienes presupuestos».
- [X] T014 [US1] Implementar `src/views/quote-editor.js` (borrador) según `contracts/ui.md`:
  - **cabecera**: número, estado, fecha de emisión y «Válido hasta» (`addDays(issueDate, 30)`).
    La fecha va en `<input type="text" inputmode="numeric" placeholder="DD/MM/AAAA">` (no
    `type="date"`, que usa el formato del idioma del navegador). En cada pulsación aplica
    `maskDate`; al completarse, `parseDate`. Si da `null`, muestra «Fecha no válida» y conserva el
    último `issueDate` válido (FR-020);
  - **cliente**: nombre* (obligatorio), NIF/CIF, dirección y tipo* con radios
    «Empresa/autónomo» / «Particular», ninguno marcado al crear (FR-006);
  - **retención IRPF**: radios «No» / «15 %» / «7 %». Con tipo Particular se desactivan y se
    muestra «A particulares no se aplica retención»; con el tipo sin marcar, se desactivan con
    «Elige el tipo de cliente para aplicar la retención». En ambos casos se conserva el valor
    elegido;
  - **líneas**: botón «Añadir línea manual». Cada línea tiene descripción, cantidad
    (`inputmode="decimal"`), precio unitario (`inputmode="decimal"`), select IVA 21/10/4/0 %,
    importe calculado y botón «Borrar». Los errores de `validateLine` se muestran junto a la
    línea;
  - **resumen** con `computeTotals`: base imponible, una fila «IVA (x %)» por tipo usado,
    «Retención IRPF (−x %)» solo si es mayor que 0, y total;
  - cada cambio actualiza el modelo, repinta el resumen y llama a `ctx.save`.
- [X] T015 [P] [US1] Añadir a `styles.css` los estilos del editor:
  - por debajo de 768 px, cada línea es una tarjeta con los campos apilados y el importe
    destacado, y el resumen va fijo al final;
  - desde 768 px, las líneas forman una tabla;
  - estado `.readonly`.

**Checkpoint**: la US1 funciona sola. `npm test` pasa `totals` y `quotes`, y los pasos 5–9 del
quickstart (con líneas manuales) dan los totales esperados en escritorio y a 360 px.

---

## Phase 4: User Story 2 - Descargar el presupuesto en PDF con su marca (Priority: P1)

**Goal**: descargar el PDF; la primera descarga emite y bloquea el presupuesto.

**Independent Test**: quickstart pasos 2, 10, 11 y 15. Necesita un perfil con nombre y NIF; hasta
completar la US3, se rellena guardando el documento a mano en `localStorage` (ver Dependencies).

- [X] T016 [US2] Añadir a `src/quotes.js`:
  - `issueBlockers(doc, quote)`: devuelve los mensajes de `contracts/ui.md` § Bloqueos:
    - perfil sin `name` o `nif`: «Completa tu nombre y NIF en Mi perfil para descargar el PDF»
      (FR-003);
    - sin líneas: «Añade al menos una línea antes de descargar el PDF» (FR-017);
    - líneas con errores de `validateLine`;
    - cliente sin nombre: «Escribe el nombre del cliente»;
    - tipo de cliente sin marcar: «Indica si el cliente es empresa/autónomo o particular».
  - `issueQuote(doc, quote)`: hace `assertDraft`, pone `status: 'issued'` y guarda
    `issuerSnapshot = { name, nif, email, phone, address, logoId }`, copiado del perfil
    (FR-015b). `issueDate` no cambia.
- [X] T017 [US2] Ampliar `tests/quotes.test.js`:
  - `issueBlockers` devuelve el mensaje correcto con perfil sin NIF, con presupuesto sin líneas y
    con `client.type === null`;
  - `issueQuote` fija `status` y `issuerSnapshot`;
  - cambiar después `doc.profile.name` no altera `issuerSnapshot`;
  - `assertDraft` lanza con un presupuesto emitido.
- [X] T018 [P] [US2] Implementar `src/pdf.js` con `window.jspdf.jsPDF` (A4 vertical, unidades
  mm, fuente Helvetica). Exporta `downloadQuotePdf(quote, issuer, logoDataUrl)`, que:
  - dibuja la cabecera con el logo (`addImage`, encajado en 60 × 20 mm sin deformar) o, si no
    hay logo, `issuer.name` en grande; debajo, nombre, NIF, email, teléfono y dirección
    disponibles;
  - escribe «PRESUPUESTO», el número, «Fecha de emisión» y «Válido hasta» (`formatDate`);
  - escribe el bloque «Cliente» con nombre, NIF/CIF y dirección;
  - dibuja la tabla Descripción | Cantidad | Precio unitario | IVA | Importe, con
    `splitTextToSize` en la descripción y salto de página con la cabecera de tabla repetida si
    no cabe;
  - escribe el resumen de `computeTotals`: base imponible, IVA por tipo, retención si es mayor
    que 0 y **Total**;
  - llama a `doc.save('Presupuesto-<número>.pdf')`.

  El PDF es idéntico en todos los dispositivos (FR-026).
- [X] T019 [US2] Integrar la descarga en `src/views/quote-editor.js`:
  - botón «Descargar PDF», también en el resumen fijo del móvil. Al pulsarlo, si hay
    `issueBlockers`, los muestra (el de perfil, con enlace a `#/perfil`) y no hace nada más;
  - si es borrador, pide `confirm("Al descargar, el presupuesto quedará emitido y ya no podrás
    modificarlo. ¿Continuar?")` (FR-027). Si se cancela, no cambia nada. Si se acepta, llama a `issueQuote` y `ctx.save`, y después a
    `downloadQuotePdf`. Si `ctx.save` falla, no descarga;
  - el emisor y el logo salen de `issuerSnapshot` (y `doc.logos[snapshot.logoId]`) si está
    emitido, y del perfil actual si es borrador;
  - en estado emitido, todos los campos y líneas van en solo lectura (`.readonly`, sin botones
    de añadir ni borrar líneas) y «Descargar PDF» vuelve a descargar sin confirmar (FR-015).

**Checkpoint**: US1 + US2 funcionan. El PDF muestra «€», las tildes y la «ñ» correctamente, y en
Android se descarga mientras que en iPhone se abre en el visor (FR-025).

---

## Phase 5: User Story 3 - Configurar el perfil del freelancer (Priority: P2)

**Goal**: guardar nombre, NIF, contacto, logo y retención habitual, con el aviso de dónde viven
los datos.

**Independent Test**: quickstart pasos 1, 3, 12 y 18.

- [X] T020 [P] [US3] Implementar `src/logo.js` con `async processLogo(file)`:
  - rechaza tipos distintos de `image/png` e `image/jpeg` («El logo debe ser PNG o JPG») y
    archivos de más de 1 MB («El logo no puede pasar de 1 MB»);
  - carga la imagen y la reduce con `<canvas>` para que quepa en **600 × 200 px**, manteniendo
    la proporción y sin ampliar las imágenes pequeñas;
  - devuelve un dataURL PNG (si el original es PNG) o JPEG con calidad 0.9.
- [X] T021 [US3] Añadir a `src/store.js`:
  - `addLogo(doc, dataUrl)`: crea una entrada en `doc.logos` con `newId()` y devuelve el id;
  - `pruneLogos(doc)`: borra los logos que no use `doc.profile.logoId` ni ningún
    `quote.issuerSnapshot.logoId` (research R2).
- [X] T022 [US3] Implementar `src/views/profile.js` según `contracts/ui.md`:
  - campos nombre*, NIF*, email, teléfono y dirección;
  - logo con vista previa y botones «Subir logo» (`accept="image/png,image/jpeg"`) y «Quitar»;
  - retención habitual «No retengo» / «15 %» / «7 %», guardada en `defaultWithholding` como
    0/15/7;
  - aviso permanente: «Tus datos se guardan solo en este navegador de este dispositivo. No se
    sincronizan y se pierden si borras los datos del navegador o cambias de dispositivo.»; si
    `navigator.userAgent` contiene iPhone o iPad, añadir «En iPhone, Safari puede borrarlos si no
    usas la app durante unos días.» (FR-022);
  - **Guardar**: se puede guardar con campos vacíos. Asigna el logo con `addLogo`, ejecuta
    `pruneLogos`, pone `onboarded = true`, llama a `ctx.save` y, si era el primer uso, navega a
    `#/presupuestos`.

**Checkpoint**: el primer uso abre el perfil con el aviso. Un emitido conserva el logo antiguo y
un borrador usa el nuevo (US3-4).

---

## Phase 6: User Story 4 - Mantener un catálogo de servicios (Priority: P2)

**Goal**: guardar servicios con precio por defecto y añadirlos a los presupuestos como líneas
independientes.

**Independent Test**: quickstart pasos 4, 5 (con catálogo) y 16.

- [X] T023 [P] [US4] Implementar `src/views/catalog.js` (FR-004):
  - formulario nombre* + precio por defecto*: `parsePrice`, ≥ 0, `inputmode="decimal"`;
  - botón «Añadir servicio», o «Guardar» al editar;
  - lista con nombre, `formatPrice(defaultPrice)` y botones «Editar» y «Borrar» (este con
    `confirm`);
  - tabla desde 768 px y tarjetas por debajo; cada cambio llama a `ctx.save`.
- [X] T024 [US4] Añadir `lineFromService(service)` a `src/quotes.js`: devuelve
  `{ id: nuevo, description: service.name, quantity: 100, unitPrice: service.defaultPrice,
  vatRate: 21 }` como copia, sin referencia al servicio (FR-005, FR-008). Añadir a
  `tests/quotes.test.js` que modificar o borrar el servicio después no cambia la línea.
- [X] T025 [US4] Añadir a `src/views/quote-editor.js` (solo en borrador) el selector «Añadir del
  catálogo», que lista los servicios de `doc.services` y, al elegir uno, añade
  `lineFromService(service)`. Si el catálogo está vacío, muestra un enlace a `#/catalogo`.

**Checkpoint**: el presupuesto del ejemplo se crea desde el catálogo y el precio se puede cambiar
en la línea sin tocar el catálogo.

---

## Phase 7: User Story 5 - Numerar, guardar, duplicar y gestionar presupuestos (Priority: P3)

**Goal**: duplicar, borrar borradores y garantizar la numeración por año sin reutilizar números.

**Independent Test**: quickstart pasos 13, 14, 17 y 18.

- [X] T026 [US5] Añadir a `src/quotes.js`:
  - `duplicateQuote(doc, quote, today)`: llama a `createQuote(doc, today)` y copia `client`, las
    `lines` (con ids nuevos) y `withholding`, con `issueDate = today` e `issuerSnapshot = null`
    (FR-016);
  - `deleteQuote(doc, quote)`: hace `assertDraft` y lo elimina de `doc.quotes` sin tocar
    `doc.counters` (FR-012, FR-015).
- [X] T027 [US5] Ampliar `tests/quotes.test.js`:
  - con `counters: { "2026": 14 }` y `today` 2027-01-02, `createQuote` da `2027-001`;
  - borrar el `2026-003` y crear otro da `2026-004`;
  - `deleteQuote` lanza con un emitido;
  - `duplicateQuote` de un emitido da un borrador con número nuevo, mismo cliente y líneas, ids de
    línea distintos y `issuerSnapshot` null, y no modifica el original.
- [X] T028 [US5] Añadir a `src/views/quote-editor.js`:
  - botón «Duplicar» en ambos estados, que llama a `duplicateQuote` y `ctx.save` y navega al
    nuevo;
  - botón «Borrar», solo en borrador, que pide `confirm("¿Borrar este presupuesto?")`, llama a
    `deleteQuote` y `ctx.save`, y navega a `#/presupuestos`.

**Checkpoint**: las 5 historias funcionan de forma independiente y conjunta.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [X] T029 [P] Revisar `styles.css` y las vistas a 360 px de ancho en Chrome DevTools: sin
  desplazamiento horizontal, zonas táctiles de 44 px como mínimo y la barra de navegación sin
  tapar el resumen ni el botón Descargar PDF (FR-024)
- [X] T030 [P] Revisar que ningún texto visible de `src/views/*.js` ni de `src/pdf.js` esté en
  otro idioma que español, y que no haya ninguna petición de red (`fetch`, URLs externas) en
  `src/` (constitución II y V)
- [ ] T031 Ejecutar `npm test` y los 22 pasos de `specs/001-presupuestos-pdf/quickstart.md`:
  pasos generales en Chrome, Firefox, Edge y Safari de escritorio, y pasos de móvil en Safari de
  iPhone y Chrome de Android. Corregir cualquier fallo en el archivo correspondiente

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias.
- **Foundational (Phase 2)**: depende de Setup y bloquea todas las historias.
- **US1 (Phase 3)**: depende de Foundational.
- **US2 (Phase 4)**: depende de US1, porque amplía `quote-editor.js` y usa `computeTotals`. Para
  validarla de punta a punta necesita un perfil con nombre y NIF: o se hace la US3 antes, o se
  carga ese perfil a mano en `localStorage`.
- **US3 (Phase 5)**: depende solo de Foundational. Se puede hacer en paralelo a US1 y US2.
- **US4 (Phase 6)**: `catalog.js` (T023) depende solo de Foundational; T024 y T025 dependen de
  US1.
- **US5 (Phase 7)**: depende de US1 (`quotes.js` y `quote-editor.js`); T028 depende de T019,
  porque el editor ya distingue los estados.
- **Polish (Phase 8)**: depende de todas las historias.

**Orden recomendado para una sola persona**: Setup → Foundational → US1 → US3 → US2 → US4 → US5 →
Polish. US3 va antes que US2 para poder probar el PDF sin cargar el perfil a mano.

### Within Each User Story

- Lógica pura y sus pruebas → vista → estilos.
- Las tareas que tocan `src/quotes.js`, `tests/quotes.test.js` o `src/views/quote-editor.js` son
  secuenciales entre sí (mismo archivo).

### Parallel Opportunities

- Setup: T002, T003 y T004 a la vez.
- Foundational: T005 y T006 en paralelo con T007; T008 después de T007.
- US1: T009, T010 y T011 a la vez; T015 en paralelo con T013 y T014.
- US2: T018 (`pdf.js`) en paralelo con T016 y T017.
- US3 completa en paralelo con US1 y US2 (otros archivos), salvo T021, que toca `store.js` tras
  T007.
- US4: T023 en paralelo con cualquier tarea de US1, US2 o US3.

## Parallel Example: User Story 1

```bash
# Lógica pura y pruebas a la vez (archivos distintos):
Task: "T009 [US1] Implementar src/totals.js"
Task: "T010 [US1] Escribir tests/totals.test.js con los ejemplos de la spec"
Task: "T011 [US1] Implementar createQuote/newManualLine/validateLine en src/quotes.js"

# Después, interfaz y estilos a la vez:
Task: "T014 [US1] Implementar src/views/quote-editor.js (borrador)"
Task: "T015 [US1] Estilos del editor en styles.css"
```

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1 y Phase 2.
2. Phase 3 (US1).
3. **Parar y validar**: totales 2.120 / 2.280 / 2.420 / 2.065 € y 2,36 € en escritorio y a
   360 px.

### Incremental Delivery

1. US1 → los cálculos son correctos (MVP interno).
2. US3 + US2 → primer PDF enviable a un cliente (**MVP de negocio**).
3. US4 → catálogo (objetivo de 5 minutos).
4. US5 → duplicar, borrar y numeración completa.
5. Polish → validación completa del quickstart en escritorio y móvil.
