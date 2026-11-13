# Implementation Plan: PresupuestosPro v0 — presupuestos en PDF para freelancers

**Branch**: `001-presupuestos-pdf` | **Date**: 2026-11-09 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-presupuestos-pdf/spec.md`

## Summary

Web estática para que un freelancer cree presupuestos con IVA por línea y retención de IRPF, y
los descargue en PDF. El enfoque sigue la constitución, con la simplicidad ante todo:
- HTML, CSS y JavaScript con módulos ES, sin framework, sin backend y sin paso de compilación.
- Datos en `localStorage`.
- PDF con una única dependencia (jsPDF, guardada en el proyecto).
- Dinero en aritmética entera, con redondeo de medio céntimo hacia arriba.
- Pruebas de la lógica con el runner integrado de Node.

Detalle de las decisiones en [research.md](research.md).

## Technical Context

**Language/Version**: JavaScript ES2022 (módulos ES nativos del navegador), HTML5 y CSS3

**Primary Dependencies**: jsPDF 2.5.1 (archivo UMD en `vendor/`, sin CDN). Ninguna más.

**Storage**: `localStorage`, clave `presupuestospro:v1` ([contracts/storage.md](contracts/storage.md))

**Testing**: `node --test` (runner integrado de Node 20+) para la lógica pura; validación
funcional manual con [quickstart.md](quickstart.md)

**Target Platform**: navegadores actuales de escritorio (Chrome, Firefox, Edge, Safari) y de móvil (Safari iPhone, Chrome Android), con pantallas de 360 px de ancho o más

**Project Type**: aplicación web estática de una sola página (sin servidor de aplicación)

**Performance Goals**: recálculo de totales y cambio de pantalla percibidos como inmediatos;
generación del PDF en menos de 2 s

**Constraints**: funciona sin red una vez cargada; no envía datos fuera del navegador; usa menos
de 5 MB de `localStorage` (logo reducido y sin duplicar, ver research R2)

**Scale/Scope**: 1 usuario por navegador, 4 pantallas con diseño adaptable a móvil (mobile-first, ver research R10), cientos de presupuestos al año como máximo

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento | Estado |
|---|---|---|
| I. Simplicidad ante todo | Sin framework, sin backend y sin compilación. Una sola dependencia, justificada en R3 (la alternativa sin dependencias rompe la regla de emisión). Dinero con enteros en lugar de una librería decimal | ✅ |
| II. Idioma y mercado (v0 solo español, euro) | Textos de interfaz y PDF en español escritos directamente, sin sistema de traducciones (no se anticipa el multiidioma). Solo euro. Formato `1.500,00 €` | ✅ |
| III. Cero alcance fantasma | Cada pantalla y acción de [contracts/ui.md](contracts/ui.md) se apoya en un FR o escenario de la spec (nota 1 resuelta) | ✅ |
| IV. Verificable por una persona no técnica | [quickstart.md](quickstart.md) § 2: 22 pasos (19 generales y 3 de móvil) usando solo la app y el PDF, cada uno ligado a un CA, FR o SC | ✅ |
| V. Datos del usuario | Solo los campos de la spec. Sin red, sin claves ni secretos, sin variables de entorno | ✅ |

**Nota 1 (resuelta el 2026-11-11)**: la confirmación antes de emitir, el aviso de
almacenamiento lleno y la recuperación de datos dañados ya están en la spec (FR-027, FR-028 y
FR-029), así que no son alcance fantasma.

**Re-check post-diseño (Phase 1)**: data model, contratos y quickstart revisados contra los cinco
principios; sin violaciones nuevas. La tabla de Complexity Tracking queda vacía.

## Project Structure

### Documentation (this feature)

```text
specs/001-presupuestos-pdf/
├── plan.md              # Este archivo
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── storage.md       # Formato del documento en localStorage
│   └── ui.md            # Pantallas, acciones y contenido del PDF
└── tasks.md             # Phase 2 (/speckit-tasks; no lo crea este comando)
```

### Source Code (repository root)

```text
index.html               # Shell: navegación y <main> donde se pinta cada vista
styles.css
vendor/
└── jspdf.umd.min.js     # jsPDF 2.5.1
src/
├── app.js               # Arranque y rutas por hash
├── money.js             # roundHalfUp, parseo y formato «1.500,00 €» (lógica pura)
├── totals.js            # Importe de línea, base, IVA por tipo, IRPF, total (lógica pura)
├── quotes.js            # Crear, numerar, emitir, duplicar, borrar, validar (lógica pura)
├── store.js             # Leer y escribir el documento en localStorage
├── logo.js              # Reducir la imagen subida a 600 × 200 px como máximo
├── pdf.js               # Construir el PDF con jsPDF
└── views/
    ├── profile.js
    ├── catalog.js
    ├── quote-list.js
    └── quote-editor.js
tests/
├── money.test.js
├── totals.test.js       # Incluye los ejemplos de la spec: 2.120 / 2.280 / 2.420 / 2.065 / 2,36
└── quotes.test.js       # Numeración, huecos, cambio de año, emisión, duplicado, bloqueos
package.json             # Solo scripts: "test": "node --test tests/", "start": "npx serve ."
```

**Structure Decision**: un único proyecto estático en la raíz. La lógica pura (`money`, `totals`,
`quotes`) no toca el DOM ni `localStorage`, para poder probarla con Node. Las vistas solo pintan
y llaman a esa lógica. No hay capas extra (servicios, repositorios, estado global reactivo): con 4
pantallas no se justifican.

## Supuestos del plan

- Una sola pestaña de la app abierta a la vez; no se coordinan pestañas (research R9).
- La cantidad admite hasta 2 decimales y el precio unitario hasta 3 (necesario para el ejemplo
  0,785 € de la spec).
- `package.json` no declara dependencias; jsPDF se descarga una vez a `vendor/` y se versiona con
  el proyecto.

## Complexity Tracking

Sin violaciones de la constitución que justificar.
