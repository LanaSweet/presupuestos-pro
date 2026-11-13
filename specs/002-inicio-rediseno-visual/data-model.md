# Data Model: Página de inicio, navegación común y rediseño visual

**Sin cambios.** Las entidades, los campos, las transiciones de estado y el formato guardado son
los de [specs/001-presupuestos-pdf/data-model.md](../001-presupuestos-pdf/data-model.md) y
[contracts/storage.md](../001-presupuestos-pdf/contracts/storage.md). No se añade, se renombra ni
se migra ningún campo (FR-123).

## Derivado de presentación (no se guarda)

**Resumen de actividad** (página de inicio, FR-103 y FR-104). Se calcula al pintar la vista:

| Dato | Cálculo | Texto en pantalla |
|---|---|---|
| Borrador | nº de `quotes` con `status = 'draft'` | «Borrador» |
| Emitido | nº de `quotes` con `status = 'issued'` | «Emitido» |
| Total | nº de `quotes` | «Total» |

Borrador + Emitido = Total siempre, porque `status` solo admite esos dos valores.

**Etiqueta de estado**: `draft` → «Borrador» y `issued` → «Emitido». Es la misma correspondencia
que ya usaban la lista y la edición, ahora en un único ayudante (`views/status-badge.js`).
