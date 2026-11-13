# Contract: pantallas (cambios respecto a la 001)

Todo lo que no aparece aquí sigue tal cual en
[specs/001-presupuestos-pdf/contracts/ui.md](../../001-presupuestos-pdf/contracts/ui.md). La
apariencia se rige por [design-tokens.md](design-tokens.md).

## Rutas

| Ruta | Pantalla | Cambio |
|---|---|---|
| `/`, `#`, `#/` | **Inicio** (nueva) | Antes abría la lista de presupuestos |
| `#/presupuestos` | Lista | Sin cambios de comportamiento |
| `#/presupuestos/<id>` | Presupuesto | Sin cambios de comportamiento |
| `#/catalogo` | Catálogo | Sin cambios de comportamiento |
| `#/perfil` | Mi perfil | Sin cambios de comportamiento; tras el primer guardado sigue yendo a `#/presupuestos` |
| cualquier otra | — | Redirige a `#/` (FR-106) |

Primer uso: cualquier ruta, incluida `#/`, redirige al perfil (FR-002, FR-101).

## Cabecera y navegación común (FR-107 a FR-110)

- Va arriba en todas las pantallas: marca «PresupuestosPro» (enlace a `#/`), botón ☰ y los enlaces
  **Inicio**, **Presupuestos**, **Catálogo** y **Mi perfil**, en ese orden.
- La sección actual lleva `aria-current="page"`, el color principal y un subrayado. La edición de
  un presupuesto marca **Presupuestos**.
- **< 768 px**: los enlaces están plegados. El botón ☰ (`aria-label="Menú"`, `aria-expanded`) los
  despliega en un panel bajo la cabecera, uno por fila y de 44 px de alto. El panel se cierra al
  elegir un enlace o al volver a tocar el botón.
- **≥ 768 px**: no hay botón ☰ y los enlaces van en línea a la derecha de la marca.
- Con datos dañados (FR-029), los enlaces y el botón ☰ se ocultan.

## `#/` — Inicio (FR-101 a FR-105)

De arriba abajo:

1. `h1` «Inicio» y botón primario **Nuevo presupuesto**: crea un borrador y abre su edición, igual
   que en la lista.
2. Tarjeta «Tus presupuestos» con tres cifras: **Borrador** (con su etiqueta de estado),
   **Emitido** (con su etiqueta de estado) y **Total**.
   - Sin presupuestos: las tres cifras a 0 y el texto «Todavía no tienes presupuestos. Crea el
     primero con «Nuevo presupuesto».»
3. Tres accesos (tarjetas enlace), cada uno con su título y una línea de ayuda:
   - **Presupuestos**: «Consulta, edita y descarga tus presupuestos».
   - **Catálogo**: «Gestiona tus servicios y sus precios».
   - **Mi perfil**: «Tus datos y tu logo para el PDF».

Las tres cifras se reparten en tantas columnas como quepan: tres a 360 px y menos con el texto
ampliado. Los accesos van en una columna en el móvil y en tres desde 768 px.

## Etiqueta de estado (FR-104, FR-115)

La misma en la lista, en la cabecera del presupuesto y en el inicio: «● Borrador» o «● Emitido»
(ver [design-tokens.md](design-tokens.md), «Etiqueta de estado»).

## Jerarquía por pantalla (FR-114)

| Pantalla | `h1` | `h2` | Acción principal |
|---|---|---|---|
| Inicio | Inicio | Tus presupuestos | Nuevo presupuesto |
| Lista | Presupuestos | — | Nuevo presupuesto |
| Presupuesto | Presupuesto AAAA-NNN | Cliente · Líneas · Resumen | Descargar PDF |
| Catálogo | Catálogo | Servicios | Añadir servicio / Guardar |
| Mi perfil | Mi perfil | — | Guardar |

En la pantalla del presupuesto, el total final del resumen es la cifra más grande de la página
(`--text-total`).

## Trazabilidad

| Elemento | Requisito |
|---|---|
| Ruta `#/` e inicio | FR-101, FR-102, FR-106 |
| Resumen y «Nuevo presupuesto» | FR-103, FR-104, FR-105 |
| Cabecera y menú ☰ | FR-107, FR-108, FR-109, FR-110 |
| Tokens y componentes | FR-111, FR-112, FR-113, FR-116, FR-117 |
| Jerarquía y total | FR-114 |
| Etiqueta de estado | FR-115 |
| Mobile-first | FR-118 |
