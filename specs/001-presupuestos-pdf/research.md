# Research: PresupuestosPro v0

Criterio rector (constitución, principio I y petición del plan): ante dos opciones, la más simple
que cumpla la spec.

## R1. Tipo de aplicación y stack

- **Decision**: página web estática (HTML + CSS + JavaScript moderno con módulos ES), sin framework,
  sin backend y sin paso de compilación.
- **Rationale**: la spec no tiene servidor, cuentas ni sincronización (los datos viven en el
  navegador). Son 4 pantallas con formularios. Un framework (React, Vue…) y un bundler añadirían
  dependencias, configuración y conocimiento extra sin resolver ningún requisito.
- **Alternatives considered**: React/Vue + Vite (rechazado: complejidad anticipada); app de
  escritorio con Electron (rechazado: la spec pide herramienta web); backend con base de datos
  (rechazado: fuera de alcance, «sin nube»).

## R2. Almacenamiento local

- **Decision**: `localStorage`, un único documento JSON versionado bajo la clave
  `presupuestospro:v1` (ver [contracts/storage.md](contracts/storage.md)).
- **Rationale**: es síncrono, no necesita dependencias y está en todos los navegadores de
  escritorio objetivo. El volumen previsto (decenas o centenares de presupuestos al año) ocupa
  pocos KB.
- **Riesgo resuelto (cuota de ~5 MB)**: el logo es lo único pesado y además se copia al emitir
  (FR-015b). Mitigación: (1) al subirlo se reduce en el navegador a un máximo de 600 × 200 px,
  lo que deja unos 20–100 KB; (2) los logos se guardan una sola vez en una tabla `logos` y los
  presupuestos emitidos guardan solo el `logoId`. Cambiar el logo crea una entrada nueva; las
  antiguas siguen ahí mientras algún emitido las use.
- **Alternatives considered**: IndexedDB (rechazado: API asíncrona y más código para un volumen
  pequeño); ficheros con la File System Access API (rechazado: no está en Firefox ni en Safari).

## R3. Generación del PDF

- **Decision**: jsPDF 2.5.1 (archivo UMD guardado en `vendor/`, sin CDN) con las fuentes estándar
  (Helvetica). Descarga directa con `doc.save('Presupuesto-2026-001.pdf')`.
- **Rationale**: la spec exige «descargar» el PDF y que la primera descarga emita el presupuesto.
  Con una descarga directa se sabe con certeza cuándo ocurre. Es una sola dependencia, sin red
  (principio V: los datos no salen del dispositivo).
- **Alternatives considered**: `window.print()` con CSS de impresión (cero dependencias, pero el
  usuario tiene que elegir «Guardar como PDF» en el diálogo del navegador, el resultado cambia de
  un navegador a otro y no se puede saber si se guardó o se canceló, así que se rompería la regla
  de emisión); pdfmake (más pesado y con fuentes embebidas, innecesario).
- **A verificar en el quickstart**: el símbolo «€» y las tildes y la «ñ» salen bien con Helvetica
  (WinAnsi los incluye).

## R4. Aritmética de dinero y redondeo

- **Decision**: aritmética entera en tres unidades:
  - **cantidad** en centésimas (hasta 2 decimales: 1,5 → 150);
  - **precio unitario** en milésimas de euro (hasta 3 decimales: 0,785 → 785; la spec usa este
    caso);
  - **importes** (línea, base, IVA, IRPF, total) en céntimos.

  Fórmulas, siempre con medio céntimo hacia arriba (`roundHalfUp`):
  - importe de línea = roundHalfUp(cantidad × precio / 1000)
  - IVA del tipo t = roundHalfUp(base_t × t / 100)
  - IRPF = roundHalfUp(base × p / 100)
  - total = base + Σ IVA − IRPF
- **Comprobación**: 3 × 0,785 € → 300 × 785 / 1000 = 235,5 → 236 céntimos = 2,36 € ✔.
  Ejemplo de referencia: 150000 + 50000 = 200000; IVA 42000; IRPF 30000; total 212000 ✔.
- **Rationale**: los números de coma flotante fallan en casos como 0,1 + 0,2, y SC-002 exige
  cuadrar al céntimo. Con enteros (muy por debajo de 2^53) el cálculo es exacto y no hace falta
  ninguna librería decimal.
