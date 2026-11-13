<!--
Sync Impact Report
Version change: 2.0.0 → 3.0.0
Modified principles:
- II. Idioma y mercado: redefined. v0 is Spanish-only (UI and PDF); ES/EN/DE/FR with Spanish
  as default applies from later versions. Currency unchanged (EUR only).
Added sections: none
Removed sections: none
Dependent artifacts: specs/001-presupuestos-pdf/spec.md (Spanish-only v0) now complies;
its "dependency on the constitution" assumption can be removed.
Deferred TODOs: none
-->
# PresupuestosPro Constitution

## Core Principles

### I. Simplicidad ante todo
Entre dos soluciones, se elige siempre la más simple. Esta es la versión 1: no se añade
complejidad por anticipado (nada de "por si acaso mañana hace falta").

### II. Idioma y mercado
En la primera versión (v0), la app (interfaz y PDF) MUST estar solo en español. A partir de
versiones posteriores, MUST estar disponible en español, inglés, alemán y francés, con el español
por defecto. La moneda es el euro (EUR) y no hay otra.

### III. Cero alcance fantasma
No se implementa ninguna funcionalidad que no esté escrita en la spec. Si surge una idea nueva,
se propone (se añade a la spec o se anota para después); no se construye.

### IV. Verificable por una persona no técnica
Cada criterio de éxito MUST poder comprobarse usando la app, sin leer código ni ejecutar
herramientas técnicas.

### V. Datos del usuario
Solo se piden los datos imprescindibles para generar el presupuesto. Ninguna clave ni secreto
puede estar escrito en el código.

## Producto y alcance

PresupuestosPro es una herramienta web para que freelancers generen presupuestos en PDF.

## Flujo de trabajo

Spec antes que código: `/speckit-specify` → `/speckit-plan` → `/speckit-tasks` →
`/speckit-implement`. Cada revisión comprueba que se cumplen estos cinco principios.

## Governance

Esta constitución prevalece sobre cualquier otra práctica. Se modifica con una propuesta escrita
y la aprobación de la persona responsable del proyecto. Versionado: MAJOR si se elimina o redefine
un principio, MINOR si se añade uno o se amplía su alcance, PATCH para aclaraciones. Se mantiene
corta y en lenguaje claro.

**Version**: 3.0.0 | **Ratified**: 2026-11-05 | **Last Amended**: 2026-11-09
