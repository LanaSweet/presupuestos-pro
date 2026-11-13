# Implementation Plan: Página de inicio, navegación común y rediseño visual

**Branch**: `002-inicio-rediseno-visual` | **Date**: 2026-11-11 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-inicio-rediseno-visual/spec.md`

## Summary

Cambio solo de la capa de presentación de la app de la spec 001:
- Página de inicio con un botón «Nuevo presupuesto», accesos a las tres secciones y recuentos por
  estado.
- Navegación común arriba: barra en el escritorio y menú ☰ en el móvil.
- Rediseño visual con tokens de diseño definidos una sola vez en `styles.css`.
- La misma paleta y la misma escala tipográfica en la plantilla del PDF.

La lógica (`money`, `totals`, `quotes`), el almacenamiento (`store`, `logo`), el formato de los
datos y las pruebas existentes no se tocan. Las decisiones están en [research.md](research.md).

## Technical Context

Se heredan sin cambios de [specs/001-presupuestos-pdf/plan.md](../001-presupuestos-pdf/plan.md)
(lenguaje, dependencias, almacenamiento, pruebas, plataformas, tipo de proyecto y restricciones) y
de [data-model.md](../001-presupuestos-pdf/data-model.md). Solo se añade lo propio de esta feature:

**Archivos que puede tocar** (ver research R1): `index.html`, `styles.css`, `src/app.js` (rutas y
navegación), `src/views/*` (incluidas las vistas nuevas) y `src/pdf.js` (plantilla del PDF).

**Archivos intocables**: `src/money.js`, `src/totals.js`, `src/quotes.js`, `src/store.js`,
`src/logo.js`, `tests/`, `vendor/` y `package.json`.

**Dependencias nuevas**: ninguna. Sin fuentes web ni recursos externos.

**Performance Goals**: la página de inicio se pinta sin espera apreciable con cientos de
presupuestos (un recorrido por la lista en memoria).

**Constraints**: contraste AA (verificado en research R4); tokens solo en `:root`, nunca redefinidos
en `@media` (para que el PDF salga igual en todos los dispositivos, FR-026).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento | Estado |
|---|---|---|
| I. Simplicidad ante todo | Sin dependencias ni fuentes nuevas. Paleta en variables CSS que el PDF lee en el momento de generarlo, sin generador de temas ni paso de compilación (R3). Una vista nueva y un ayudante de etiqueta de estado | ✅ |
| II. Idioma y mercado | Textos nuevos en español de España, escritos directamente. Formatos de importes y fechas sin cambios | ✅ |
| III. Cero alcance fantasma | Cada elemento nuevo se apoya en un FR (tabla en [contracts/ui.md](contracts/ui.md)). Los colores reservados de los cuatro estados futuros son tokens sin uso, como exige FR-104. No se añade numeración de páginas ni contenido nuevo al PDF (FR-120) | ✅ |
| IV. Verificable por una persona no técnica | [quickstart.md](quickstart.md) § 2: pasos ejecutables solo con la app, el PDF y la impresión en escala de grises | ✅ |
| V. Datos del usuario | No se pide ni se guarda ningún dato nuevo; los recuentos se calculan al vuelo | ✅ |

**Re-check post-diseño (Phase 1)**: los contratos y el quickstart cumplen los cinco principios. La
tabla de Complexity Tracking queda vacía.

## Project Structure

### Documentation (this feature)

```text
specs/002-inicio-rediseno-visual/
├── plan.md              # Este archivo
├── research.md          # Phase 0
├── data-model.md        # Phase 1 (sin cambios de datos; solo el recuento derivado)
├── quickstart.md        # Phase 1
├── contracts/
│   ├── ui.md            # Cambios de rutas, navegación, inicio y estados respecto a la 001
│   ├── design-tokens.md # Paleta, tipografía, espaciado y su uso
│   └── pdf.md           # Plantilla del PDF rediseñada
└── tasks.md             # Phase 2 (/speckit-tasks; no lo crea este comando)
```

### Source Code (repository root)

Solo se listan los archivos que cambian o se crean; el resto sigue como en la 001.

```text
index.html               # Cabecera común: marca, botón ☰ y 4 enlaces (Inicio primero)
styles.css               # Reescrito: tokens en :root + componentes, mobile-first
src/
├── app.js               # Ruta por defecto «inicio», menú ☰, ruta desconocida → inicio
├── pdf.js               # Plantilla nueva; lee los tokens de color con getComputedStyle
└── views/
    ├── home.js          # NUEVA: #/ — inicio, «Nuevo presupuesto», resumen y accesos
    ├── status-badge.js  # NUEVA: etiqueta de estado común (lista, edición e inicio)
    ├── quote-list.js    # Usa status-badge; clases de jerarquía
    ├── quote-editor.js  # Usa status-badge; clases de jerarquía y total destacado
    ├── catalog.js       # Solo clases de jerarquía si hace falta
    └── profile.js       # Solo clases de jerarquía si hace falta
```

**Structure Decision**: se mantiene el proyecto estático de la 001. No hay carpeta `public/`: los
archivos servidos están en la raíz (`index.html`, `styles.css`, `src/`), así que la restricción
«solo `public/` y la plantilla del PDF» se aplica como «solo los archivos de presentación» (R1).

## Supuestos del plan

- Tras guardar el perfil la primera vez, la app sigue yendo a `#/presupuestos`, como fija el
  contrato de la 001; no se cambia ese comportamiento.
- `node --test tests/` debe seguir en verde sin modificar ninguna prueba: es la prueba de que la
  lógica no ha cambiado (SC-104).

## Complexity Tracking

Sin violaciones de la constitución que justificar.