- **Alternatives considered**: decimal.js o big.js (rechazado: dependencia innecesaria si se usan
  enteros); floats con `toFixed` (rechazado: redondeo incorrecto en casos frontera).

## R5. Formato de importes y fechas

- **Decision**: formateador propio de unas pocas líneas: miles con «.», decimales con «,» y « €»
  al final (`1.500,00 €`). Fechas DD/MM/AAAA.
- **Rationale**: `Intl.NumberFormat('es-ES')` **no pone separador de miles en números de 4 cifras**
  (devuelve `1500,00 €`, por la regla CLDR de agrupación mínima), y la spec y el ejemplo de
  referencia exigen `1.500,00 €`.
- **Alternatives considered**: `Intl` con `useGrouping: 'always'` (no está en todos los navegadores
  objetivo de forma uniforme; rechazado por riesgo de diferencias).

## R6. Pruebas

- **Decision**: pruebas unitarias con el runner integrado de Node (`node --test`), sin
  dependencias, solo para la lógica pura (dinero, cálculos, numeración, estados). La validación
  funcional es manual, siguiendo el [quickstart.md](quickstart.md), que una persona no técnica
  puede ejecutar (principio IV).
- **Rationale**: los cálculos son la parte crítica y se prueban mejor de forma automática. La
  interfaz es pequeña y la constitución pide verificación usando la app.
- **Alternatives considered**: Jest o Vitest (rechazado: dependencias y configuración);
  Playwright E2E (rechazado para v0: complejidad anticipada).

## R7. Servir la app

- **Decision**: cualquier servidor de ficheros estáticos. En local, `npx serve .` o
  `python -m http.server`. En producción, cualquier hosting estático (por ejemplo, GitHub Pages o
  Netlify).
- **Rationale**: los módulos ES no cargan desde `file://` en Chrome, así que hace falta servirlos
  por HTTP. No hay variables de entorno ni secretos (principio V).

## R8. Navegación

- **Decision**: rutas con hash (`#/perfil`, `#/catalogo`, `#/presupuestos`,
  `#/presupuestos/<id>`) y un `switch` que pinta la vista correspondiente.
- **Rationale**: no necesita servidor ni librería de rutas, y el botón «atrás» del navegador
  funciona.

## R9. Varias pestañas abiertas

- **Decision**: no se gestiona. Se asume una sola pestaña abierta (ver supuestos del plan).
- **Rationale**: es un uso individual. Coordinar pestañas (evento `storage`, bloqueos) sería
  complejidad anticipada.

## R10. Uso en móvil (FR-024 – FR-026)

- **Decision**: diseño *mobile-first* con CSS propio (sin framework): una columna por defecto y un
  `@media (min-width: 768px)` para escritorio. `<meta name="viewport" content="width=device-width,
  initial-scale=1">`. En el móvil, la tabla de líneas se muestra como tarjetas apiladas (una por
  línea) y la navegación como una barra de tres botones. Campos numéricos con
  `inputmode="decimal"` para que aparezca el teclado numérico con coma. Zonas táctiles de 44 px
  como mínimo.
- **PDF en móvil**: se sigue usando `doc.save()` de jsPDF. En Chrome Android descarga el archivo;
  en Safari iPhone abre el visor de PDF del sistema, desde donde se guarda en Archivos o se
  comparte. Las dos cosas cumplen FR-025. El PDF es A4 y no depende del tamaño de pantalla
  (FR-026).
- **Logo en móvil**: `<input type="file" accept="image/png,image/jpeg">` permite elegir de la
  galería o hacer una foto; la reducción a 600 × 200 px (R2) evita guardar fotos de varios MB.
- **Rationale**: con 4 pantallas de formularios, unas pocas reglas CSS bastan. Bootstrap o
  Tailwind añadirían dependencias sin ganancia real (principio I).
- **Alternatives considered**: app nativa o PWA instalable (rechazado: fuera de alcance y
  complejidad anticipada); framework CSS (rechazado: dependencia innecesaria).
- **Riesgo**: en Safari de iPhone, `localStorage` se puede borrar si la web no se usa en 7 días
  (política ITP de Apple). El aviso de FR-022 lo cubre en parte; se añade a su texto la frase «En
  iPhone, Safari puede borrarlos si no usas la app durante unos días».
